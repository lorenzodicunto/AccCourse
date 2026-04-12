// Export PDF — generates a simple PDF from course slides
// Uses a canvas-based approach with browser print API

import { CourseProject } from "@/store/useEditorStore";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/constants/canvas";

/**
 * Generates a printable HTML document and triggers browser print dialog (save as PDF)
 */
export function exportAsPDF(project: CourseProject) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Não foi possível abrir janela de impressão. Verifique o bloqueador de pop-ups.");
  }

  const slidesHtml = project.slides.map((slide, index) => {
    const blocksHtml = slide.blocks.map((block) => {
      const baseStyle = `position:absolute;left:${(block.x / CANVAS_WIDTH) * 100}%;top:${(block.y / CANVAS_HEIGHT) * 100}%;width:${(block.width / CANVAS_WIDTH) * 100}%;height:${(block.height / CANVAS_HEIGHT) * 100}%;`;

      if (block.type === "text") {
        return `<div style="${baseStyle}color:${block.color};font-size:${block.fontSize}px;font-weight:${block.fontWeight};text-align:${block.textAlign};background-color:${block.backgroundColor};line-height:${block.lineHeight};border-radius:${block.borderRadius}px;opacity:${block.opacity};overflow:hidden;padding:8px;box-sizing:border-box;">${block.content}</div>`;
      }

      if (block.type === "image" && block.src) {
        return `<div style="${baseStyle}border-radius:${block.borderRadius || 0}px;overflow:hidden;opacity:${block.opacity};"><img src="${block.src}" alt="${block.alt}" style="width:100%;height:100%;object-fit:${block.objectFit};" /></div>`;
      }

      if (block.type === "shape") {
        const borderRadius = block.shapeType === "circle" ? "50%" : block.shapeType === "rounded-rect" ? "16px" : "0";
        return `<div style="${baseStyle}background-color:${block.fillColor};border-radius:${borderRadius};border:${block.strokeWidth}px solid ${block.strokeColor};opacity:${block.opacity};"></div>`;
      }

      if (block.type === "quiz") {
        return `<div style="${baseStyle}background:#f8fafc;border-radius:12px;padding:16px;box-sizing:border-box;">
          <div style="font-weight:600;font-size:14px;color:#1e293b;margin-bottom:8px;">${block.question}</div>
          ${block.options.map((opt: any, i: number) => `<div style="padding:6px 10px;background:white;border-radius:6px;font-size:12px;margin-bottom:4px;border:1px solid #e2e8f0;">${String.fromCharCode(65 + i)}) ${opt.text}</div>`).join("")}
        </div>`;
      }

      // Fallback
      return `<div style="${baseStyle}background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#94a3b8;">📦 ${block.type}</div>`;
    }).join("");

    return `
      <div class="slide-page" style="page-break-after:always;position:relative;width:${CANVAS_WIDTH}px;height:${CANVAS_HEIGHT}px;background:${slide.background};margin:0 auto 20px;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);font-family:${project.theme.fontFamily};">
        ${blocksHtml}
        <div style="position:absolute;bottom:8px;right:16px;font-size:10px;color:#94a3b8;">Slide ${index + 1} de ${project.slides.length}</div>
      </div>
    `;
  }).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${project.title} — PDF</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f8fafc; padding: 40px; font-family: '${project.theme.fontFamily}', Inter, sans-serif; }
    h1 { text-align: center; font-size: 24px; color: #1e293b; margin-bottom: 8px; }
    .subtitle { text-align: center; font-size: 14px; color: #64748b; margin-bottom: 32px; }
    @media print {
      body { background: white; padding: 0; }
      .slide-page { box-shadow: none !important; margin-bottom: 0 !important; border-radius: 0 !important; }
      h1, .subtitle, .print-btn { display: none; }
    }
    .print-btn { position: fixed; bottom: 20px; right: 20px; background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(124,58,237,0.4); z-index: 100; }
    .print-btn:hover { background: #6d28d9; }
  </style>
</head>
<body>
  <h1>${project.title}</h1>
  <div class="subtitle">${project.description || ""} — ${project.slides.length} slides</div>
  ${slidesHtml}
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
