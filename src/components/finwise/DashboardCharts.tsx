import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart as PieIcon, TrendingUp, LineChart as LineIcon, BarChart3, AreaChart as AreaIcon } from "lucide-react";
import { brl } from "@/lib/finwise/format";

const TOOLTIP_BG = "#FFFFFF";
const TOOLTIP_TEXT = "#1E293B";
const TOOLTIP_MUTED = "#64748B";

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const first = payload[0];
  const color = first?.payload?.fill || first?.payload?.color || first?.color || "#3B82F6";
  return (
    <div style={{ background: TOOLTIP_BG, color: TOOLTIP_TEXT, border: `1px solid ${color}`, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", padding: "8px 12px", fontSize: 13, minWidth: 130 }}>
      {label !== undefined && label !== "" && <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>}
      <div style={{ display: "grid", gap: 2 }}>
        {payload.map((p: any, i: number) => {
          const c = p.payload?.fill || p.payload?.color || p.color || color;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ color: TOOLTIP_MUTED, fontSize: 12 }}>{p.name}:</span>
              <span style={{ fontWeight: 700, marginLeft: "auto" }}>{brl(Number(p.value) || 0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div style={{ background: TOOLTIP_BG, color: TOOLTIP_TEXT, border: `1px solid ${data.color}`, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", padding: "10px 12px", fontSize: 13, minWidth: 170 }}>
      <p style={{ marginBottom: 6, fontWeight: 700, color: data.color }}>{data.name}</p>
      <div style={{ display: "grid", gap: 4 }}>
        {data.income > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: "#10B981" }} />
            <span style={{ color: TOOLTIP_MUTED }}>Entradas:</span>
            <span style={{ fontWeight: 700, color: "#10B981", marginLeft: "auto" }}>{brl(data.income)}</span>
          </div>
        )}
        {data.expense > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: "#EF4444" }} />
            <span style={{ color: TOOLTIP_MUTED }}>Saídas:</span>
            <span style={{ fontWeight: 700, color: "#EF4444", marginLeft: "auto" }}>{brl(data.expense)}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #E2E8F0", paddingTop: 4, marginTop: 2 }}>
          <span style={{ color: TOOLTIP_MUTED }}>Total:</span>
          <span style={{ fontWeight: 700, marginLeft: "auto" }}>{brl(data.total)}</span>
        </div>
      </div>
    </div>
  );
}

type ChartType = "line" | "bar" | "pie" | "area";

function EmptyChart({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{label}</div>;
}

function SwitchableChart({
  title, icon, empty, emptyLabel, types, render,
}: {
  title: string;
  icon: React.ReactNode;
  empty: boolean;
  emptyLabel: string;
  types: ChartType[];
  render: (type: ChartType) => React.ReactElement;
}) {
  const [type, setType] = useState<ChartType>(types[0]);
  const iconMap: Record<ChartType, React.ReactNode> = {
    line: <LineIcon className="h-3.5 w-3.5" />,
    bar: <BarChart3 className="h-3.5 w-3.5" />,
    pie: <PieIcon className="h-3.5 w-3.5" />,
    area: <AreaIcon className="h-3.5 w-3.5" />,
  };
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
          {types.map((tp) => (
            <Button key={tp} size="icon" variant={type === tp ? "default" : "ghost"} className="h-7 w-7" onClick={() => setType(tp)} aria-label={tp}>
              {iconMap[tp]}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        {empty ? <EmptyChart label={emptyLabel} /> : (
          <ResponsiveContainer width="100%" height="100%">{render(type)}</ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export type DashboardChartsProps = {
  daily: Array<{ date: string; label: string; total: number }>;
  byCat: Array<{ id: string; name: string; color: string; total: number }>;
  combinedCatMap: Array<{ name: string; color: string; income: number; expense: number; total: number }>;
  labels: { daily: string; byCategory: string; noData: string };
};

export default function DashboardCharts({ daily, byCat, combinedCatMap, labels }: DashboardChartsProps) {
  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-2">
      <SwitchableChart
        title={labels.daily}
        icon={<TrendingUp className="h-4 w-4" />}
        empty={!daily.some((d) => d.total > 0)}
        emptyLabel={labels.noData}
        types={["line", "area", "bar"]}
        render={(type) => {
          if (type === "area") return (
            <AreaChart data={daily} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<CustomChartTooltip />} />
              <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} fill="url(#grad)" isAnimationActive={false} />
            </AreaChart>
          );
          if (type === "bar") return (
            <BarChart data={daily} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<CustomChartTooltip />} />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          );
          return (
            <LineChart data={daily} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<CustomChartTooltip />} />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          );
        }}
      />

      <SwitchableChart
        title={labels.byCategory}
        icon={<PieIcon className="h-4 w-4" />}
        empty={byCat.length === 0}
        emptyLabel={labels.noData}
        types={["pie", "bar", "line"]}
        render={(type) => {
          if (type === "pie") return (
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Pie data={combinedCatMap} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2} isAnimationActive={false}>
                {combinedCatMap.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
            </PieChart>
          );
          if (type === "line") return (
            <LineChart data={byCat} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<CustomChartTooltip />} />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          );
          return (
            <BarChart data={byCat} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} wrapperStyle={{ outline: "none", zIndex: 50 }} content={<CustomChartTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {byCat.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          );
        }}
      />
    </section>
  );
}
