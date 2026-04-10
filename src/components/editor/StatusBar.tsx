"use client";

import { useEditorStore } from "@/store/useEditorStore";
import {
  ZoomIn,
  ZoomOut,
  Grid3x3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudOff,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { setLocale as setLocaleGlobal, getLocale, Locale } from "@/lib/i18n";
import type { SaveStatus } from "@/app/editor/[id]/page";

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

interface StatusBarProps {
  saveStatus?: SaveStatus;
  lastSavedAt?: Date | null;
}

export function StatusBar({ saveStatus = "saved", lastSavedAt }: StatusBarProps) {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const previewMode = useEditorStore((s) => s.previewMode);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const block = getSelectedBlock();
  const slides = project?.slides ?? [];
  const currentSlideIndex = slides.findIndex((s) => s.id === slide?.id);

  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const [showGrid, setShowGrid] = useState(false);
  const [locale, setLocaleLoc] = useState<Locale>(getLocale());

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const saveIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <>
            <Loader2 className="h-3 w-3 text-amber-400 animate-spin" />
            <span className="text-[10px] text-amber-400">Salvando...</span>
          </>
        );
      case "saved":
        return (
          <>
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400">
              {lastSavedAt ? `Salvo às ${formatTime(lastSavedAt)}` : "Salvo"}
            </span>
          </>
        );
      case "unsaved":
        return (
          <>
            <CloudOff className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] text-orange-400">Não salvo</span>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-[10px] text-red-400">Erro ao salvar</span>
          </>
        );
    }
  };

  return (
    <div className="h-7 flex items-center justify-between px-3 flex-shrink-0 text-slate-600 select-none" style={{ background: '#FFFFFF', borderTop: '1px solid rgb(226,232,240)' }}>
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono">
          Slide {currentSlideIndex + 1}/{slides.length}
        </span>
        {block && (
          <>
            <span className="text-[10px] text-slate-400">›</span>
            <span className="text-[10px] text-slate-700 capitalize">
              {block.type}
            </span>
          </>
        )}
        <div className="w-px h-3.5 bg-slate-300 mx-1" />
        <span className="text-[10px]">
          {previewMode === "desktop" ? "16:9" : "Mobile"}
        </span>
      </div>

      {/* Center: Mini Timeline */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 mr-2">
          {saveIndicator()}
        </div>
        <div className="w-px h-3.5 bg-slate-300 mr-1" />
        <div className="flex items-center gap-0.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(s.id)}
              className={cn(
                "h-3 rounded-[2px] transition-all cursor-pointer",
                currentSlideIndex === i
                  ? "bg-purple-500 w-5 shadow-sm shadow-purple-500/40"
                  : "bg-slate-300 w-3 hover:bg-slate-400"
              )}
              title={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right: Language + Zoom & Grid */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <select
          value={locale}
          onChange={(e) => {
            const newLocale = e.target.value as Locale;
            setLocaleGlobal(newLocale);
            setLocaleLoc(newLocale);
          }}
          className="h-4 text-[9px] bg-white border border-slate-300 rounded px-1 text-slate-700 cursor-pointer appearance-none"
          title="Idioma"
        >
          <option value="pt-BR" className="bg-white text-slate-700">🇧🇷 PT</option>
          <option value="en" className="bg-white text-slate-700">🇺🇸 EN</option>
        </select>

        <div className="w-px h-3.5 bg-slate-300" />

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={cn(
            "p-0.5 rounded transition-colors",
            showGrid
              ? "bg-slate-100 text-slate-700"
              : "hover:bg-slate-50 text-slate-600"
          )}
          title="Toggle Grid"
        >
          <Grid3x3 className="h-3 w-3" />
        </button>

        <div className="w-px h-3.5 bg-slate-300" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-0.5 rounded hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3 w-3 text-slate-600" />
          </button>

          <span className="text-[10px] font-mono w-8 text-center text-slate-600">
            {zoom}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-0.5 rounded hover:bg-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3 w-3 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
