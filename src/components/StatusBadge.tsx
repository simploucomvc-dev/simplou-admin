import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SubscriptionStatus = "active" | "trialing" | "waiting" | "past_due" | "canceled" | "free" | "trial";

const statusConfig: Record<SubscriptionStatus, { label: string; className: string }> = {
  active:   { label: "Ativo",             className: "bg-green-100 text-green-700 border-green-200" },
  trialing: { label: "Em trial",          className: "bg-blue-100 text-blue-700 border-blue-200" },
  waiting:  { label: "Aguardando",        className: "bg-amber-100 text-amber-700 border-amber-200" },
  past_due: { label: "Pagto. atrasado",   className: "bg-red-100 text-red-700 border-red-200" },
  canceled: { label: "Cancelado",         className: "bg-red-100 text-red-700 border-red-200" },
  free:     { label: "Free",             className: "bg-slate-100 text-slate-600 border-slate-200" },
  trial:    { label: "Trial (legado)",    className: "bg-slate-100 text-slate-600 border-slate-200" },
};

interface StatusBadgeProps {
  status: string | null | undefined;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as SubscriptionStatus] ?? {
    label: status ?? "—",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium border", config.className)}
    >
      {config.label}
    </Badge>
  );
}
