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
      case "flashcard":
        return (
          <div key={block.id} style={{ ...baseStyle, backgroundColor: block.frontBg || "#fff", color: block.frontColor || "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", border: "1px solid #e2e8f0" }}>
            {block.frontImage && (
              <div style={{ width: "60px", height: "60px", marginBottom: "12px" }}>
                <img src={block.frontImage} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="Flashcard Front" />
              </div>
            )}
            <div style={{ textAlign: "center", fontSize: "16px", fontWeight: 600 }}>{block.frontContent || "Flashcard"}</div>
            <div style={{ marginTop: "16px", fontSize: "10px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "1px" }}>Gire para revelar</div>
          </div>
        );
      case "fillblank":
        return (
          <div key={block.id} style={{ ...baseStyle, backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px", lineHeight: "1.6", color: "#334155" }}>
            {block.segments?.map((seg: any, i: number) => 
               seg.type === "text" 
                 ? <span key={i}>{seg.content}</span> 
                 : <span key={i} style={{ display: "inline-block", borderBottom: "2px solid #cbd5e1", margin: "0 4px", padding: "0 8px", color: "#94a3b8", fontStyle: "italic", fontSize: "14px" }}>Lacuna</span>
            )}
          </div>
        );
      case "truefalse":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", border: "1px solid #a7f3d0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Verdadeiro ou Falso</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "15px", color: "#1e293b", textAlign: "center", fontWeight: 500 }}>{(block as any).statement || "Afirmação..."}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
              <button style={{ padding: "10px 24px", borderRadius: "10px", background: "#d1fae5", color: "#065f46", border: "2px solid #6ee7b7", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>✓ Verdadeiro</button>
              <button style={{ padding: "10px 24px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", border: "2px solid #fca5a5", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>✗ Falso</button>
            </div>
          </div>
        );
      case "matching":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #eff6ff, #eef2ff)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Liga Pontos</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {((block as any).pairs || []).map((pair: any, i: number) => (
                  <div key={i} style={{ padding: "8px 14px", background: "#dbeafe", borderRadius: "8px", fontSize: "13px", color: "#1e3a5f", border: "1px solid #93c5fd", fontWeight: 500 }}>{pair.left}</div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {((block as any).pairs || []).map((pair: any, i: number) => (
                  <div key={i} style={{ padding: "8px 14px", background: "#e0e7ff", borderRadius: "8px", fontSize: "13px", color: "#312e81", border: "1px solid #a5b4fc", fontWeight: 500 }}>{pair.right}</div>
                ))}
              </div>
            </div>
          </div>
        );
      case "sorting":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #faf5ff, #fdf4ff)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", border: "1px solid #d8b4fe" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Ordenação</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              {((block as any).items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "10px 16px", background: "#f3e8ff", border: "1px solid #d8b4fe", borderRadius: "8px", fontSize: "13px", color: "#581c87", display: "flex", alignItems: "center", gap: "8px", cursor: "grab" }}>
                  <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>≡</span> {item.content}
                </div>
              ))}
            </div>
          </div>
        );
      case "hotspot":
        return (
          <div key={block.id} style={{ ...baseStyle, borderRadius: "12px", overflow: "hidden", position: "absolute" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {(block as any).imageSrc ? (
                <img src={(block as any).imageSrc} alt="Hotspot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>Imagem de fundo</div>
              )}
              {((block as any).spots || []).map((spot: any, i: number) => (
                <div key={i} style={{ position: "absolute", left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)", width: `${(spot.radius || 3) * 2}%`, height: `${(spot.radius || 3) * 2}%`, borderRadius: "50%", background: "rgba(6,182,212,0.4)", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(6,182,212,0.3)" }}>
                  <span style={{ color: "white", fontSize: "10px", fontWeight: 700 }}>{i + 1}</span>
                </div>
              ))}
              <div style={{ position: "absolute", top: "8px", left: "8px", padding: "4px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "10px" }}>
                {(block as any).mode === "quiz" ? "🎯 Quiz" : "🔍 Explorar"}
              </div>
            </div>
          </div>
        );
      case "accordion":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "#f8fafc", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid #e2e8f0", overflowY: "auto" }}>
            {((block as any).sections || []).map((section: any, i: number) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", background: i === 0 ? "#eef2ff" : "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{section.title}</span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{i === 0 ? "▼" : "▶"}</span>
                </div>
                {i === 0 && (
                  <div style={{ padding: "8px 16px 12px", fontSize: "13px", color: "#64748b", lineHeight: "1.6", borderTop: "1px solid #e2e8f0" }}>
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case "tabs":
        return (
          <div key={block.id} style={{ ...baseStyle, display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", background: "white" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "4px" }}>
              {((block as any).tabs || []).map((tab: any, i: number) => (
                <div key={i} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "#4f46e5" : "#64748b", borderBottom: i === 0 ? "2px solid #4f46e5" : "none", cursor: "pointer" }}>
                  {tab.label}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "16px", fontSize: "14px", color: "#475569", lineHeight: "1.6", overflowY: "auto" }}>
              {((block as any).tabs || [])[0]?.content || ""}
            </div>
          </div>
        );
      case "branching":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #fff1f2, #fef2f2)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", border: "1px solid #fecdd3" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#be123c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>🌿 Cenário de Decisão</div>
            <p style={{ fontSize: "15px", color: "#1e293b", marginBottom: "16px", fontWeight: 500 }}>{(block as any).scenario}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {((block as any).choices || []).map((c: any, i: number) => (
                <button key={i} style={{ padding: "10px 16px", borderRadius: "10px", border: "2px solid #e5e7eb", background: "white", color: "#374151", fontSize: "14px", cursor: "pointer", textAlign: "left" }}>
                  {c.text}
                </button>
              ))}
            </div>
          </div>
        );
      case "timeline":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>⏱ Linha do Tempo</div>
            <div style={{ flex: 1, display: "flex", flexDirection: (block as any).orientation === "vertical" ? "column" : "row", alignItems: "center", justifyContent: "space-around", gap: "8px" }}>
              {((block as any).events || []).map((event: any, i: number) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", border: "2px solid #38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{event.icon || "📌"}</div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1" }}>{event.date}</span>
                  <span style={{ fontSize: "10px", color: "#475569" }}>{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "dragdrop":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #f0fdfa, #ecfeff)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", border: "1px solid #99f6e4" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>↕ Drag & Drop</div>
            <div style={{ display: "flex", gap: "12px", flex: 1 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase" }}>Itens</span>
                {((block as any).items || []).map((item: any, i: number) => (
                  <div key={i} style={{ padding: "8px 12px", background: "white", border: "1px solid #99f6e4", borderRadius: "8px", fontSize: "12px", color: "#134e4a", cursor: "grab" }}>≡ {item.content}</div>
                ))}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase" }}>Categorias</span>
                {((block as any).categories || []).map((cat: any, i: number) => (
                  <div key={i} style={{ padding: "12px", background: "#ccfbf1", border: "2px dashed #5eead4", borderRadius: "8px", fontSize: "12px", color: "#0f766e", textAlign: "center" }}>{cat.label}</div>
                ))}
              </div>
            </div>
          </div>
        );
      case "interactiveVideo":
        return (
          <div key={block.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #581c87, #86198f)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", color: "white" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", color: "#e9d5ff" }}>🎬 Vídeo Interativo</div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {(block as any).src ? (
                <video src={(block as any).src} controls style={{ width: "100%", height: "100%", borderRadius: "8px" }} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>▶</div>
                  <span style={{ fontSize: "11px", opacity: 0.5 }}>Adicione URL do vídeo</span>
                </div>
              )}
            </div>
          </div>
        );
      default: {
        const unknownBlock = block as any;
        return (
          <div key={unknownBlock.id} style={{ ...baseStyle, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#94a3b8", fontWeight: 500, border: "1px dashed #cbd5e1" }}>
            📦 {unknownBlock.type}
          </div>
        );
      }
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
      <DialogContent showCloseButton={false} className="sm:max-w-[100vw] max-w-[100vw] w-screen h-screen p-0 m-0 border-0 rounded-none bg-slate-950 flex flex-col justify-center ring-0 gap-0">
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
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
          <div
            className="relative bg-white shadow-2xl overflow-hidden"
            style={{
              height: "100%",
              maxHeight: "calc(100vw * 9 / 16)",
              width: "100%",
              maxWidth: "calc(100vh * 16 / 9)",
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
