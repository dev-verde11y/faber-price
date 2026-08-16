import "server-only";
import PDFDocument from "pdfkit";
import { calculateQuote, formatBRL, type QuoteInput } from "./pricing";

// Separado de pricing.ts porque pdfkit é Node-only — importar isso num Client
// Component quebraria o bundle. calculateQuote/formatBRL continuam puros e
// importáveis dos dois lados.

const NAVY = "#040491";
const MUTED = "#6b7280";

export async function generateQuotePdf(input: QuoteInput): Promise<Buffer> {
  const breakdown = calculateQuote(input);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor(NAVY).fontSize(24).font("Helvetica-Bold").text("FABER Price");
    doc.fillColor(MUTED).fontSize(11).font("Helvetica").text("Orçamento de Impressão 3D");
    doc.moveDown(0.3);
    doc.fontSize(9).text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`);
    doc.moveDown(1);

    doc.strokeColor("#e5e7eb").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    if (input.clientName) {
      doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("Cliente: ", { continued: true });
      doc.font("Helvetica").text(input.clientName);
      doc.moveDown(0.8);
    }

    doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("Material: ", { continued: true });
    doc.font("Helvetica").text(`${input.materialName} (${input.filamentGrams}g a ${formatBRL(input.filamentPricePerKg)}/kg)`);
    doc.moveDown(1.2);

    function row(label: string, value: string, opts?: { bold?: boolean; color?: string }) {
      doc.fontSize(11).font(opts?.bold ? "Helvetica-Bold" : "Helvetica").fillColor(opts?.color ?? "#111827");
      doc.text(label, 50, doc.y, { continued: true, width: 350 });
      doc.text(value, { align: "right" });
      doc.moveDown(0.5);
    }

    row("Custo de filamento", formatBRL(breakdown.filamentCost));
    row("Custo de energia", formatBRL(breakdown.energyCost));
    if (breakdown.laborCost > 0) row("Mão de obra", formatBRL(breakdown.laborCost));
    if (breakdown.depreciationCost > 0) row("Depreciação", formatBRL(breakdown.depreciationCost));
    if (breakdown.fixedCosts > 0) row("Custos fixos", formatBRL(breakdown.fixedCosts));

    doc.moveDown(0.3);
    doc.strokeColor("#e5e7eb").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    row("Subtotal", formatBRL(breakdown.subtotal), { color: MUTED });
    if (breakdown.profitMarginPercent > 0) {
      row(`Margem de lucro (${breakdown.profitMarginPercent}%)`, formatBRL(breakdown.profitAmount), { color: MUTED });
    }

    doc.moveDown(0.5);
    doc.strokeColor(NAVY).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    row("Total", formatBRL(breakdown.total), { bold: true, color: NAVY });

    if (input.notes) {
      doc.moveDown(1.5);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827").text("Observações");
      doc.font("Helvetica").fillColor(MUTED).text(input.notes);
    }

    doc.end();
  });
}
