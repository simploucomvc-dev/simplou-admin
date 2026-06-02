# Simplou Admin Dashboard

Painel administrativo interno do Simplou, acessível apenas por usuários com role `super_admin`. Projeto separado do app principal (`simplou-app-oficial`) mas conectado ao mesmo projeto Supabase.

## Componentes

Antes de criar qualquer componente, consulte **[COMPONENTES.md](./COMPONENTES.md)** — todos os componentes do design system estão documentados lá com exemplos de uso e quando aplicar cada um.

O admin usa os mesmos componentes shadcn/ui do `simplou-app-oficial`. O design system (tokens de cor, tipografia, espaçamento) é idêntico — a aparência deve ser consistente entre os dois projetos.

> O admin é **desktop-first mas responsivo** — pode ser acessado pelo celular. Seguir o mesmo padrão do app principal: `Popover + Command` no desktop, `BottomSheet` no mobile. Usar o hook `useIsMobile` para alternar entre os dois quando necessário.

---

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui (mesmos tokens do app principal)
- Supabase JS (mesmo projeto do app principal)
- TanStack Query
- React Router DOM
- Sonner (toasts)
- Lucide React (ícones)

## Supabase

- **Project ID:** `bjhrbvzpkjgstgpmbtuc`
- **Mesmo projeto** do app principal — mesmas tabelas, mesmas edge functions
- Edge functions usam service role key (bypass RLS)
- Queries do admin devem sempre usar o cliente autenticado como super_admin

## Autenticação

- Login via Supabase Auth (email + senha), mesma conta do app principal
- Acesso restrito a `profile.role === "super_admin"`
- `AdminRoute` em `App.tsx` bloqueia qualquer outro role e redireciona para `/login`
- Não criar fluxo de cadastro — admin é criado manualmente no Supabase

## Estrutura de dados relevante

### Tabela `profiles` (public)
```
id                    uuid (= auth.users.id)
name                  text
phone                 text
company_name          text
role                  text  — 'user' | 'partner' | 'super_admin'
subscription_status   text  — 'waiting' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'free' | 'trial'
stripe_customer_id    text
stripe_subscription_id text
trial_ends_at         timestamptz
subscription_ends_at  timestamptz
created_at            timestamptz
```

### Tabela `auth.users` (schema auth — não exposta via RLS)
- `email` fica aqui, não em `profiles`
- Para buscar email: `JOIN auth.users u ON u.id = p.id`
- Queries que acessam `auth.users` devem rodar via service role (edge function) ou via SQL direto no Supabase

### Tabelas de uso (para métricas por usuário)
- `products` — tem `user_id`, contar por usuário
- `transactions` — tem `user_id` e `created_at`, contar e pegar última

## Plano de desenvolvimento por fases

---

### Fase 1 — Visibilidade (read-only)

**Objetivo:** ver todos os usuários e entender quem está ativo.

**Tela: `/admin/usuarios`**

Tabela com colunas:
- Nome
- Email
- Telefone
- Status (badge colorido por status)
- Data de cadastro
- Nº de produtos cadastrados
- Nº de transações
- Data da última transação
- Chegou ao checkout? (stripe_customer_id não nulo)

Filtros:
- Por status: todos / waiting / trialing / active / canceled / free / trial
- Busca por nome ou email

Query base:
```sql
SELECT
  p.id, p.name, p.phone, p.company_name,
  p.subscription_status, p.stripe_customer_id,
  p.stripe_subscription_id, p.created_at,
  u.email,
  COUNT(DISTINCT pr.id) as total_produtos,
  COUNT(DISTINCT t.id) as total_transacoes,
  MAX(t.created_at) as ultima_transacao
FROM profiles p
JOIN auth.users u ON u.id = p.id
LEFT JOIN products pr ON pr.user_id = p.id
LEFT JOIN transactions t ON t.user_id = p.id
WHERE p.role = 'user'
GROUP BY p.id, u.email
ORDER BY p.created_at DESC
```

**Componentes a criar:**
- `src/pages/UsersPage.tsx` — página principal
- `src/components/UserTable.tsx` — tabela com filtros e busca
- `src/components/StatusBadge.tsx` — badge por status com cor
- `src/components/AdminLayout.tsx` — layout base com sidebar simples

**Cores por status:**
- `waiting` → amarelo/amber
- `trialing` → azul
- `active` → verde
- `canceled` / `past_due` → vermelho
- `free` / `trial` → cinza

---

### Fase 2 — Ações + Stripe

**Objetivo:** agir sobre os usuários sem precisar sair do admin.

**Ações por usuário (dropdown ou modal de detalhe):**
1. **Mudar status manualmente** — dropdown: `waiting | trialing | active | canceled | free`
   - UPDATE direto em `profiles.subscription_status`
   - Confirmar antes de executar
2. **Abrir no Stripe** — botão que abre `https://dashboard.stripe.com/customers/{stripe_customer_id}` em nova aba (só visível se `stripe_customer_id` não for nulo)
3. **Bloquear conta** — seta status para `canceled`
4. **Dar acesso free** — seta status para `active` sem subscription no Stripe (casos especiais)

**Componentes a criar:**
- `src/components/UserActionsMenu.tsx` — dropdown de ações por linha
- `src/components/ChangeStatusModal.tsx` — modal de confirmação ao mudar status

**Segurança:**
- Ações de UPDATE chamam edge function ou usam Supabase client com service role
- Nunca atualizar diretamente pelo client do browser campos protegidos pela RLS (subscription_status é bloqueado para usuários comuns — mas super_admin provavelmente passa, verificar policy)

---

### Fase 3 — Métricas financeiras

**Objetivo:** acompanhar saúde do negócio.

**Tela: `/admin/metricas`**

Cards de topo:
- MRR atual (contar `active` × R$19,90 + `trialing` × R$0)
- Total de usuários pagantes (`active`)
- Total em trial (`trialing`)
- Total aguardando (`waiting`)
- Churn do mês (cancelamentos no mês atual)

Gráficos:
- Novos cadastros por mês (linha)
- Novos pagantes por mês (linha)
- Distribuição de status atual (pizza ou barras)

Query MRR:
```sql
SELECT COUNT(*) * 19.90 as mrr
FROM profiles
WHERE subscription_status = 'active'
```

Query crescimento mensal:
```sql
SELECT
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as novos_usuarios
FROM profiles
WHERE role = 'user'
GROUP BY mes
ORDER BY mes DESC
LIMIT 12
```

**Componentes a criar:**
- `src/pages/MetricsPage.tsx`
- `src/components/MetricCard.tsx`
- Gráficos com Recharts (já é dependência via shadcn/ui chart)

---

## Estrutura de pastas sugerida

```
src/
├── components/
│   ├── ui/               # shadcn/ui — já copiado
│   ├── AdminLayout.tsx   # layout base com sidebar
│   ├── StatusBadge.tsx
│   ├── UserTable.tsx
│   ├── UserActionsMenu.tsx
│   └── ChangeStatusModal.tsx
├── contexts/
│   └── AuthContext.tsx   # copiado do app principal
├── lib/
│   ├── supabase.ts       # copiado do app principal
│   └── utils.ts
├── pages/
│   ├── LoginPage.tsx     # login simples, sem cadastro
│   ├── UsersPage.tsx     # Fase 1
│   └── MetricsPage.tsx   # Fase 3
├── App.tsx
└── main.tsx
```

## Decisões técnicas

- **Sem cadastro público** — login direto, sem rota `/registro`
- **Email no auth.users** — queries que precisam de email fazem JOIN com `auth.users`
- **Stripe pelo link** — não integrar Stripe API no admin agora, usar links diretos pro dashboard do Stripe
- **Sem paginação na Fase 1** — base de usuários pequena, carregar tudo de uma vez
- **TanStack Query** para cache e refetch automático das queries

## Como rodar

```bash
npm install
npm run dev
```
