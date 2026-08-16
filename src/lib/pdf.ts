import "server-only";
import PDFDocument from "pdfkit";
import { calculateQuote, formatBRL, type QuoteInput } from "./pricing";

// Separado de pricing.ts porque pdfkit é Node-only — importar isso num Client
// Component quebraria o bundle. calculateQuote/formatBRL continuam puros e
// importáveis dos dois lados.

const NAVY = "#040491";
const MUTED = "#6b7280";

export type PdfAudience = "client" | "internal";

function row(doc: PDFKit.PDFDocument, label: string, value: string, opts?: { bold?: boolean; color?: string }) {
  doc.fontSize(11).font(opts?.bold ? "Helvetica-Bold" : "Helvetica").fillColor(opts?.color ?? "#111827");
  doc.text(label, 50, doc.y, { continued: true, width: 350 });
  doc.text(value, { align: "right" });
  doc.moveDown(0.5);
}

export async function generateQuotePdf(input: QuoteInput, audience: PdfAudience = "client"): Promise<Buffer> {
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

    if (audience === "internal") {
      doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("Material: ", { continued: true });
      doc.font("Helvetica").text(`${input.materialName} (${input.filamentGrams}g a ${formatBRL(input.filamentPricePerKg)}/kg)`);
      doc.moveDown(1.2);

      row(doc, "Custo de filamento", formatBRL(breakdown.filamentCost));
      row(doc, "Custo de energia", formatBRL(breakdown.energyCost));
      if (breakdown.laborCost > 0) row(doc, "Mão de obra", formatBRL(breakdown.laborCost));
      if (breakdown.depreciationCost > 0) row(doc, "Depreciação", formatBRL(breakdown.depreciationCost));
      if (breakdown.fixedCosts > 0) row(doc, "Custos fixos", formatBRL(breakdown.fixedCosts));

      doc.moveDown(0.3);
      doc.strokeColor("#e5e7eb").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      row(doc, "Subtotal", formatBRL(breakdown.subtotal), { color: MUTED });
      if (breakdown.profitMarginPercent > 0) {
        row(doc, `Margem de lucro (${breakdown.profitMarginPercent}%)`, formatBRL(breakdown.profitAmount), { color: MUTED });
      }

      doc.moveDown(0.5);
      doc.strokeColor(NAVY).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      row(doc, "Total", formatBRL(breakdown.total), { bold: true, color: NAVY });
    } else {
      // Orçamento pro cliente: só a descrição da peça e o valor final — nenhuma linha de
      // custo (filamento, energia, mão de obra, margem) chega no PDF que sai da empresa.
      doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("Peça: ", { continued: true });
      doc.font("Helvetica").text(`${input.materialName}, ${input.filamentGrams}g - ${input.printHours}h de impressão`);
      doc.moveDown(1.5);

      doc.strokeColor(NAVY).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.6);
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#111827").text("Valor do orçamento", 50, doc.y, { continued: true, width: 350 });
      doc.fontSize(18).fillColor(NAVY).text(formatBRL(breakdown.total), { align: "right" });
      doc.moveDown(0.6);
      doc.strokeColor(NAVY).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    }

    if (input.notes) {
      doc.moveDown(1.5);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#111827").text("Observações");
      doc.font("Helvetica").fillColor(MUTED).text(input.notes);
    }

    doc.end();
  });
}
