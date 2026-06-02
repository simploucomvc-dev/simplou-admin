import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import UserTable, { AdminUser } from "@/components/UserTable";
import { Users } from "lucide-react";
import { toast } from "sonner";

async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("get_admin_users_list");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminUser[];
}

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    staleTime: 60_000,
  });

  if (error) {
    toast.error("Erro ao carregar usuários");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Todos os usuários cadastrados na plataforma
          </p>
        </div>
      </div>

      <UserTable users={users} isLoading={isLoading} />
    </div>
  );
}
