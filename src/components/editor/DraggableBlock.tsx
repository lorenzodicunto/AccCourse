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
    zIndex: isDragging ? 50 : isSelected ? 20 : 10,
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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute rounded-lg transition-shadow duration-150",
        isDragging && "shadow-2xl opacity-90",
        isSelected && !isDragging
          ? "ring-2 ring-primary shadow-lg"
          : !isDragging && "hover:ring-1 hover:ring-primary/30"
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
            "w-full h-full p-3 overflow-hidden text-sm rounded-lg",
            isEditing
              ? "outline-none ring-1 ring-primary/30 cursor-text"
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

      {/* Dimension tooltip when selected */}
      {isSelected && !isDragging && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[9px] rounded font-mono whitespace-nowrap z-40 shadow-lg">
          {block.width} × {block.height}
        </div>
      )}
    </div>
  );
}
