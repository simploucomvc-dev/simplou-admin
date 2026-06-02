import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import UserActionsMenu from "@/components/UserActionsMenu";
import UserDetailSheet from "@/components/UserDetailSheet";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  total_produtos: number;
  total_transacoes: number;
  ultima_transacao: string | null;
}

const STATUS_TABS = [
  { value: "all",      label: "Todos" },
  { value: "active",   label: "Ativos" },
  { value: "trialing", label: "Em trial" },
  { value: "waiting",  label: "Aguardando" },
  { value: "canceled", label: "Cancelados" },
  { value: "free",     label: "Free" },
  { value: "past_due", label: "Atrasados" },
];

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
}

export default function UserTable({ users, isLoading }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchStatus = statusFilter === "all" || u.subscription_status === statusFilter;
      const matchSearch =
        !q ||
        (u.name ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [users, search, statusFilter]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
  };

  const openDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filtro por status */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          {STATUS_TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1 text-xs font-medium border border-border"
            >
              {label}
              <span className="ml-1.5 text-xs opacity-70">
                {value === "all"
                  ? users.length
                  : users.filter((u) => u.subscription_status === value).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tabela */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-40">Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Produtos</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Transações</TableHead>
              <TableHead className="hidden xl:table-cell">Últ. transação</TableHead>
              <TableHead className="hidden xl:table-cell text-center">Checkout</TableHead>
              {/* Colunas de ação — sempre visíveis */}
              <TableHead className="w-24 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/20 cursor-pointer"
                  onClick={() => openDetail(user)}
                >
                  <TableCell className="font-medium text-sm">
                    {user.name ?? <span className="text-muted-foreground italic">Sem nome</span>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {user.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.subscription_status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center text-sm">
                    {user.total_produtos}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center text-sm">
                    {user.total_transacoes}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                    {formatDate(user.ultima_transacao)}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-center">
                    {user.stripe_customer_id ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Sim
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Não</span>
                    )}
                  </TableCell>

                  {/* Ações: "ver detalhes" + menu ⋮ — interrompem propagação do click da linha */}
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground gap-1 hidden sm:flex"
                        onClick={() => openDetail(user)}
                      >
                        Ver detalhes
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:hidden"
                        onClick={() => openDetail(user)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <UserActionsMenu user={user} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {users.length} usuários
        </p>
      )}

      {/* Detail sheet/modal */}
      <UserDetailSheet
        user={selectedUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
