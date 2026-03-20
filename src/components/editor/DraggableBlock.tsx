"use client";

import { useState, useRef, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Block, VideoBlock as VideoBlockType, useEditorStore } from "@/store/useEditorStore";
import { Image, CreditCard, HelpCircle, Upload, Play, Check, Loader2 } from "lucide-react";
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
    zIndex: isDragging ? 50 : 10,
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

  // ─── Text inline editing with DOMPurify ───
  const handleTextDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      // SECURITY: Sanitize HTML before saving to store
      const sanitized = sanitizeHtml(textRef.current.innerHTML);
      handleUpdate({ content: sanitized } as Partial<Block>);
    }
  };

  // ─── Image upload (via /api/upload) ───
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
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
        "absolute rounded-xl transition-shadow duration-150",
        isDragging && "shadow-2xl opacity-90",
        isSelected && !isDragging
          ? "ring-2 ring-primary ring-offset-2 shadow-lg"
          : !isDragging && "hover:ring-1 hover:ring-primary/40"
      )}
      style={style}
      {...(isEditing ? {} : { ...attributes, ...listeners })}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* ─── TEXT BLOCK ─── */}
      {block.type === "text" && (
        <div
          ref={textRef}
          className={cn(
            "w-full h-full p-3 overflow-hidden text-sm leading-relaxed rounded-xl",
            isEditing
              ? "bg-white outline-none ring-1 ring-primary/30 cursor-text"
              : "bg-white/80"
          )}
          style={{
            fontSize: `${Math.max(10, block.fontSize * 0.7)}px`,
            fontWeight: block.fontWeight,
            color: block.color,
            textAlign: block.textAlign,
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
          className="w-full h-full rounded-xl overflow-hidden"
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
            <div className="w-full h-full bg-muted/50 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-xl">
              <Loader2 className="h-8 w-8 text-primary/60 mb-2 animate-spin" />
              <span className="text-xs text-primary/60 font-medium">
                Enviando imagem...
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-muted/50 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl hover:border-primary/30 transition-colors">
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
          className="w-full h-full rounded-xl"
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
              className="absolute inset-0 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-inner"
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
              className="absolute inset-0 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-inner"
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
        <div className="w-full h-full bg-white rounded-xl border border-border/60 p-3 overflow-hidden">
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
        <div className="w-full h-full rounded-xl overflow-hidden bg-black relative">
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
              <span className="text-xs">Cole a URL do vídeo no painel lateral</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
