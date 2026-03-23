"use client";

import { useState, useRef, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Block,
  VideoBlock as VideoBlockType,
  useEditorStore,
} from "@/store/useEditorStore";
import {
  Image,
  CreditCard,
  HelpCircle,
  Upload,
  Play,
  Check,
  Loader2,
} from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface DraggableBlockProps {
  block: Block;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onSelect: () => void;
  isDraggingAny: boolean;
}

// Resize handle positions
const HANDLES = [
  { position: "top-left", cursor: "nwse-resize", x: -1, y: -1 },
  { position: "top-center", cursor: "ns-resize", x: 0, y: -1 },
  { position: "top-right", cursor: "nesw-resize", x: 1, y: -1 },
  { position: "middle-left", cursor: "ew-resize", x: -1, y: 0 },
  { position: "middle-right", cursor: "ew-resize", x: 1, y: 0 },
  { position: "bottom-left", cursor: "nesw-resize", x: -1, y: 1 },
  { position: "bottom-center", cursor: "ns-resize", x: 0, y: 1 },
  { position: "bottom-right", cursor: "nwse-resize", x: 1, y: 1 },
] as const;

const HANDLE_POSITIONS: Record<
  string,
  { top?: string; bottom?: string; left?: string; right?: string }
> = {
  "top-left": { top: "-4px", left: "-4px" },
  "top-center": { top: "-4px", left: "50%", },
  "top-right": { top: "-4px", right: "-4px" },
  "middle-left": { top: "50%", left: "-4px" },
  "middle-right": { top: "50%", right: "-4px" },
  "bottom-left": { bottom: "-4px", left: "-4px" },
  "bottom-center": { bottom: "-4px", left: "50%" },
  "bottom-right": { bottom: "-4px", right: "-4px" },
};

export function DraggableBlock({
  block,
  isSelected,
  canvasWidth,
  canvasHeight,
  onSelect,
  isDraggingAny,
}: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: block.id });

  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const [isEditing, setIsEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Convert block coordinates (960x540) to percentage
  const leftPct = (block.x / 960) * 100;
  const topPct = (block.y / 540) * 100;
  const widthPct = (block.width / 960) * 100;
  const heightPct = (block.height / 540) * 100;

  const style: React.CSSProperties = {
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 50 : isSelected ? 20 + (block.zIndex || 0) : 10 + (block.zIndex || 0),
    cursor: isDragging ? "grabbing" : "pointer",
  };

  const handleUpdate = useCallback(
    (updates: Partial<Block>) => {
      const project = getCurrentProject();
      const slide = getCurrentSlide();
      if (!project || !slide) return;
      updateBlock(project.id, slide.id, block.id, updates);
    },
    [block.id, getCurrentProject, getCurrentSlide, updateBlock]
  );

  // ─── Resize ───
  const handleResizeStart = useCallback(
    (
      e: React.MouseEvent,
      handleX: number,
      handleY: number
    ) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);

      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startX = block.x;
      const startY = block.y;
      const startW = block.width;
      const startH = block.height;

      const scaleX = 960 / canvasWidth;
      const scaleY = 540 / canvasHeight;

      const handleMouseMove = (me: MouseEvent) => {
        const dx = (me.clientX - startMouseX) * scaleX;
        const dy = (me.clientY - startMouseY) * scaleY;

        let newX = startX;
        let newY = startY;
        let newW = startW;
        let newH = startH;

        if (handleX === -1) {
          newX = Math.max(0, startX + dx);
          newW = Math.max(30, startW - dx);
        } else if (handleX === 1) {
          newW = Math.max(30, startW + dx);
        }

        if (handleY === -1) {
          newY = Math.max(0, startY + dy);
          newH = Math.max(30, startH - dy);
        } else if (handleY === 1) {
          newH = Math.max(30, startH + dy);
        }

        // Clamp to canvas
        if (newX + newW > 960) newW = 960 - newX;
        if (newY + newH > 540) newH = 540 - newY;

        handleUpdate({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [block.x, block.y, block.width, block.height, canvasWidth, canvasHeight, handleUpdate]
  );

  // ─── Text inline editing with DOMPurify ───
  const handleTextDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      const sanitized = sanitizeHtml(textRef.current.innerHTML);
      handleUpdate({ content: sanitized } as Partial<Block>);
    }
  };

  // ─── Image upload (via /api/upload) ───
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        handleUpdate({ src: data.url } as Partial<Block>);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    imageInputRef.current?.click();
  };

  // ─── Flashcard flip ───
  const handleFlashcardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setIsFlipped(!isFlipped);
    }
    onSelect();
  };

  // Determine if text block is "free" (no background box)
  const isTransparentText = block.type === "text" &&
    (!(block as any).backgroundColor || (block as any).backgroundColor === "transparent");

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute transition-shadow duration-150",
        !isTransparentText && "rounded-lg",
        isDragging && "shadow-2xl opacity-90",
        isSelected && !isDragging
          ? isTransparentText
            ? "border border-dashed border-primary/50"
            : "ring-2 ring-primary shadow-lg"
          : !isDragging && (isTransparentText
            ? "hover:border hover:border-dashed hover:border-primary/20"
            : "hover:ring-1 hover:ring-primary/30")
      )}
      style={style}
      {...(isEditing || isResizing ? {} : { ...attributes, ...listeners })}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Resize Handles (PowerPoint-style) */}
      {isSelected && !isDragging && (
        <>
          {HANDLES.map((handle) => (
            <div
              key={handle.position}
              className="absolute z-30 w-[8px] h-[8px] bg-white border-2 border-primary rounded-[1px] shadow-sm hover:bg-primary hover:border-primary transition-colors"
              style={{
                ...HANDLE_POSITIONS[handle.position],
                cursor: handle.cursor,
                transform:
                  handle.position.includes("center") ||
                  handle.position.includes("middle")
                    ? handle.position.includes("center")
                      ? "translateX(-50%)"
                      : "translateY(-50%)"
                    : undefined,
              }}
              onMouseDown={(e) =>
                handleResizeStart(e, handle.x, handle.y)
              }
            />
          ))}
        </>
      )}

      {/* ─── TEXT BLOCK ─── */}
      {block.type === "text" && (
        <div
          ref={textRef}
          className={cn(
            "w-full h-full overflow-hidden text-sm",
            isTransparentText ? "" : "rounded-lg",
            isEditing
              ? "outline-none cursor-text"
              : ""
          )}
          style={{
            fontSize: `${Math.max(10, block.fontSize * 0.7)}px`,
            fontWeight: block.fontWeight,
            fontStyle: (block as any).fontStyle || "normal",
            textDecorationLine: (block as any).textDecorationLine || "none",
            color: block.color,
            textAlign: block.textAlign,
            lineHeight: (block as any).lineHeight ?? 1.5,
            letterSpacing: `${(block as any).letterSpacing ?? 0}px`,
            textShadow: (block as any).textShadow !== "none" ? (block as any).textShadow : undefined,
            backgroundColor: (block as any).backgroundColor || "transparent",
            borderRadius: `${(block as any).borderRadius ?? 0}px`,
            opacity: (block as any).opacity ?? 1,
            padding: isTransparentText ? "4px 2px" : "12px",
          }}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onDoubleClick={handleTextDoubleClick}
          onBlur={handleTextBlur}
          dangerouslySetInnerHTML={
            !isEditing
              ? { __html: sanitizeHtml(block.content) }
              : undefined
          }
        />
      )}

      {/* ─── IMAGE BLOCK ─── */}
      {block.type === "image" && (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            borderRadius: `${(block as any).borderRadius ?? 12}px`,
            opacity: (block as any).opacity ?? 1,
            border: (block as any).borderWidth ? `${(block as any).borderWidth}px solid ${(block as any).borderColor || "#e2e8f0"}` : undefined,
            boxShadow: (block as any).boxShadow !== "none" ? (block as any).boxShadow : undefined,
          }}
          onDoubleClick={handleImageDoubleClick}
        >
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {block.src ? (
            <img
              src={block.src}
              alt={block.alt}
              className="w-full h-full"
              style={{ objectFit: block.objectFit }}
              draggable={false}
            />
          ) : isUploading ? (
            <div className="w-full h-full bg-muted/50 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-lg">
              <Loader2 className="h-8 w-8 text-primary/60 mb-2 animate-spin" />
              <span className="text-xs text-primary/60 font-medium">
                Enviando imagem...
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-muted/50 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-primary/30 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <span className="text-xs text-muted-foreground/60">
                Duplo clique para upload
              </span>
            </div>
          )}
        </div>
      )}

      {/* ─── FLASHCARD BLOCK (3D Flip) ─── */}
      {block.type === "flashcard" && (
        <div
          className="w-full h-full rounded-lg"
          style={{ perspective: "600px" }}
          onClick={handleFlashcardClick}
        >
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-inner"
              style={{
                backgroundColor: block.frontBg,
                backfaceVisibility: "hidden",
              }}
            >
              <div className="text-center px-4">
                <CreditCard className="h-6 w-6 mx-auto mb-2 opacity-60" />
                <p className="line-clamp-3">{block.frontContent}</p>
                <span className="text-[10px] opacity-50 mt-2 block">
                  Clique para virar →
                </span>
              </div>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-inner"
              style={{
                backgroundColor: block.backBg,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center px-4">
                <p className="line-clamp-4">{block.backContent}</p>
                <span className="text-[10px] opacity-50 mt-2 block">
                  ← Clique para voltar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUIZ BLOCK ─── */}
      {block.type === "quiz" && (
        <div className="w-full h-full bg-white rounded-lg border border-border/60 p-3 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs font-semibold text-foreground line-clamp-1">
              {block.question}
            </p>
          </div>
          <div className="space-y-1">
            {block.options.map((opt) => (
              <div
                key={opt.id}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-md line-clamp-1 flex items-center gap-1",
                  opt.isCorrect
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                {opt.isCorrect && (
                  <span className="text-emerald-500 text-[8px]">✓</span>
                )}
                {opt.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── VIDEO BLOCK ─── */}
      {block.type === "video" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-black relative">
          {/* Invisible mask to prevent iframe swallowing dnd-kit clicks */}
          <div className="absolute inset-0 z-10" />
          {(block as VideoBlockType).url ? (
            <ReactPlayer
              url={(block as VideoBlockType).url}
              width="100%"
              height="100%"
              controls
              light
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
              <Play className="h-8 w-8 mb-2" />
              <span className="text-xs">
                Cole a URL do vídeo no painel lateral
              </span>
            </div>
          )}
        </div>
      )}

      {/* ─── SHAPE BLOCK ─── */}
      {block.type === "shape" && (
        <div
          className="w-full h-full"
          style={{
            opacity: (block as any).opacity ?? 1,
            transform: `rotate(${(block as any).rotation ?? 0}deg)`,
          }}
        >
          <svg
            viewBox="0 0 200 200"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            {(() => {
              const fill = (block as any).fillColor || "#7c3aed";
              const stroke = (block as any).strokeColor || "#4f46e5";
              const sw = (block as any).strokeWidth ?? 2;
              const shapeType = (block as any).shapeType || "rectangle";

              switch (shapeType) {
                case "circle":
                  return <ellipse cx="100" cy="100" rx="95" ry="95" fill={fill} stroke={stroke} strokeWidth={sw} />;
                case "rounded-rect":
                  return <rect x="5" y="5" width="190" height="190" rx="30" fill={fill} stroke={stroke} strokeWidth={sw} />;
                case "triangle":
                  return <polygon points="100,10 190,190 10,190" fill={fill} stroke={stroke} strokeWidth={sw} />;
                case "arrow":
                  return <polygon points="100,10 190,100 140,100 140,190 60,190 60,100 10,100" fill={fill} stroke={stroke} strokeWidth={sw} />;
                case "line":
                  return <line x1="10" y1="100" x2="190" y2="100" stroke={stroke} strokeWidth={Math.max(sw, 4)} strokeLinecap="round" />;
                case "star":
                  return <polygon points="100,10 125,75 195,80 140,130 155,195 100,160 45,195 60,130 5,80 75,75" fill={fill} stroke={stroke} strokeWidth={sw} />;
                case "rectangle":
                default:
                  return <rect x="5" y="5" width="190" height="190" fill={fill} stroke={stroke} strokeWidth={sw} />;
              }
            })()}
          </svg>
        </div>
      )}

      {/* ─── AUDIO BLOCK ─── */}
      {block.type === "audio" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/30 flex flex-col items-center justify-center">
          {(block as any).src ? (
            <audio
              src={(block as any).src}
              controls={(block as any).showControls !== false}
              autoPlay={false}
              loop={(block as any).loop}
              className="w-[90%]"
              style={{ maxHeight: "40px" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-violet-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
              <span className="text-[9px]">Adicione URL do áudio</span>
            </div>
          )}
        </div>
      )}

      {/* ─── TRUE/FALSE BLOCK ─── */}
      {block.type === "truefalse" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 p-3 flex flex-col">
          <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Verdadeiro ou Falso</div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-slate-700 text-center px-2">{(block as any).statement || "Afirmação..."}</p>
          </div>
          <div className="flex gap-2 justify-center mt-1">
            <div className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-700 text-[9px] font-medium border border-emerald-300/50">✓ Verdadeiro</div>
            <div className="px-3 py-1 rounded-md bg-red-500/20 text-red-700 text-[9px] font-medium border border-red-300/50">✗ Falso</div>
          </div>
        </div>
      )}

      {/* ─── MATCHING BLOCK ─── */}
      {block.type === "matching" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 p-3 flex flex-col">
          <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-2">Liga Pontos</div>
          <div className="flex-1 flex items-center justify-between px-2 gap-4">
            <div className="flex flex-col gap-1.5">
              {((block as any).pairs || []).map((pair: any, i: number) => (
                <div key={i} className="px-2 py-1 rounded bg-blue-100 text-[9px] text-blue-800 border border-blue-200">{pair.left}</div>
              ))}
            </div>
            <svg className="flex-1 h-full" viewBox="0 0 60 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="60" y2="80" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="50" x2="60" y2="20" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="80" x2="60" y2="50" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3,3" />
            </svg>
            <div className="flex flex-col gap-1.5">
              {((block as any).pairs || []).map((pair: any, i: number) => (
                <div key={i} className="px-2 py-1 rounded bg-indigo-100 text-[9px] text-indigo-800 border border-indigo-200">{pair.right}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── FILL-IN-THE-BLANK BLOCK ─── */}
      {block.type === "fillblank" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-3 flex flex-col">
          <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-2">Preencher Lacunas</div>
          <div className="flex-1 flex items-center justify-center flex-wrap gap-0.5 px-2">
            {((block as any).segments || []).map((seg: any, i: number) => (
              seg.type === "text" ? (
                <span key={i} className="text-xs text-slate-700">{seg.content}</span>
              ) : (
                <span key={i} className="inline-block px-2 py-0.5 mx-0.5 border-b-2 border-amber-400 bg-amber-100/50 text-[9px] text-amber-600 min-w-[40px] text-center rounded-sm">___</span>
              )
            ))}
          </div>
        </div>
      )}

      {/* ─── SORTING BLOCK ─── */}
      {block.type === "sorting" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200/50 p-3 flex flex-col">
          <div className="text-[9px] font-bold text-purple-700 uppercase tracking-wider mb-2">Ordenação</div>
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {((block as any).items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-100/70 border border-purple-200/50">
                <span className="text-[9px] font-mono text-purple-400">≡</span>
                <span className="text-[9px] text-purple-800">{i + 1}. {item.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── HOTSPOT BLOCK ─── */}
      {block.type === "hotspot" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200/50 relative">
          {(block as any).imageSrc ? (
            <img src={(block as any).imageSrc} alt="Hotspot" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-[9px] text-slate-400">Adicione imagem de fundo</span>
            </div>
          )}
          {((block as any).spots || []).map((spot: any, i: number) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-cyan-500/60 border-2 border-white shadow-lg animate-pulse"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
              title={spot.label}
            />
          ))}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[8px]">
            {(block as any).mode === "quiz" ? "🎯 Quiz" : "🔍 Explorar"} · {((block as any).spots || []).length} pontos
          </div>
        </div>
      )}

      {/* ─── ACCORDION BLOCK ─── */}
      {block.type === "accordion" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200/50 p-2 flex flex-col gap-1">
          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Accordion</div>
          {((block as any).sections || []).map((section: any, i: number) => (
            <div key={i} className={`rounded border ${i === 0 ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[9px] font-medium text-slate-700">{section.title}</span>
                <span className="text-[8px] text-slate-400">{i === 0 ? "▼" : "▶"}</span>
              </div>
              {i === 0 && (
                <div className="px-2 pb-1.5 text-[8px] text-slate-500 border-t border-indigo-200">{section.content}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── TABS BLOCK ─── */}
      {block.type === "tabs" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-white border border-slate-200/50 flex flex-col">
          <div className="flex border-b border-slate-200 bg-slate-50 px-1 pt-1">
            {((block as any).tabs || []).map((tab: any, i: number) => (
              <div
                key={i}
                className={`px-2 py-1 text-[9px] font-medium rounded-t ${
                  i === 0
                    ? "bg-white border border-b-0 border-slate-200 text-indigo-600"
                    : "text-slate-500"
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className="flex-1 p-2">
            <p className="text-[9px] text-slate-600">{((block as any).tabs || [])[0]?.content || ""}</p>
          </div>
        </div>
      )}

      {/* ─── BRANCHING ─── */}
      {block.type === "branching" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/50 flex flex-col p-3">
          <div className="text-[8px] font-bold text-rose-600 uppercase tracking-wider mb-1">🌿 Cenário de Decisão</div>
          <p className="text-[10px] text-slate-700 font-medium mb-2 leading-tight">{(block as any).scenario}</p>
          <div className="flex flex-col gap-1 flex-1">
            {((block as any).choices || []).map((choice: any, i: number) => (
              <div key={i} className={`px-2 py-1 rounded text-[8px] border cursor-pointer ${choice.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                {choice.isCorrect && <span className="mr-1">✓</span>}{choice.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TIMELINE ─── */}
      {block.type === "timeline" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/50 p-3 flex flex-col">
          <div className="text-[8px] font-bold text-sky-600 uppercase tracking-wider mb-2">⏱ Linha do Tempo</div>
          <div className={`flex-1 flex ${(block as any).orientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center justify-around gap-1`}>
            {((block as any).events || []).map((event: any, i: number) => (
              <div key={i} className="flex flex-col items-center text-center gap-0.5">
                <div className="w-6 h-6 rounded-full bg-sky-100 border-2 border-sky-400 flex items-center justify-center text-[9px]">
                  {event.icon || '📌'}
                </div>
                <span className="text-[8px] font-bold text-sky-700">{event.date}</span>
                <span className="text-[7px] text-slate-500 leading-tight">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── DRAG & DROP ─── */}
      {block.type === "dragdrop" && (
        <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50 p-3 flex flex-col">
          <div className="text-[8px] font-bold text-teal-600 uppercase tracking-wider mb-2">↕ Drag & Drop</div>
          <div className="flex gap-2 flex-1">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[7px] text-slate-400 uppercase">Itens</span>
              {((block as any).items || []).map((item: any, i: number) => (
                <div key={i} className="px-1.5 py-0.5 bg-white border border-teal-200 rounded text-[8px] text-teal-700 shadow-sm">
                  ≡ {item.content}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[7px] text-slate-400 uppercase">Categorias</span>
              {((block as any).categories || []).map((cat: any, i: number) => (
                <div key={i} className="px-1.5 py-2 bg-teal-100/50 border border-dashed border-teal-300 rounded text-[8px] text-teal-600 text-center">
                  {cat.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dimension tooltip when selected */}
      {isSelected && !isDragging && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded font-mono whitespace-nowrap z-40 shadow-lg">
          {block.width} × {block.height}
        </div>
      )}
    </div>
  );
}
