# Índice de Componentes — Simplou Admin Dashboard

Componentes disponíveis em `src/components/ui/`. Todos foram copiados do `simplou-app-oficial` e compartilham o mesmo design system (tokens de cor, tipografia, espaçamento).

> **O admin é desktop-first mas responsivo** — pode ser acessado pelo celular. Seguir o mesmo padrão do app principal: alternar entre componentes desktop e mobile usando o hook `useIsMobile`.

---

## Regra geral

- Seletores com lista → **Popover + Command** no desktop, **BottomSheet** no mobile
- Modais e formulários → **Dialog** (funciona nos dois)
- Confirmação de exclusão → **SafeDeleteDialog**
- Toasts → sempre `toast` de `'sonner'`
- Tabelas → `Table` no desktop, cards empilhados no mobile
- Status de usuário → `Badge` com cor por status

### Padrão para alternar desktop/mobile
```tsx
import { useIsMobile } from "@/hooks/use-mobile"

const isMobile = useIsMobile()

{isMobile ? (
  <BottomSheet ...>...</BottomSheet>
) : (
  <Popover><Command>...</Command></Popover>
)}

---

## Componentes mais usados no admin

### Exibição de dados

| Componente | Uso |
|---|---|
| `Table` + `TableHeader` + `TableBody` + `TableRow` + `TableCell` + `TableHead` | Tabela principal de usuários (desktop). No mobile, substituir por cards empilhados |
| `Badge` | Status do usuário (`waiting`, `trialing`, `active`, etc.) com variantes de cor |
| `Avatar` + `AvatarImage` + `AvatarFallback` | Foto ou iniciais do usuário |
| `Skeleton` | Loading state das tabelas e cards |
| `Card` + `CardHeader` + `CardContent` | Cards de métricas (MRR, total usuários, etc.) |
| `Chart` | Gráficos de crescimento e distribuição (usa Recharts internamente) |
| `Progress` | Barra de progresso (ex: % de conversão) |

### Ações e Menus

| Componente | Uso |
|---|---|
| `Button` | Botão padrão. Variantes: `default`, `outline`, `ghost`, `destructive` |
| `DropdownMenu` | Menu de ações por linha da tabela (mudar status, abrir no Stripe, etc.) |
| `Dialog` | Modal de detalhes do usuário ou confirmação de ação |
| `AlertDialog` | Confirmação bloqueante. Usar via `SafeDeleteDialog` |
| `SafeDeleteDialog` | Para confirmações de exclusão ou ações irreversíveis |
| `Tooltip` | Dica em ícones de ação |

### Filtros e Busca

| Componente | Uso |
|---|---|
| `Input` | Campo de busca por nome/email |
| `Popover` + `Command` | Seletor com busca (ex: filtro por status) |
| `Tabs` | Filtro por status como abas (ex: Todos / Ativos / Em trial) |
| `Select` | Dropdown simples para filtros |
| `Separator` | Divisor entre seções de filtro |

### Formulários

| Componente | Uso |
|---|---|
| `Input` | Campos de formulário |
| `Label` | Labels de formulário |
| `Select` | Seleção de opções (ex: novo status do usuário) |
| `Switch` | Toggle de configurações |
| `Checkbox` | Seleção múltipla |

### Layout

| Componente | Uso |
|---|---|
| `ScrollArea` | Área com scroll customizado para tabelas longas |
| `Separator` | Linha divisória |
| `Collapsible` / `Accordion` | Seções expansíveis |
| `Tabs` | Navegação entre seções do admin |

### Feedback

| Componente | Uso |
|---|---|
| `Sonner` (provider) + `toast` de `'sonner'` | Toasts de sucesso/erro. `toast.success()`, `toast.error()` |
| `Alert` | Mensagem de alerta inline |
| `Skeleton` | Loading placeholder |

---

## Componentes customizados disponíveis

### `BottomSheet`
```tsx
import { BottomSheet } from "@/components/ui/bottom-sheet"

// Usar no mobile como alternativa ao Popover+Command
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title="Selecionar status"
  searchValue={search}
  onSearchChange={setSearch}
>
  {/* lista de opções */}
</BottomSheet>
```
Disponível para mobile. Sempre condicionar com `useIsMobile()`.

---

### `SafeDeleteDialog`
```tsx
import { SafeDeleteDialog } from "@/components/ui/safe-delete-dialog"

<SafeDeleteDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={handleAction}
  title="Bloquear usuário"
  itemName={user.name}
/>
```
Usar para qualquer ação irreversível: bloquear conta, mudar status, etc.

---

### `ExpandableInput`
```tsx
import { ExpandableInput } from "@/components/ui/expandable-input"
```
Textarea com expansão em modal. Útil se houver campos de observação ou notas sobre usuários.

---

## Tokens de cor (Tailwind)

Usar sempre os tokens, nunca cores hardcoded:

| Token | Uso |
|---|---|
| `bg-brand-primary` / `text-brand-primary` | Verde principal |
| `bg-brand-hover` / `hover:bg-brand-hover` | Verde escuro (hover) |
| `bg-brand-light` | Verde claro (backgrounds sutis) |
| `bg-success` / `text-success` | Verde de sucesso |
| `text-muted-foreground` | Cinza para textos secundários |
| `bg-destructive` | Vermelho para ações destrutivas |
| `border-border` | Borda padrão |
| `bg-background` | Background da página |
| `bg-card` | Background de cards |

---

## Cores de badge por status de usuário

```tsx
const statusConfig = {
  active:    { label: "Ativo",        class: "bg-green-100 text-green-700 border-green-200" },
  trialing:  { label: "Em trial",     class: "bg-blue-100 text-blue-700 border-blue-200" },
  waiting:   { label: "Aguardando",   class: "bg-amber-100 text-amber-700 border-amber-200" },
  past_due:  { label: "Pagto. atrasado", class: "bg-red-100 text-red-700 border-red-200" },
  canceled:  { label: "Cancelado",    class: "bg-red-100 text-red-700 border-red-200" },
  free:      { label: "Free",         class: "bg-slate-100 text-slate-600 border-slate-200" },
  trial:     { label: "Trial (legado)", class: "bg-slate-100 text-slate-600 border-slate-200" },
}
```
