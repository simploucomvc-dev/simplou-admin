import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  Users,
  Clock,
  Hourglass,
  TrendingDown,
  Gift,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// --- tipos ---

interface AdminMetrics {
  mrr: number;
  total_active: number;
  total_trialing: number;
  total_waiting: number;
  total_canceled: number;
  total_free: number;
  total_users: number;
  churn_this_month: number;
}

interface MonthlyGrowth {
  mes: string;
  novos_cadastros: number;
  novos_pagantes: number;
}

// --- fetchers ---

async function fetchMetrics(): Promise<AdminMetrics> {
  const { data, error } = await supabase.rpc("get_admin_metrics");
  if (error) throw new Error(error.message);
  return (data as AdminMetrics[])[0];
}

async function fetchMonthlyGrowth(): Promise<MonthlyGrowth[]> {
  const { data, error } = await supabase.rpc("get_admin_monthly_growth");
  if (error) throw new Error(error.message);
  return (data ?? []) as MonthlyGrowth[];
}

// --- formatadores ---

const formatMrr = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

const formatMonth = (iso: string) =>
  format(new Date(iso), "MMM/yy", { locale: ptBR });

// --- cores do gráfico de pizza ---

const PIE_COLORS: Record<string, string> = {
  Ativos:      "#22c55e",
  "Em trial":  "#3b82f6",
  Aguardando:  "#f59e0b",
  Cancelados:  "#ef4444",
  Free:        "#94a3b8",
};

export default function MetricsPage() {
  const {
    data: metrics,
    isLoading: loadingMetrics,
    error: metricsError,
  } = useQuery({ queryKey: ["admin-metrics"], queryFn: fetchMetrics, staleTime: 60_000 });

  const {
    data: growth = [],
    isLoading: loadingGrowth,
    error: growthError,
  } = useQuery({ queryKey: ["admin-growth"], queryFn: fetchMonthlyGrowth, staleTime: 60_000 });

  if (metricsError || growthError) toast.error("Erro ao carregar métricas");

  const growthFormatted = growth.map((g) => ({
    ...g,
    label: formatMonth(g.mes),
  }));

  const pieData = metrics
    ? [
        { name: "Ativos",     value: Number(metrics.total_active) },
        { name: "Em trial",   value: Number(metrics.total_trialing) },
        { name: "Aguardando", value: Number(metrics.total_waiting) },
        { name: "Cancelados", value: Number(metrics.total_canceled) },
        { name: "Free",       value: Number(metrics.total_free) },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Métricas</h1>
          <p className="text-sm text-muted-foreground">Saúde financeira e crescimento da plataforma</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="MRR"
          value={metrics ? formatMrr(metrics.mrr) : "—"}
          description="Receita recorrente mensal"
          icon={DollarSign}
          iconClassName="bg-green-100 text-green-700"
          isLoading={loadingMetrics}
        />
        <MetricCard
          title="Pagantes"
          value={metrics?.total_active ?? "—"}
          description="Assinaturas ativas"
          icon={Users}
          iconClassName="bg-green-100 text-green-700"
          isLoading={loadingMetrics}
        />
        <MetricCard
          title="Em trial"
          value={metrics?.total_trialing ?? "—"}
          description="Usuários em período trial"
          icon={Clock}
          iconClassName="bg-blue-100 text-blue-700"
          isLoading={loadingMetrics}
        />
        <MetricCard
          title="Aguardando"
          value={metrics?.total_waiting ?? "—"}
          description="Cadastrados sem plano"
          icon={Hourglass}
          iconClassName="bg-amber-100 text-amber-700"
          isLoading={loadingMetrics}
        />
        <MetricCard
          title="Churn no mês"
          value={metrics?.churn_this_month ?? "—"}
          description="Cancelamentos este mês"
          icon={TrendingDown}
          iconClassName="bg-red-100 text-red-700"
          isLoading={loadingMetrics}
        />
        <MetricCard
          title="Acesso free"
          value={metrics?.total_free ?? "—"}
          description="Acesso vitalício concedido"
          icon={Gift}
          iconClassName="bg-slate-100 text-slate-600"
          isLoading={loadingMetrics}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Crescimento mensal */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Crescimento mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGrowth ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={growthFormatted} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="novos_cadastros"
                    name="Novos cadastros"
                    stroke="#56CC06"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="novos_pagantes"
                    name="Novos pagantes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribuição de status</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
