"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";

/**
 * Calculate relative luminance of a hex color (WCAG 2.1)
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 3) return null;
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.1)
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGLevel(ratio: number): { level: string; color: string; icon: string } {
  if (ratio >= 7) return { level: "AAA", color: "text-emerald-600 bg-emerald-50", icon: "✅" };
  if (ratio >= 4.5) return { level: "AA", color: "text-green-600 bg-green-50", icon: "✓" };
  if (ratio >= 3) return { level: "AA (large)", color: "text-amber-600 bg-amber-50", icon: "⚠" };
  return { level: "Reprovado", color: "text-red-600 bg-red-50", icon: "✗" };
}

export function ContrastChecker() {
  const [open, setOpen] = useState(false);
  const [fg, setFg] = useState("#1a1a2e");
  const [bg, setBg] = useState("#ffffff");

  const project = useEditorStore((s) => s.projects[0]);
  const slide = useEditorStore((s) => s.getCurrentSlide());

  // Auto-detect from selected block
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const block = slide?.blocks.find((b) => b.id === selectedBlockId);

  const ratio = getContrastRatio(fg, bg);
  const wcag = getWCAGLevel(ratio);

  // Find issues in current slide
  const issues: { blockId: string; type: string; fg: string; bg: string; ratio: number }[] = [];
  if (slide) {
    slide.blocks.forEach((b) => {
      if (b.type === "text") {
        const textBg = (b as any).backgroundColor || "transparent";
        const slideBg = slide.background || "#ffffff";
        const effectiveBg = textBg === "transparent" ? slideBg : textBg;
        const textColor = (b as any).color || "#000000";
        const r = getContrastRatio(textColor, effectiveBg);
        if (r < 4.5) {
          issues.push({ blockId: b.id, type: "text", fg: textColor, bg: effectiveBg, ratio: r });
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Eye className="h-3.5 w-3.5 text-emerald-500" />
          Contraste
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5 text-emerald-500" />
            Verificador de Contraste
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color inputs */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Texto (Foreground)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <Input value={fg} onChange={(e) => setFg(e.target.value)} className="h-7 text-xs font-mono" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Fundo (Background)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
                <Input value={bg} onChange={(e) => setBg(e.target.value)} className="h-7 text-xs font-mono" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border overflow-hidden">
            <div style={{ backgroundColor: bg }} className="p-4 text-center">
              <p style={{ color: fg }} className="text-lg font-semibold">Texto de Exemplo</p>
              <p style={{ color: fg }} className="text-xs opacity-80">Lorem ipsum dolor sit amet</p>
            </div>
          </div>

          {/* Result */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Contraste</p>
              <p className="text-2xl font-bold text-slate-900">{ratio.toFixed(2)}:1</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${wcag.color}`}>
              {wcag.icon} WCAG {wcag.level}
            </div>
          </div>

          {/* Requirements */}
          <div className="text-[10px] text-slate-400 space-y-0.5">
            <p>• <strong>AA normal</strong>: ≥ 4.5:1 (texto menor que 18pt)</p>
            <p>• <strong>AA large</strong>: ≥ 3:1 (texto ≥ 18pt ou 14pt bold)</p>
            <p>• <strong>AAA</strong>: ≥ 7:1 (melhor acessibilidade)</p>
          </div>

          {/* Auto-detect issues */}
          {issues.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">
                ⚠ {issues.length} problema(s) neste slide
              </p>
              {issues.map((issue, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded text-[10px] mb-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ background: issue.fg }} />
                    <span>→</span>
                    <div className="w-3 h-3 rounded border" style={{ background: issue.bg }} />
                  </div>
                  <span className="text-red-700">{issue.ratio.toFixed(1)}:1 — Contraste insuficiente</span>
                </div>
              ))}
            </div>
          )}

          {issues.length === 0 && slide && (
            <div className="border-t pt-3">
              <p className="text-[10px] text-emerald-600 font-medium">✅ Todos os textos deste slide passam no WCAG AA!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
