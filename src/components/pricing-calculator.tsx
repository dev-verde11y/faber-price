"use client";

import { useState } from "react";
import { Loader2, Calculator, FileDown, Eraser, Layers, Zap, SlidersHorizontal, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CostBreakdownChart } from "./cost-breakdown-chart";
import { calculateQuote, formatBRL, type QuoteBreakdown } from "@/lib/pricing";
import type { Printer, EnergyFlag, MaterialPreset } from "@/lib/presets";

interface Props {
  printers: Printer[];
  energyFlags: EnergyFlag[];
  materials: MaterialPreset[];
}

const MARGIN_PRESETS = [30, 50, 80, 100];

const DEFAULTS = {
  materialId: "",
  materialName: "",
  filamentPricePerKg: "120.00",
  filamentGrams: "100",
  printerWatts: "200",
  printHours: "5",
  kwhPrice: "0.80",
  laborCost: "0",
  depreciationCost: "0",
  fixedCosts: "0",
  profitMarginPercent: "30",
  clientName: "",
  notes: "",
};

export function PricingCalculator({ printers, energyFlags, materials }: Props) {
  const [form, setForm] = useState(DEFAULTS);
  const [breakdown, setBreakdown] = useState<QuoteBreakdown | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState("");
  // Padrão oculta os custos — o PDF sai pronto pra mandar pro cliente sem vazar
  // margem/composição de preço. Desligar é uma escolha explícita pra uso interno.
  const [hideCostsInPdf, setHideCostsInPdf] = useState(true);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function selectMaterial(materialId: string) {
    const material = materials.find((m) => m.id === materialId);
    setForm((f) => ({
      ...f,
      materialId,
      materialName: material?.name ?? f.materialName,
      filamentPricePerKg: material ? String(material.pricePerKg) : f.filamentPricePerKg,
    }));
  }

  function buildQuoteInput() {
    return {
      clientName: form.clientName || undefined,
      notes: form.notes || undefined,
      materialName: form.materialName || "Material",
      filamentPricePerKg: parseFloat(form.filamentPricePerKg) || 0,
      filamentGrams: parseFloat(form.filamentGrams) || 0,
      printerWatts: parseFloat(form.printerWatts) || 0,
      printHours: parseFloat(form.printHours) || 0,
      kwhPrice: parseFloat(form.kwhPrice) || 0,
      laborCost: parseFloat(form.laborCost) || 0,
      depreciationCost: parseFloat(form.depreciationCost) || 0,
      fixedCosts: parseFloat(form.fixedCosts) || 0,
      profitMarginPercent: parseFloat(form.profitMarginPercent) || 0,
    };
  }

  function handleCalculate() {
    setError("");
    setBreakdown(calculateQuote(buildQuoteInput()));
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true);
    setError("");
    const audience = hideCostsInPdf ? "client" : "internal";
    try {
      const res = await fetch("/api/quote-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildQuoteInput(), audience }),
      });
      if (!res.ok) {
        setError("Erro ao gerar o PDF.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = audience === "internal" ? "relatorio-interno-faber-price.pdf" : "orcamento-faber-price.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  function handleClear() {
    setForm(DEFAULTS);
    setBreakdown(null);
    setError("");
  }

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-6 max-w-4xl">
      {/* Filamento */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
            <Layers className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Filamento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Material de referência</Label>
            <Select value={form.materialId} onValueChange={selectMaterial}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Personalizado" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Preço do Filamento (R$/kg)</Label>
            <Input type="number" step="0.01" min="0" value={form.filamentPricePerKg} onChange={update("filamentPricePerKg")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Quantidade Utilizada (g)</Label>
            <Input type="number" step="1" min="0" value={form.filamentGrams} onChange={update("filamentGrams")} />
          </div>
        </div>
      </div>

      {/* Energia e Tempo */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
            <Zap className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Energia e Tempo</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Consumo da Impressora (W)</Label>
            <Input type="number" step="1" min="0" value={form.printerWatts} onChange={update("printerWatts")} />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {printers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, printerWatts: String(p.watts) }))}
                  className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {p.name} (~{p.watts}W)
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tempo de Impressão (horas)</Label>
            <Input type="number" step="0.1" min="0" value={form.printHours} onChange={update("printHours")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Valor do kWh (R$)</Label>
            <Input type="number" step="0.01" min="0" value={form.kwhPrice} onChange={update("kwhPrice")} />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {energyFlags.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, kwhPrice: String(f.pricePerKwh) }))}
                  className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opcionais */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
            <SlidersHorizontal className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Opcionais</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Mão de Obra (R$)</Label>
            <Input type="number" step="0.01" min="0" value={form.laborCost} onChange={update("laborCost")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Depreciação (R$)</Label>
            <Input type="number" step="0.01" min="0" value={form.depreciationCost} onChange={update("depreciationCost")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Custos Fixos (R$)</Label>
            <Input type="number" step="0.01" min="0" value={form.fixedCosts} onChange={update("fixedCosts")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Margem de Lucro (%)</Label>
            <Input type="number" step="1" min="0" value={form.profitMarginPercent} onChange={update("profitMarginPercent")} />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {MARGIN_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, profitMarginPercent: String(m) }))}
                  className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {m}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orçamento (opcional, pro PDF) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Orçamento (opcional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do cliente</Label>
            <Input value={form.clientName} onChange={update("clientName")} placeholder="Ex: Maria Silva" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea rows={1} value={form.notes} onChange={update("notes")} placeholder="Ex: Peça em 2 cores" className="min-h-9" />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={handleCalculate} className="flex-1">
          <Calculator className="size-4" />
          Calcular Custo
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <Eraser className="size-4" />
          Limpar
        </Button>
      </div>

      {breakdown && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <Row label="Custo de filamento" value={formatBRL(breakdown.filamentCost)} />
            <Row label="Custo de energia" value={formatBRL(breakdown.energyCost)} />
            {breakdown.laborCost > 0 && <Row label="Mão de obra" value={formatBRL(breakdown.laborCost)} />}
            {breakdown.depreciationCost > 0 && <Row label="Depreciação" value={formatBRL(breakdown.depreciationCost)} />}
            {breakdown.fixedCosts > 0 && <Row label="Custos fixos" value={formatBRL(breakdown.fixedCosts)} />}
            <div className="border-t pt-2">
              <Row label="Subtotal" value={formatBRL(breakdown.subtotal)} muted />
              {breakdown.profitMarginPercent > 0 && (
                <Row label={`Margem de lucro (${breakdown.profitMarginPercent}%)`} value={formatBRL(breakdown.profitAmount)} muted />
              )}
            </div>
            <div className="border-t pt-2">
              <Row label="Total" value={formatBRL(breakdown.total)} bold />
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <EyeOff className="size-3.5" />
                Ocultar custos no PDF (orçamento pro cliente)
              </span>
              <Switch checked={hideCostsInPdf} onCheckedChange={setHideCostsInPdf} />
            </div>

            <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={generatingPdf} className="w-full">
              {generatingPdf ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              {hideCostsInPdf ? "Gerar orçamento pro cliente" : "Gerar relatório interno (com custos)"}
            </Button>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Composição do custo</p>
            <CostBreakdownChart
              filamentCost={breakdown.filamentCost}
              energyCost={breakdown.energyCost}
              depreciationCost={breakdown.depreciationCost}
              laborCost={breakdown.laborCost}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "font-bold text-primary text-base" : ""} ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
