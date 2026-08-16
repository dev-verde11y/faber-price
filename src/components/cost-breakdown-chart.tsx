"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { formatBRL } from "@/lib/pricing";

interface Props {
  filamentCost: number;
  energyCost: number;
  depreciationCost: number;
  laborCost: number;
}

// Paleta categórica validada (4 primeiros slots do tema padrão — passam CVD/contraste
// em light e dark, ver skill de dataviz). Ordem fixa: nunca ciclar/reordenar por valor.
const SERIES = [
  { key: "filamentCost", label: "Material", light: "#2a78d6", dark: "#3987e5" },
  { key: "energyCost", label: "Energia", light: "#008300", dark: "#008300" },
  { key: "depreciationCost", label: "Depreciação", light: "#e87ba4", dark: "#d55181" },
  { key: "laborCost", label: "Mão de obra", light: "#eda100", dark: "#c98500" },
] as const;

export function CostBreakdownChart({ filamentCost, energyCost, depreciationCost, laborCost }: Props) {
  const values = { filamentCost, energyCost, depreciationCost, laborCost };
  const data = SERIES
    .map((s) => ({ label: s.label, value: values[s.key], light: s.light, dark: s.dark }))
    .filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="viz-root">
      {/* Tema deste projeto é só a classe .dark no <html> (ver theme-provider.tsx) — sem
          data-theme nem media query, então a troca de cor do gráfico segue o mesmo mecanismo. */}
      <style>{`
        .viz-root .bar-cell { fill: var(--cbc-color-light); }
        .dark .viz-root .bar-cell { fill: var(--cbc-color-dark); }
      `}</style>
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 4, bottom: 4 }} barCategoryGap={10}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [formatBRL(Number(value)), "Custo"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
            }}
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false}>
            {data.map((d) => (
              <Cell
                key={d.label}
                className="bar-cell"
                style={{ "--cbc-color-light": d.light, "--cbc-color-dark": d.dark } as React.CSSProperties}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              className="fill-muted-foreground"
              fontSize={11}
              formatter={(value) => (typeof value === "number" ? formatBRL(value) : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
