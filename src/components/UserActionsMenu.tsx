import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, ExternalLink, Ban, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FreeAccessModal from "@/components/FreeAccessModal";
import { AdminUser } from "@/components/UserTable";

interface UserActionsMenuProps {
  user: AdminUser;
}

export default function UserActionsMenu({ user }: UserActionsMenuProps) {
  const queryClient = useQueryClient();
  const [freeAccessOpen, setFreeAccessOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [loadingFree, setLoadingFree] = useState(false);

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase.rpc("update_user_subscription_status", {
      target_user_id: user.id,
      new_status: newStatus,
    });

    if (error) {
      toast.error("Erro ao alterar status: " + error.message);
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    return true;
  };

  const handleFreeAccess = async () => {
    setLoadingFree(true);
    const ok = await updateStatus("active");
    setLoadingFree(false);
    if (ok) {
      toast.success(`Acesso free vitalício concedido para ${user.name ?? user.email}`);
      setFreeAccessOpen(false);
    }
  };

  const handleBlock = async () => {
    const ok = await updateStatus("canceled");
    if (ok) {
      toast.success(`Conta de ${user.name ?? user.email} bloqueada`);
    }
  };

  const stripeUrl = user.stripe_customer_id
    ? `https://dashboard.stripe.com/customers/${user.stripe_customer_id}`
    : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
            {user.name ?? user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-green-700 focus:text-green-700 focus:bg-green-50"
            onClick={() => setFreeAccessOpen(true)}
            disabled={user.subscription_status === "active"}
          >
            <Gift className="w-4 h-4 mr-2" />
            Dar acesso free vitalício
          </DropdownMenuItem>

          {stripeUrl && (
            <DropdownMenuItem asChild>
              <a href={stripeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no Stripe
              </a>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => setBlockOpen(true)}
            disabled={user.subscription_status === "canceled"}
          >
            <Ban className="w-4 h-4 mr-2" />
            Bloquear conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FreeAccessModal
        open={freeAccessOpen}
        onOpenChange={setFreeAccessOpen}
        userName={user.name}
        onConfirm={handleFreeAccess}
        loading={loadingFree}
      />

      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquear conta</AlertDialogTitle>
            <AlertDialogDescription>
              O acesso de <strong>{user.name ?? user.email}</strong> será revogado imediatamente. Você pode desbloquear depois pelo Stripe ou concedendo acesso free.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
