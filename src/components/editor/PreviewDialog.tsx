"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEditorStore, Block } from "@/store/useEditorStore";

export function PreviewDialog() {
  const [open, setOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const project = useEditorStore((s) => s.getCurrentProject());

  const slides = project?.slides ?? [];
  const totalSlides = slides.length;
  const currentSlide = slides[currentSlideIndex];

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentSlideIndex((i) => Math.min(totalSlides - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentSlideIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, totalSlides]);

  useEffect(() => {
    if (open) setCurrentSlideIndex(0);
  }, [open]);

  if (!project) return null;

  const progress = totalSlides > 1 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 100;

  function renderBlock(block: Block) {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${(block.x / 960) * 100}%`,
      top: `${(block.y / 540) * 100}%`,
      width: `${(block.width / 960) * 100}%`,
      height: `${(block.height / 540) * 100}%`,
    };

    switch (block.type) {
      case "text":
        return (
          <div key={block.id} style={{ ...baseStyle, color: block.color, fontSize: `${block.fontSize}px`, fontWeight: block.fontWeight, fontStyle: block.fontStyle, textAlign: block.textAlign as any, backgroundColor: block.backgroundColor, lineHeight: block.lineHeight, letterSpacing: `${block.letterSpacing}px`, borderRadius: `${block.borderRadius}px`, opacity: block.opacity, overflow: "hidden", padding: "8px" }}>
            {block.content}
          </div>
        );
      case "image":
        return (
          <div key={block.id} style={{ ...baseStyle, borderRadius: `${block.borderRadius || 0}px`, overflow: "hidden", opacity: block.opacity }}>
            {block.src && <img src={block.src} alt={block.alt} style={{ width: "100%", height: "100%", objectFit: block.objectFit }} />}
          </div>
        );
      case "video":
        return (
          <div key={block.id} style={{ ...baseStyle, borderRadius: "12px", overflow: "hidden", background: "#000" }}>
            {block.url && <video src={block.url} controls style={{ width: "100%", height: "100%" }} />}
          </div>
        );
      case "shape":
        return (
          <div key={block.id} style={{ ...baseStyle, backgroundColor: block.fillColor, borderRadius: block.shapeType === "circle" ? "50%" : block.shapeType === "rounded-rect" ? "16px" : "0", border: block.strokeWidth ? `${block.strokeWidth}px solid ${block.strokeColor}` : "none", opacity: block.opacity, transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined }} />
        );
      case "audio":
        return (
          <div key={block.id} style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <audio src={block.src} controls style={{ width: "90%" }} />
          </div>
        );
      case "quiz":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #ede9fe, #faf5ff)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#3b0764" }}>{block.question}</div>
            {block.options.map((opt, i) => (
              <div key={opt.id} style={{ padding: "8px 12px", background: "white", borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                {String.fromCharCode(65 + i)}) {opt.text}
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#94a3b8", fontWeight: 500, border: "1px dashed #cbd5e1" }}>
            📦 {block.type}
          </div>
        );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Play className="h-3.5 w-3.5 text-green-500 fill-green-500" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 border-0 rounded-2xl overflow-hidden bg-slate-900 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 backdrop-blur-sm border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">{project.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">
              {currentSlideIndex + 1}/{totalSlides}
            </span>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/5 transition-colors">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Slide area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          <div
            className="relative bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-[960px]"
            style={{
              aspectRatio: "16 / 9",
              backgroundColor: currentSlide?.background || "#ffffff",
              fontFamily: project.theme.fontFamily,
            }}
          >
            {currentSlide?.blocks.map((block) => renderBlock(block))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-800/80 backdrop-blur-sm border-t border-white/5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlideIndex((i) => Math.max(0, i - 1))}
            disabled={currentSlideIndex === 0}
            className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>

          <div className="flex-1 max-w-[400px] mx-4">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${project.theme.primaryColor}, ${project.theme.secondaryColor})` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlideIndex((i) => Math.min(totalSlides - 1, i + 1))}
            disabled={currentSlideIndex === totalSlides - 1}
            className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5"
          >
            Próximo <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
