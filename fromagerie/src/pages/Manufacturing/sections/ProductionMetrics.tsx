"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TriangleAlert as AlertTriangle, Calendar as CalendarIcon, Funnel as Filter } from 'lucide-react';
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";
import { PostsProvider, usePosts } from "./../../../integrations/wordpress/WordPressPostsProvider";
import { WP_Query } from "./../../../integrations/wordpress/wp_query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../../../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./../../../components/ui/popover";
import { Calendar } from "./../../../components/ui/calendar";
import { Button } from "./../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../../../components/ui/table";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "./../../../components/ui/chart";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from "recharts";
import { format, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

function ProductionAnalyticsConsumer() {
  const { posts, loading } = usePosts();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCheese, setSelectedCheese] = useState<string>("all");

  
  const filteredData = useMemo(() => {
    return posts.filter((post) => {
      const date = post.customFields?.start_datetime ? parseISO(post.customFields.start_datetime) : null;
      const cheese = post.customFields?.cheese_type;
      
      const matchesDate = !dateRange.from || !dateRange.to || (date && isWithinInterval(date, { start: dateRange.from, end: dateRange.to }));
      const matchesCheese = selectedCheese === "all" || cheese === selectedCheese;
      
      return matchesDate && matchesCheese;
    }).map(post => ({
      id: post.id,
      lot: post.customFields?.lot_number || "N/A",
      date: post.customFields?.start_datetime ? format(parseISO(post.customFields.start_datetime), "dd/MM") : "N/A",
      fullDate: post.customFields?.start_datetime,
      cheeseType: post.customFields?.cheese_type || "Inconnu",
      temp: Number(post.customFields?.heating_temperature) || 0,
      yield: Number(post.customFields?.yield) || 0,
      weight: Number(post.customFields?.cheese_weight_output) || 0,
    })).sort((a, b) => (a.fullDate > b.fullDate ? 1 : -1));
  }, [posts, dateRange, selectedCheese]);

  const cheeseTypes = useMemo(() => {
    const types = new Set(posts.map(p => p.customFields?.cheese_type).filter(Boolean));
    return Array.from(types);
  }, [posts]);

  
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const yields = filteredData.map(d => d.yield);
    const temps = filteredData.map(d => d.temp);
    
    const avgYield = yields.reduce((a, b) => a + b, 0) / yields.length;
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    
    const stdDevYield = Math.sqrt(yields.map(x => Math.pow(x - avgYield, 2)).reduce((a, b) => a + b, 0) / yields.length);
    const stdDevTemp = Math.sqrt(temps.map(x => Math.pow(x - avgTemp, 2)).reduce((a, b) => a + b, 0) / temps.length);

    const anomalies = filteredData.filter(d => 
      Math.abs(d.yield - avgYield) > 2 * stdDevYield || 
      Math.abs(d.temp - avgTemp) > 2 * stdDevTemp
    );

    return { avgYield, avgTemp, anomalies, minYield: Math.min(...yields), maxYield: Math.max(...yields) };
  }, [filteredData]);

  
  const seasonalData = useMemo(() => {
    const seasons = {
      dry: { name: "Sèche (Juin-Sept)", yield: 0, count: 0 },
      humid: { name: "Humide (Oct-Mai)", yield: 0, count: 0 }
    };

    filteredData.forEach(d => {
      const month = d.fullDate ? parseISO(d.fullDate).getMonth() : -1;
      if (month >= 5 && month <= 8) {
        seasons.dry.yield += d.yield;
        seasons.dry.count++;
      } else if (month !== -1) {
        seasons.humid.yield += d.yield;
        seasons.humid.count++;
      }
    });

    return [
      { name: "Saison Sèche", yield: seasons.dry.count ? seasons.dry.yield / seasons.dry.count : 0 },
      { name: "Saison Humide", yield: seasons.humid.count ? seasons.humid.yield / seasons.humid.count : 0 }
    ];
  }, [filteredData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[400px] bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Aucune donnée de fabrication</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-card/50 border border-border/40 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Filtres:</span>
        </div>
        
        <Select value={selectedCheese} onValueChange={setSelectedCheese}>
          <SelectTrigger className="w-[180px] h-9 bg-background border-border/40 rounded-lg">
            <SelectValue placeholder="Type de fromage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {cheeseTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 font-mono text-[10px] uppercase tracking-wider border-border/40 rounded-lg">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd LLL", { locale: fr })} -{" "}
                    {format(dateRange.to, "dd LLL", { locale: fr })}
                  </>
                ) : (
                  format(dateRange.from, "dd LLL", { locale: fr })
                )
              ) : (
                "Période"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {}
        <Card className="bg-card/40 backdrop-blur-sm border-border/40 rounded-lg overflow-hidden shadow-md">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Historique Températures</CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">Suivi du chauffage par lot (°C)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <ChartContainer config={{ temp: { label: "Température", color: "#C96A4A" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(63, 74, 79, 0.1)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#C96A4A" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: "#C96A4A", strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {}
        <Card className="bg-card/40 backdrop-blur-sm border-border/40 rounded-lg overflow-hidden shadow-md">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Statistiques Rendement</CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">Performance moyenne: {stats?.avgYield.toFixed(1)}%</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <ChartContainer config={{ yield: { label: "Rendement", color: "#7E9A9A" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(63, 74, 79, 0.1)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="yield" fill="#7E9A9A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {}
        <Card className="bg-card/40 backdrop-blur-sm border-border/40 rounded-lg overflow-hidden shadow-md">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Comparaison Saisonnière</CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">Impact climatique sur le rendement</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <ChartContainer config={{ yield: { label: "Rendement Moyen", color: "#C96A4A" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={seasonalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(63, 74, 79, 0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="yield" fill="#7E9A9A" radius={[2, 2, 0, 0]} barSize={60} />
                  <Line type="monotone" dataKey="yield" stroke="#C96A4A" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {}
        <Card className="bg-card/40 backdrop-blur-sm border-border/40 rounded-lg overflow-hidden shadow-md">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="font-mono text-xs uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Détection d'Anomalies
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">Lots hors tolérance (±2σ)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="max-h-[240px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/10">
                    <TableHead className="font-mono text-[10px] uppercase">Lot</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase">Type</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Rendement</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase text-right">Temp.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.anomalies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-mono text-[10px] uppercase">
                        Aucune anomalie détectée
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.anomalies.map((anomaly, i) => (
                      <TableRow key={anomaly.id} data-index={i} className="border-border/10 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-mono text-[11px] font-bold">{anomaly.lot}</TableCell>
                        <TableCell className="font-mono text-[11px]">{anomaly.cheeseType}</TableCell>
                        <TableCell className="font-mono text-[11px] text-right text-primary">{anomaly.yield.toFixed(1)}%</TableCell>
                        <TableCell className="font-mono text-[11px] text-right">{anomaly.temp}°C</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductionMetrics() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>({
    threshold: 0.1,
  });

  const wp_query_params = { 
    post_type: "fabrication", 
    per_page: 100, 
    order: "desc", 
    orderby: "date" 
  };
  const wp_query = new WP_Query(wp_query_params);

  return (
    <section data-section-id="4037"
      id="parametertrackinganalytics"
      className="bg-background text-foreground relative py-24 md:py-32 lg:py-40 px-6 md:px-10 lg:px-16 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div ref={ref} className="relative max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-primary">
            02 / ANALYSE DE PRODUCTION
          </span>
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
            DONNÉES RÉELLES
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 md:mb-24">
          <div className="lg:col-span-7">
            <h2 className="font-serif font-medium text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em]">
              La précision au service <br />
              <span className="text-primary italic">du savoir-faire.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:flex lg:items-end">
            <p className="font-sans text-lg md:text-xl leading-relaxed text-muted-foreground max-w-[420px]">
              Analyse en temps réel des paramètres de fabrication. Suivez les rendements, détectez les anomalies et optimisez vos cycles de production grâce à une traçabilité clinique.
            </p>
          </div>
        </div>

        <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <PostsProvider wp_query={{ post_type: "fabrication", per_page: 100, order: "desc", orderby: "date" }}>
            <ProductionAnalyticsConsumer />
          </PostsProvider>
        </div>

        <div className="mt-16 md:mt-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border/40">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            MÉTHODOLOGIE / SYSTÈME DE GESTION FROMAGÈRE V4.2
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-lg bg-primary animate-ping opacity-75" />
              <span className="relative inline-flex rounded-lg h-1.5 w-1.5 bg-primary" />
            </span>
            ANALYSE ACTIVE
          </span>
        </div>
      </div>
    </section>
  );
}