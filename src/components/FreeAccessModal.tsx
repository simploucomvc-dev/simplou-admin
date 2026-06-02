import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface FreeAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string | null;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export default function FreeAccessModal({
  open,
  onOpenChange,
  userName,
  onConfirm,
  loading,
}: FreeAccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Dar acesso free vitalício</DialogTitle>
          <DialogDescription className="sr-only">
            Confirmação de acesso free vitalício
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-amber-800">Atenção: acesso permanente</p>
              <p className="text-amber-700">
                Esse acesso é <strong>vitalício e gratuito</strong> — não há cobrança no Stripe e não expira automaticamente. Só será removido se você bloquear a conta manualmente.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Usuário: <span className="font-medium text-foreground">{userName ?? "—"}</span>
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Concedendo..." : "Confirmar acesso free"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
