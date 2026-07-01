import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { AlertTriangle, Thermometer, TrendingUp, CloudSun, Activity, Calendar } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

const CHEESE_TYPES = ["Camembert", "Brie", "Comté", "Emmental", "Chèvre"] as const;
type CheeseType = (typeof CHEESE_TYPES)[number];
type Granularity = "daily" | "weekly" | "monthly";

const TEMP_TARGETS: Record<CheeseType, number> = {
  Camembert: 33,
  Brie: 34,
  Comté: 54,
  Emmental: 52,
  Chèvre: 31,
};
const TEMP_TOLERANCE = 2.5;

const CHEESE_COLORS: Record<CheeseType, string> = {
  Camembert: "#2b4a1a",
  Brie: "#c44a28",
  Comté: "#d4913a",
  Emmental: "#4a7a8a",
  Chèvre: "#7a4a8a",
};

// ── Deterministic pseudo-random ──────────────────────────────────────────────

function seededNoise(seed: number, amp = 1): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * amp;
}

// ── Data generation ──────────────────────────────────────────────────────────

interface DataPoint {
  label: string;
  date: Date;
  [key: string]: number | string | Date;
}

function generateData(granularity: Granularity): DataPoint[] {
  const now = new Date(2024, 11, 28); // 28 Dec 2024
  const points: DataPoint[] = [];

  let count: number;
  let stepMs: number;
  let fmt: (d: Date) => string;

  if (granularity === "daily") {
    count = 60; // last 60 days
    stepMs = 86400000;
    fmt = (d) =>
      d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } else if (granularity === "weekly") {
    count = 26; // last 26 weeks
    stepMs = 7 * 86400000;
    fmt = (d) => {
      const wn = getWeekNumber(d);
      return `S${wn} ${d.getFullYear()}`;
    };
  } else {
    count = 12;
    stepMs = 30.44 * 86400000;
    fmt = (d) =>
      d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  }

  // Not every period has a production batch (realistic: ~4-5 batches/week for daily)
  const batchProbability = granularity === "daily" ? 0.65 : 1;

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * stepMs);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const seasonal = Math.sin((dayOfYear / 365) * Math.PI * 2);

    // For daily: not all cheeses are made every day
    if (granularity === "daily" && Math.abs(seededNoise(i * 7 + 99)) > batchProbability) continue;

    const entry: DataPoint = { label: fmt(date), date };

    CHEESE_TYPES.forEach((type, ti) => {
      const base = TEMP_TARGETS[type];
      const seed = i * 13.3 + ti * 77.1;
      const drift = seededNoise(seed, 1.8) + seasonal * 0.6;
      entry[type] = +(base + drift).toFixed(1);
    });

    // Global yield + per-cheese yield
    const YIELD_BASES: Record<CheeseType, number> = {
      Camembert: 10.4, Brie: 9.8, Comté: 9.2, Emmental: 9.6, Chèvre: 14.1,
    };
    let sumAvg = 0;
    let sumMin = 0;
    let sumMax = 0;
    CHEESE_TYPES.forEach((type, ti) => {
      const base = YIELD_BASES[type] + seasonal * 0.5;
      const avg = +(base + seededNoise(i * 5.5 + ti * 31, 0.55)).toFixed(2);
      const min = +(avg - 0.45 - Math.abs(seededNoise(i * 3.1 + ti * 17, 0.35))).toFixed(2);
      const max = +(avg + 0.38 + Math.abs(seededNoise(i * 2.7 + ti * 23, 0.35))).toFixed(2);
      entry[`yield_${type}_avg`] = avg;
      entry[`yield_${type}_min`] = min;
      entry[`yield_${type}_max`] = max;
      sumAvg += avg;
      sumMin += min;
      sumMax += max;
    });
    entry.yieldAvg = +(sumAvg / CHEESE_TYPES.length).toFixed(2);
    entry.yieldMin = +(sumMin / CHEESE_TYPES.length).toFixed(2);
    entry.yieldMax = +(sumMax / CHEESE_TYPES.length).toFixed(2);

    points.push(entry);
  }

  // Inject anomalies at deterministic positions
  const anomalyIndices = granularity === "daily"
    ? [5, 22, 41]
    : granularity === "weekly"
    ? [3, 14, 20]
    : [2, 7, 10];

  anomalyIndices.forEach((idx, k) => {
    const p = points[Math.min(idx, points.length - 1)];
    if (!p) return;
    if (k === 0) p["Comté"] = +(TEMP_TARGETS["Comté"] + 5.2).toFixed(1);
    if (k === 1) {
      p["yieldAvg"] = 7.8;
      p["yield_Camembert_avg"] = 7.2;
      p["yield_Brie_avg"] = 7.5;
    }
    if (k === 2) p["Camembert"] = +(TEMP_TARGETS["Camembert"] - 4.1).toFixed(1);
  });

  return points;
}

function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
}

// ── Seasonal comparison (static, not affected by granularity) ─────────────────

const seasonalData = CHEESE_TYPES.map((type) => {
  const base: Record<CheeseType, number> = {
    Camembert: 10.4,
    Brie: 9.8,
    Comté: 9.2,
    Emmental: 9.6,
    Chèvre: 14.1,
  };
  return {
    type,
    seche: +(base[type] - 0.4 + seededNoise(type.length * 3, 0.3)).toFixed(2),
    humide: +(base[type] + 0.6 + seededNoise(type.length * 7, 0.4)).toFixed(2),
  };
});

// ── Anomaly detection ─────────────────────────────────────────────────────────

interface Anomaly {
  id: string;
  type: "temp" | "yield";
  severity: "critical" | "warning";
  cheese?: CheeseType;
  label: string;
  value: number;
  expected: number;
  message: string;
}

function detectAnomalies(data: DataPoint[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Temperature anomalies
  data.forEach((row, i) => {
    CHEESE_TYPES.forEach((type) => {
      const val = row[type] as number | undefined;
      if (val === undefined) return;
      const deviation = Math.abs(val - TEMP_TARGETS[type]);
      if (deviation > TEMP_TOLERANCE) {
        anomalies.push({
          id: `temp-${i}-${type}`,
          type: "temp",
          severity: deviation > TEMP_TOLERANCE * 1.6 ? "critical" : "warning",
          cheese: type,
          label: row.label as string,
          value: val,
          expected: TEMP_TARGETS[type],
          message: `Temp. ${val > TEMP_TARGETS[type] ? "trop haute" : "trop basse"} pour ${type} (${row.label}): ${val}°C · cible ${TEMP_TARGETS[type]}°C`,
        });
      }
    });
  });

  // Yield anomalies
  const yields = data.map((r) => r.yieldAvg as number).filter(Boolean);
  if (yields.length > 2) {
    const mean = yields.reduce((s, v) => s + v, 0) / yields.length;
    const stddev = Math.sqrt(yields.reduce((s, v) => s + (v - mean) ** 2, 0) / yields.length);
    data.forEach((row, i) => {
      const val = row.yieldAvg as number;
      if (!val) return;
      if (val < mean - 1.5 * stddev) {
        anomalies.push({
          id: `yield-${i}`,
          type: "yield",
          severity: val < mean - 2 * stddev ? "critical" : "warning",
          label: row.label as string,
          value: +val.toFixed(2),
          expected: +mean.toFixed(2),
          message: `Rendement bas (${row.label}): ${val.toFixed(2)}% · moyenne ${mean.toFixed(2)}%`,
        });
      }
    });
  }

  return anomalies;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded px-3 py-2 shadow-sm text-sm font-mono max-w-[220px]">
      <p className="text-muted-foreground text-xs mb-1.5 font-sans truncate">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-foreground/60 text-xs truncate">{p.name}:</span>
          <span className="font-medium text-foreground ml-auto">
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Granularity badge ─────────────────────────────────────────────────────────

const GRAN_OPTIONS: { id: Granularity; label: string; sub: string }[] = [
  { id: "daily", label: "Journalier", sub: "60 j." },
  { id: "weekly", label: "Hebdomadaire", sub: "26 sem." },
  { id: "monthly", label: "Mensuel", sub: "12 mois" },
];

function GranularityPicker({
  value,
  onChange,
}: {
  value: Granularity;
  onChange: (g: Granularity) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded p-0.5">
      {GRAN_OPTIONS.map((g) => (
        <button
          key={g.id}
          onClick={() => onChange(g.id)}
          className={`flex flex-col items-center px-3 py-1 rounded text-xs transition-colors ${
            value === g.id
              ? "bg-card text-foreground shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{g.label}</span>
          <span className="font-mono text-[10px] opacity-60">{g.sub}</span>
        </button>
      ))}
    </div>
  );
}

// ── Charts ────────────────────────────────────────────────────────────────────

function TempChart({
  data,
  selectedCheese,
  granularity,
}: {
  data: DataPoint[];
  selectedCheese: CheeseType | "all";
  granularity: Granularity;
}) {
  const visible = selectedCheese === "all" ? CHEESE_TYPES : [selectedCheese];
  const tickInterval = granularity === "daily" ? Math.floor(data.length / 10) : granularity === "weekly" ? 3 : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {CHEESE_TYPES.map((type) => (
          <span
            key={type}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border"
            style={{
              borderColor: CHEESE_COLORS[type],
              color: CHEESE_COLORS[type],
              background: `${CHEESE_COLORS[type]}12`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CHEESE_COLORS[type] }} />
            {type} · {TEMP_TARGETS[type]}°C
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,36,20,0.08)" />
          <XAxis
            dataKey="label"
            tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6b6350" }}
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6b6350" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}°`}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: "DM Mono", fontSize: 10 }} iconType="circle" iconSize={6} />
          {visible.map((type) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={CHEESE_COLORS[type]}
              strokeWidth={1.8}
              dot={(props: any) => {
                const val = props.payload[type];
                if (val === undefined) return <g key={props.key} />;
                const isAnomaly = Math.abs(val - TEMP_TARGETS[type]) > TEMP_TOLERANCE;
                return isAnomaly ? (
                  <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#b8200a" stroke="#faf7f0" strokeWidth={1.5} />
                ) : granularity === "monthly" ? (
                  <circle key={props.key} cx={props.cx} cy={props.cy} r={2.5} fill={CHEESE_COLORS[type]} />
                ) : (
                  <g key={props.key} />
                );
              }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs font-mono text-muted-foreground">
        ● Points rouges = température hors norme (±{TEMP_TOLERANCE}°C)
        {granularity === "daily" && " · Jours sans production non représentés"}
      </p>
    </div>
  );
}

function YieldChart({
  data,
  granularity,
  selectedCheese,
}: {
  data: DataPoint[];
  granularity: Granularity;
  selectedCheese: CheeseType | "all";
}) {
  const tickInterval = granularity === "daily" ? Math.floor(data.length / 10) : granularity === "weekly" ? 3 : 0;

  const avgKey = selectedCheese === "all" ? "yieldAvg" : `yield_${selectedCheese}_avg`;
  const minKey = selectedCheese === "all" ? "yieldMin" : `yield_${selectedCheese}_min`;
  const maxKey = selectedCheese === "all" ? "yieldMax" : `yield_${selectedCheese}_max`;
  const color = selectedCheese === "all" ? "#2b4a1a" : CHEESE_COLORS[selectedCheese];

  const yieldVals = data.map((d) => d[avgKey] as number).filter(Boolean);
  const mean = yieldVals.length ? yieldVals.reduce((s, v) => s + v, 0) / yieldVals.length : 10;
  const stddev = Math.sqrt(yieldVals.reduce((s, v) => s + (v - mean) ** 2, 0) / (yieldVals.length || 1));
  const alertThreshold = mean - 1.5 * stddev;

  const yDomain: [number, number] = selectedCheese === "Chèvre" ? [11, 17] : [6, 13];

  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs font-mono text-muted-foreground flex-wrap items-center">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 inline-block" style={{ background: color }} />Moyenne
        </span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-[#d4913a] inline-block opacity-70" />Min</span>
        <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-[#4a7a8a] inline-block opacity-70" />Max</span>
        <span className="ml-auto font-mono text-xs">
          Moy. période: <strong className="text-foreground">{mean.toFixed(2)}%</strong>
          <span className="mx-2 opacity-40">·</span>
          Seuil alerte: <strong className="text-[#c44a28]">{alertThreshold.toFixed(2)}%</strong>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,36,20,0.08)" />
          <XAxis
            dataKey="label"
            tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6b6350" }}
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6b6350" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={yDomain}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={alertThreshold}
            stroke="#c44a28"
            strokeDasharray="4 3"
            strokeOpacity={0.65}
            label={{ value: "seuil alerte", position: "insideTopRight", fontFamily: "DM Mono", fontSize: 9, fill: "#c44a28" }}
          />
          <Area type="monotone" dataKey={maxKey} stroke="none" fill="url(#yieldGrad)" name="Max" />
          <Area type="monotone" dataKey={minKey} stroke="none" fill="#faf7f0" name="Min" />
          <Line
            type="monotone"
            dataKey={avgKey}
            stroke={color}
            strokeWidth={2}
            dot={granularity === "monthly" ? { r: 3, fill: color } : false}
            name="Moy"
            activeDot={{ r: 4 }}
          />
          <Line type="monotone" dataKey={minKey} stroke="#d4913a" strokeWidth={1.2} strokeDasharray="4 2" dot={false} name="Min" />
          <Line type="monotone" dataKey={maxKey} stroke="#4a7a8a" strokeWidth={1.2} strokeDasharray="4 2" dot={false} name="Max" />
        </AreaChart>
      </ResponsiveContainer>

      {/* Per-cheese mini comparison when "all" selected */}
      {selectedCheese === "all" && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CHEESE_TYPES.map((type) => {
            const vals = data.map((d) => d[`yield_${type}_avg`] as number).filter(Boolean);
            const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
            const min = Math.min(...data.map((d) => d[`yield_${type}_min`] as number).filter(Boolean));
            const max = Math.max(...data.map((d) => d[`yield_${type}_max`] as number).filter(Boolean));
            return (
              <div key={type} className="rounded border border-border bg-card px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHEESE_COLORS[type] }} />
                  <span className="text-xs font-medium truncate">{type}</span>
                </div>
                <p className="text-base font-mono font-medium" style={{ color: CHEESE_COLORS[type] }}>{avg.toFixed(2)}%</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{min.toFixed(1)} – {max.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SeasonChart() {
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-[#d4913a] inline-block opacity-80" />Saison sèche</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-3 rounded-sm bg-[#4a7a8a] inline-block opacity-80" />Saison humide</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={seasonalData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,36,20,0.08)" vertical={false} />
          <XAxis dataKey="type" tick={{ fontFamily: "Inter", fontSize: 12, fill: "#1c1a14" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#6b6350" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 16]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="seche" name="Saison sèche" fill="#d4913a" radius={[3, 3, 0, 0]} maxBarSize={36} />
          <Bar dataKey="humide" name="Saison humide" fill="#4a7a8a" radius={[3, 3, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {seasonalData.map((d) => {
          const diff = d.humide - d.seche;
          const pct = ((diff / d.seche) * 100).toFixed(1);
          return (
            <div key={d.type} className="flex items-center justify-between px-3 py-2 rounded border border-border bg-card">
              <span className="text-sm font-medium">{d.type}</span>
              <span className={`text-xs font-mono ${diff > 0 ? "text-[#2b4a1a]" : "text-[#b8200a]"}`}>
                {diff > 0 ? "+" : ""}{pct}% humide
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnomalyPanel({ anomalies }: { anomalies: Anomaly[] }) {
  const criticals = anomalies.filter((a) => a.severity === "critical");
  const warnings = anomalies.filter((a) => a.severity === "warning");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critiques", count: criticals.length, color: "#b8200a" },
          { label: "Alertes", count: warnings.length, color: "#d4913a" },
          { label: "Total", count: anomalies.length, color: "#2b4a1a" },
        ].map((k) => (
          <div key={k.label} className="rounded border p-3 text-center" style={{ borderColor: `${k.color}30`, background: `${k.color}08` }}>
            <p className="text-2xl font-mono font-medium" style={{ color: k.color }}>{k.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {anomalies.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm font-mono">
          Aucune anomalie détectée sur la période
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {[...anomalies].sort((a) => (a.severity === "critical" ? -1 : 1)).map((anomaly) => (
            <div
              key={anomaly.id}
              className="flex gap-3 items-start p-3 rounded border"
              style={{
                background: `${anomaly.severity === "critical" ? "#b8200a" : "#d4913a"}06`,
                borderColor: `${anomaly.severity === "critical" ? "#b8200a" : "#d4913a"}25`,
              }}
            >
              <span className="mt-0.5 shrink-0">
                {anomaly.type === "temp" ? (
                  <Thermometer size={14} style={{ color: anomaly.severity === "critical" ? "#b8200a" : "#d4913a" }} />
                ) : (
                  <Activity size={14} style={{ color: anomaly.severity === "critical" ? "#b8200a" : "#d4913a" }} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{anomaly.message}</p>
                <div className="mt-1 flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  <span>{anomaly.label}</span>
                  {anomaly.cheese && <span className="text-foreground/50">{anomaly.cheese}</span>}
                  <span
                    className="ml-auto px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium"
                    style={{
                      background: `${anomaly.severity === "critical" ? "#b8200a" : "#d4913a"}18`,
                      color: anomaly.severity === "critical" ? "#b8200a" : "#d4913a",
                    }}
                  >
                    {anomaly.severity === "critical" ? "Critique" : "Alerte"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "temp", label: "Températures", icon: Thermometer },
  { id: "yield", label: "Rendements", icon: TrendingUp },
  { id: "season", label: "Saisonnalité", icon: CloudSun },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ── App ───────────────────────────────────────────────────────────────────────

export default function Monitoring() {
  const [activeTab, setActiveTab] = useState<TabId>("temp");
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [selectedCheese, setSelectedCheese] = useState<CheeseType | "all">("all");
  const [selectedYieldCheese, setSelectedYieldCheese] = useState<CheeseType | "all">("all");

  const data = useMemo(() => generateData(granularity), [granularity]);
  const anomalies = useMemo(() => detectAnomalies(data), [data]);
  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;

  const latestYield = data[data.length - 1];
  const latestPoint = data[data.length - 1];

  const tempDevs = CHEESE_TYPES.map((t) => {
    const val = latestPoint?.[t] as number | undefined;
    return val !== undefined ? Math.abs(val - TEMP_TARGETS[t]) : 0;
  });
  const maxDev = Math.max(...tempDevs);

  const yieldKey = selectedYieldCheese === "all" ? "yieldAvg" : `yield_${selectedYieldCheese}_avg`;
  const yieldVals = data.map((d) => d[yieldKey] as number).filter(Boolean);
  const meanYield = yieldVals.length ? yieldVals.reduce((s, v) => s + v, 0) / yieldVals.length : 0;

  const granLabel = { daily: "journalières", weekly: "hebdomadaires", monthly: "mensuelles" }[granularity];
  const periodLabel = { daily: `${data.length} jours`, weekly: `${data.length} semaines`, monthly: `${data.length} mois` }[granularity];

  return (
    <section className="bg-background text-foreground">
      <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className="text-xl sm:text-2xl font-semibold text-foreground leading-tight"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Suivi des Paramètres
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Fromagerie · Données {granLabel} · {periodLabel}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#b8200a]/30 bg-[#b8200a]/8">
                <AlertTriangle size={13} className="text-[#b8200a]" />
                <span className="text-xs font-mono text-[#b8200a]">{criticalCount} critique{criticalCount > 1 ? "s" : ""}</span>
              </div>
            )}
            <GranularityPicker value={granularity} onChange={setGranularity} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: `Rend. moyen${selectedYieldCheese !== "all" ? ` · ${selectedYieldCheese}` : ""} (${periodLabel})`,
              value: `${meanYield.toFixed(2)}%`,
              sub: latestYield ? `dernier: ${(latestYield[yieldKey] as number)?.toFixed(2)}%` : "—",
              color: selectedYieldCheese !== "all" ? CHEESE_COLORS[selectedYieldCheese] : "#2b4a1a",
            },
            {
              label: "Écart temp. max (dernier)",
              value: `${maxDev.toFixed(1)}°C`,
              sub: maxDev > TEMP_TOLERANCE ? "hors norme !" : "dans les normes",
              color: maxDev > TEMP_TOLERANCE ? "#b8200a" : "#2b4a1a",
            },
            {
              label: "Anomalies détectées",
              value: anomalies.length,
              sub: `${criticalCount} critique${criticalCount !== 1 ? "s" : ""}`,
              color: criticalCount > 0 ? "#b8200a" : "#2b4a1a",
            },
            {
              label: "Meilleur rend. humide",
              value: `${Math.max(...seasonalData.map((d) => d.humide)).toFixed(1)}%`,
              sub: seasonalData.reduce((a, b) => (b.humide > a.humide ? b : a)).type,
              color: "#4a7a8a",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded p-3 sm:p-4">
              <p className="text-xs text-muted-foreground leading-snug mb-1">{kpi.label}</p>
              <p className="text-xl sm:text-2xl font-mono font-medium" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? "border-[#2b4a1a] text-[#2b4a1a] font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={13} />
                {label}
                {id === "anomalies" && anomalies.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#b8200a]/15 text-[#b8200a]">
                    {anomalies.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="bg-card border border-border rounded p-4 sm:p-6">
          {/* Granularity note for seasonal tab */}
          {activeTab === "season" && (
            <div className="mb-4 flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/40 rounded px-3 py-2 border border-border">
              <Calendar size={12} />
              La comparaison saisonnière est calculée sur l'ensemble des données, indépendamment de la granularité sélectionnée.
            </div>
          )}

          {activeTab === "temp" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-medium" style={{ fontFamily: "Fraunces, serif" }}>
                    Historique des températures de chauffage
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Température de caillage par type · {periodLabel}</p>
                </div>
                <select
                  value={selectedCheese}
                  onChange={(e) => setSelectedCheese(e.target.value as CheeseType | "all")}
                  className="text-sm font-mono border border-border rounded px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#2b4a1a] shrink-0"
                >
                  <option value="all">Tous les fromages</option>
                  {CHEESE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <TempChart data={data} selectedCheese={selectedCheese} granularity={granularity} />
            </>
          )}

          {activeTab === "yield" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-medium" style={{ fontFamily: "Fraunces, serif" }}>
                    Historique des rendements
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">kg fromage / 100 L lait · moy / min / max · {periodLabel}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedYieldCheese !== "all" && (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border"
                      style={{
                        borderColor: CHEESE_COLORS[selectedYieldCheese],
                        color: CHEESE_COLORS[selectedYieldCheese],
                        background: `${CHEESE_COLORS[selectedYieldCheese]}12`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: CHEESE_COLORS[selectedYieldCheese] }} />
                      {selectedYieldCheese}
                    </span>
                  )}
                  <select
                    value={selectedYieldCheese}
                    onChange={(e) => setSelectedYieldCheese(e.target.value as CheeseType | "all")}
                    className="text-sm font-mono border border-border rounded px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#2b4a1a]"
                  >
                    <option value="all">Tous les fromages</option>
                    {CHEESE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <YieldChart data={data} granularity={granularity} selectedCheese={selectedYieldCheese} />
            </>
          )}

          {activeTab === "season" && (
            <>
              <div className="mb-5">
                <h2 className="text-base font-medium" style={{ fontFamily: "Fraunces, serif" }}>
                  Comparaison saisonnière des rendements
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Saison sèche (Nov–Avr) vs saison humide (Mai–Oct)</p>
              </div>
              <SeasonChart />
            </>
          )}

          {activeTab === "anomalies" && (
            <>
              <div className="mb-5">
                <h2 className="text-base font-medium" style={{ fontFamily: "Fraunces, serif" }}>
                  Détection des anomalies
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Temp. hors norme (±{TEMP_TOLERANCE}°C) · Rendement bas (&lt;μ−1.5σ) · Période: {periodLabel}
                </p>
              </div>
              <AnomalyPanel anomalies={anomalies} />
            </>
          )}
        </div>

        <p className="text-xs font-mono text-muted-foreground text-center pb-4">
          Données simulées · Exercice 2024 · Seuils définis par le cahier des charges de production
        </p>
      </main>
    </div>
  </section>
  );
}
