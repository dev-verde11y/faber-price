import { generateQuotePdf, type PdfAudience } from "@/lib/pdf";
import type { QuoteInput } from "@/lib/pricing";

function isValidInput(body: unknown): body is QuoteInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const positiveNumbers = ["filamentPricePerKg", "filamentGrams", "printerWatts", "printHours", "kwhPrice"];
  return (
    typeof b.materialName === "string" &&
    b.materialName.length > 0 &&
    positiveNumbers.every((k) => typeof b[k] === "number" && (b[k] as number) > 0)
  );
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const audience: PdfAudience =
    body && typeof body === "object" && (body as { audience?: unknown }).audience === "internal"
      ? "internal"
      : "client";

  if (!isValidInput(body)) {
    return Response.json({ message: "Dados inválidos para gerar o orçamento." }, { status: 400 });
  }

  const input: QuoteInput = {
    ...body,
    laborCost: typeof body.laborCost === "number" ? body.laborCost : 0,
    depreciationCost: typeof body.depreciationCost === "number" ? body.depreciationCost : 0,
    fixedCosts: typeof body.fixedCosts === "number" ? body.fixedCosts : 0,
    profitMarginPercent: typeof body.profitMarginPercent === "number" ? body.profitMarginPercent : 0,
  };

  const pdf = await generateQuotePdf(input, audience);
  const filename = audience === "internal" ? "relatorio-interno-faber-price.pdf" : "orcamento-faber-price.pdf";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
