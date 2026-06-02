import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Ban, Gift, Package, ArrowLeftRight, CalendarDays, Phone, Building2, CreditCard } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import StatusBadge from "@/components/StatusBadge";
import FreeAccessModal from "@/components/FreeAccessModal";
import { AdminUser } from "@/components/UserTable";

interface UserDetailSheetProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (iso: string | null) =>
  iso ? format(new Date(iso), "dd/MM/yyyy", { locale: ptBR }) : "—";

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value ?? <span className="text-muted-foreground font-normal">—</span>}</div>
      </div>
    </div>
  );
}

function UserDetailContent({ user, onClose }: { user: AdminUser; onClose: () => void }) {
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
      onClose();
    }
  };

  const handleBlock = async () => {
    const ok = await updateStatus("canceled");
    if (ok) {
      toast.success(`Conta de ${user.name ?? user.email} bloqueada`);
      onClose();
    }
  };

  return (
    <div className="px-4 pb-6 space-y-1">
      {/* Status badge */}
      <div className="flex items-center gap-2 py-3">
        <StatusBadge status={user.subscription_status} />
        {user.stripe_customer_id && (
          <span className="text-xs text-muted-foreground">• Chegou ao checkout</span>
        )}
      </div>

      <Separator />

      {/* Dados do usuário */}
      <DetailRow icon={CalendarDays} label="Cadastrado em" value={fmt(user.created_at)} />
      <DetailRow icon={Phone}        label="Telefone"        value={user.phone} />
      <DetailRow icon={Building2}    label="Empresa"         value={user.company_name} />
      <DetailRow icon={Package}      label="Produtos"        value={`${user.total_produtos} produto${user.total_produtos !== 1 ? "s" : ""}`} />
      <DetailRow
        icon={ArrowLeftRight}
        label="Transações"
        value={
          <>
            {user.total_transacoes} transaç{user.total_transacoes !== 1 ? "ões" : "ão"}
            {user.ultima_transacao && (
              <span className="text-muted-foreground font-normal"> · última em {fmt(user.ultima_transacao)}</span>
            )}
          </>
        }
      />
      {user.stripe_customer_id && (
        <DetailRow icon={CreditCard} label="Stripe ID" value={
          <span className="font-mono text-xs text-muted-foreground">{user.stripe_customer_id}</span>
        } />
      )}

      <Separator className="mt-2" />

      {/* Ações */}
      <div className="pt-3 space-y-2">
        {user.stripe_customer_id && (
          <Button variant="outline" className="w-full gap-2" asChild>
            <a
              href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir no Stripe
            </a>
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full gap-2 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700"
          onClick={() => setFreeAccessOpen(true)}
          disabled={user.subscription_status === "active"}
        >
          <Gift className="w-4 h-4" />
          Dar acesso free vitalício
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setBlockOpen(true)}
          disabled={user.subscription_status === "canceled"}
        >
          <Ban className="w-4 h-4" />
          Bloquear conta
        </Button>
      </div>

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
              O acesso de <strong>{user.name ?? user.email}</strong> será revogado imediatamente.
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
    </div>
  );
}

export default function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
  const isMobile = useIsMobile();

  if (!user) return null;

  const title = user.name ?? user.email;
  const subtitle = user.name ? user.email : undefined;

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
        {subtitle && <p className="px-4 -mt-1 mb-1 text-sm text-muted-foreground">{subtitle}</p>}
        <UserDetailContent user={user} onClose={() => onOpenChange(false)} />
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </DialogHeader>
        <UserDetailContent user={user} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
