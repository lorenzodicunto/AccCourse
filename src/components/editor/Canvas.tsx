"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { MousePointerClick, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { DraggableBlock } from "./DraggableBlock";

export function Canvas() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const previewMode = useEditorStore((s) => s.previewMode);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(100);

  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(25, z - 10));
  const zoomFit = () => setZoom(100);

  // Keyboard zoom shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn(); }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut(); }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoomFit(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const project = getCurrentProject();
  const slide = getCurrentSlide();

  // Dynamic font injection
  useEffect(() => {
    if (!project) return;
    const styleId = "acccourse-custom-font";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    const fontName = project.theme.fontFamily
      .replace(", sans-serif", "")
      .trim();
    if (project.theme.customFontUrl) {
      const format = project.theme.customFontUrl.includes("woff2")
        ? "woff2"
        : "truetype";
      styleEl.textContent = `@font-face { font-family: '${fontName}'; src: url('${project.theme.customFontUrl}') format('${format}'); font-weight: normal; font-style: normal; }`;
    } else {
      const googleFontName = fontName.replace(/\s+/g, "+");
      styleEl.textContent = `@import url('https://fonts.googleapis.com/css2?family=${googleFontName}:wght@300;400;500;600;700&display=swap');`;
    }
    return () => {
      styleEl.textContent = "";
    };
  }, [project?.theme.fontFamily, project?.theme.customFontUrl]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBlock(null);
    }
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setIsDragging(true);
      setSelectedBlock(event.active.id as string);
    },
    [setSelectedBlock]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);
      const { active, delta } = event;
      if (!project || !slide || !canvasRef.current) return;

      const block = slide.blocks.find((b) => b.id === active.id);
      if (!block) return;

      // Get canvas dimensions to convert delta pixels to 960x540 coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = 960 / rect.width;
      const scaleY = 540 / rect.height;

      // Adjust delta for zoom level
      const zoomFactor = zoom / 100;
      const rawX = block.x + (delta.x * scaleX) / zoomFactor;
      const rawY = block.y + (delta.y * scaleY) / zoomFactor;

      // Snap to grid (10px)
      const GRID = 10;
      const snappedX = Math.round(rawX / GRID) * GRID;
      const snappedY = Math.round(rawY / GRID) * GRID;

      const newX = Math.max(0, Math.min(960 - block.width, snappedX));
      const newY = Math.max(0, Math.min(540 - block.height, snappedY));

      updateBlock(project.id, slide.id, block.id, {
        x: newX,
        y: newY,
      });
    },
    [project, slide, updateBlock]
  );

  // Calculate slide info
  const slides = project?.slides ?? [];
  const currentSlideIndex = slides.findIndex((s) => s.id === slide?.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: '#0F172A' }}>
      {/* Ruler Horizontal */}
      <div className="h-6 border-b border-white/5 flex items-end px-0 flex-shrink-0 pointer-events-none overflow-hidden" style={{ background: '#1E293B' }}>
        <div className="flex-1 flex items-end justify-center">
          <div
            className="relative"
            style={{
              width: previewMode === "mobile" ? "375px" : "min(100%, 960px)",
            }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: `${(i / 24) * 100}%` }}
              >
                <span className="text-[8px] text-muted-foreground/50 font-mono">
                  {i % 4 === 0 ? Math.round((960 / 24) * i) : ""}
                </span>
                <div
                  className={`w-px ${
                    i % 4 === 0 ? "h-2 bg-muted-foreground/40" : "h-1 bg-muted-foreground/20"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Area with Vertical Ruler */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ruler Vertical */}
        <div className="w-6 border-r border-white/5 flex-shrink-0 pointer-events-none relative overflow-hidden" style={{ background: '#1E293B' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{
                height: "min(100%, 540px)",
              }}
            >
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute right-0 flex items-center"
                  style={{ top: `${(i / 14) * 100}%` }}
                >
                  <span className="text-[8px] text-muted-foreground/50 font-mono mr-0.5">
                    {i % 3 === 0 ? Math.round((540 / 14) * i) : ""}
                  </span>
                  <div
                    className={`h-px ${
                      i % 3 === 0 ? "w-2 bg-muted-foreground/40" : "w-1 bg-muted-foreground/20"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div
            ref={canvasRef}
            className={`relative bg-white rounded-xl shadow-2xl shadow-black/30 border border-white/10 transition-all duration-300 origin-center ${
              previewMode === "mobile"
                ? "w-[375px]"
                : "w-full max-w-[960px]"
            }`}
            style={{ aspectRatio: previewMode === "mobile" ? "9 / 19.5" : "16 / 9", transform: `scale(${zoom / 100})` }}
            onClick={handleCanvasClick}
          >
            {/* Slide background */}
            {slide && (
              <div
                className="absolute inset-0 rounded-xl z-0 pointer-events-none"
                style={{ backgroundColor: slide.background }}
              />
            )}

            {/* Blocks with DnD */}
            <DndContext
              sensors={sensors}
              modifiers={[restrictToParentElement]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {slide?.blocks.map((block) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  canvasWidth={
                    canvasRef.current?.getBoundingClientRect().width ?? 960
                  }
                  canvasHeight={
                    canvasRef.current?.getBoundingClientRect().height ?? 540
                  }
                  onSelect={() => setSelectedBlock(block.id)}
                  isDraggingAny={isDragging}
                />
              ))}
            </DndContext>

            {/* Empty state */}
            {slide && slide.blocks.length === 0 && (
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-[280px]">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-100 flex items-center justify-center">
                    <MousePointerClick className="h-7 w-7 text-primary/40" />
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-semibold mb-1">
                    Slide vazio
                  </p>
                  <p className="text-xs text-muted-foreground/40 leading-relaxed mb-4">
                    Use a aba{" "}
                    <span className="font-semibold text-primary/60">
                      Inserir
                    </span>{" "}
                    no ribbon acima para adicionar blocos
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      { icon: "T", label: "Texto" },
                      { icon: "🖼", label: "Imagem" },
                      { icon: "🃏", label: "Flashcard" },
                      { icon: "❓", label: "Quiz" },
                    ].map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/40 text-[10px] text-muted-foreground/50 font-medium"
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide indicator at bottom of canvas */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm text-[10px] font-mono" style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span>
          Slide {currentSlideIndex + 1} de {slides.length}
        </span>
        <span className="text-muted-foreground/30">•</span>
        <span>16:9</span>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm shadow-sm" style={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={zoomOut} className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer" title="Zoom Out (Ctrl+-)">
          <ZoomOut className="h-3.5 w-3.5 text-slate-400" />
        </button>
        <input
          type="range"
          min={25}
          max={200}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-16 h-1 accent-violet-500 cursor-pointer"
          title={`Zoom: ${zoom}%`}
        />
        <button onClick={zoomIn} className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer" title="Zoom In (Ctrl+=)">
          <ZoomIn className="h-3.5 w-3.5 text-slate-500" />
        </button>
        <span className="text-[9px] font-mono text-slate-400 w-7 text-center">{zoom}%</span>
        <button onClick={zoomFit} className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer" title="Ajustar (Ctrl+0)">
          <Maximize className="h-3 w-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
