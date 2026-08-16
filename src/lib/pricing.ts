// Única fonte de verdade da fórmula de precificação — usada tanto no preview (client)
// quanto na geração do PDF (route handler), pra nunca divergir entre tela e papel.
// Porta 1:1 da lógica de faber-api/src/modules/pricing (calculateQuote/generateQuotePdf),
// sem a parte de CRUD de presets (que aqui vive no client via localStorage, não Postgres).

export interface QuoteInput {
  clientName?: string;
  notes?: string;
  materialName: string;
  filamentPricePerKg: number;
  filamentGrams: number;
  printerWatts: number;
  printHours: number;
  kwhPrice: number;
  laborCost: number;
  depreciationCost: number;
  fixedCosts: number;
  profitMarginPercent: number;
}

export interface QuoteBreakdown {
  filamentCost: number;
  energyCost: number;
  laborCost: number;
  depreciationCost: number;
  fixedCosts: number;
  subtotal: number;
  profitMarginPercent: number;
  profitAmount: number;
  total: number;
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const filamentCost = (input.filamentPricePerKg / 1000) * input.filamentGrams;
  const energyCost = (input.printerWatts / 1000) * input.printHours * input.kwhPrice;
  const laborCost = input.laborCost;
  const depreciationCost = input.depreciationCost;
  const fixedCosts = input.fixedCosts;
  const subtotal = filamentCost + energyCost + laborCost + depreciationCost + fixedCosts;
  const profitAmount = subtotal * (input.profitMarginPercent / 100);
  const total = subtotal + profitAmount;

  return {
    filamentCost,
    energyCost,
    laborCost,
    depreciationCost,
    fixedCosts,
    subtotal,
    profitMarginPercent: input.profitMarginPercent,
    profitAmount,
    total,
  };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
