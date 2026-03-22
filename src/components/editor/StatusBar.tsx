"use client";

import { useEditorStore } from "@/store/useEditorStore";
import {
  ZoomIn,
  ZoomOut,
  Grid3x3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export function StatusBar() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const previewMode = useEditorStore((s) => s.previewMode);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const slides = project?.slides ?? [];
  const currentSlideIndex = slides.findIndex((s) => s.id === slide?.id);

  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);

  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    if (idx < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[idx + 1]);
    }
  };

  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    if (idx > 0) {
      setZoom(ZOOM_LEVELS[idx - 1]);
    }
  };

  // Check if project has been modified (simple check based on updatedAt)
  const isSaved =
    project &&
    new Date(project.updatedAt).getTime() <
      Date.now() - 2000;

  return (
    <div className="h-7 bg-slate-800 flex items-center justify-between px-3 flex-shrink-0 text-slate-400 select-none">
      {/* Left: Slide info */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono">
          Slide {currentSlideIndex + 1} / {slides.length}
        </span>
        <div className="w-px h-3.5 bg-slate-600" />
        <span className="text-[10px]">
          {previewMode === "desktop" ? "16:9" : "Mobile"}
        </span>
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-1.5">
        {project ? (
          <>
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">Pronto</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] text-amber-400">Carregando</span>
          </>
        )}
      </div>

      {/* Right: Zoom & Grid */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={cn(
            "p-0.5 rounded transition-colors",
            showGrid
              ? "bg-white/10 text-white"
              : "hover:bg-white/5 text-slate-500"
          )}
          title="Toggle Grid"
        >
          <Grid3x3 className="h-3 w-3" />
        </button>

        <div className="w-px h-3.5 bg-slate-600" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3 w-3" />
          </button>

          <span className="text-[10px] font-mono w-8 text-center">
            {zoom}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
