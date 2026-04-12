"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useEditorStore, Block } from "@/store/useEditorStore";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Type,
  Image,
  Music,
  HelpCircle,
  Hexagon,
  Play as PlayIcon,
  Square,
  CreditCard,
  Gamepad2,
  ArrowUp,
  ArrowDown,
  Film,
  User,
  MapPin,
  ListOrdered,
  Maximize,
  Quote,
  Download,
  Hash,
  MousePointerClick,
  Minus,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEntranceAnimations,
  getExitAnimations,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface TrackState {
  visible: boolean;
  locked: boolean;
}

// ─── Block Icon Component ──────────────────────────────────────────────────

function BlockIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    text: <Type className="h-3.5 w-3.5 text-violet-500" />,
    image: <Image className="h-3.5 w-3.5 text-blue-500" />,
    audio: <Music className="h-3.5 w-3.5 text-amber-500" />,
    quiz: <HelpCircle className="h-3.5 w-3.5 text-rose-500" />,
    video: <PlayIcon className="h-3.5 w-3.5 text-orange-500" />,
    shape: <Hexagon className="h-3.5 w-3.5 text-indigo-500" />,
    flashcard: <CreditCard className="h-3.5 w-3.5 text-teal-500" />,
    game: <Gamepad2 className="h-3.5 w-3.5 text-pink-500" />,
    character: <User className="h-3.5 w-3.5 text-cyan-500" />,
    scenario: <Film className="h-3.5 w-3.5 text-emerald-500" />,
    "labeled-graphic": <MapPin className="h-3.5 w-3.5 text-red-500" />,
    process: <ListOrdered className="h-3.5 w-3.5 text-sky-500" />,
    lightbox: <Maximize className="h-3.5 w-3.5 text-purple-500" />,
    quote: <Quote className="h-3.5 w-3.5 text-yellow-600" />,
    download: <Download className="h-3.5 w-3.5 text-green-500" />,
    counter: <Hash className="h-3.5 w-3.5 text-fuchsia-500" />,
    button: <MousePointerClick className="h-3.5 w-3.5 text-blue-600" />,
    divider: <Minus className="h-3.5 w-3.5 text-slate-400" />,
    embed: <Code className="h-3.5 w-3.5 text-gray-600" />,
  };
  return <>{icons[type] || <Zap className="h-3.5 w-3.5 text-slate-400" />}</>;
}

function getBlockLabel(block: Block): string {
  if (block.type === "text") {
    const content = (block as unknown as Record<string, unknown>).content as string | undefined;
    const stripped = content?.replace(/<[^>]*>/g, "").substring(0, 24) || "Texto";
    return stripped || "Texto";
  }
  const labels: Record<string, string> = {
    image: "Imagem",
    shape: "Forma",
    video: "Vídeo",
    audio: "Áudio",
    quiz: "Quiz",
    flashcard: "Flashcard",
    game: "Jogo",
    character: "Personagem",
    scenario: "Cenário",
    "labeled-graphic": "Gráfico Interativo",
    process: "Processo",
    lightbox: "Lightbox",
    quote: "Citação",
    download: "Download",
    counter: "Contador",
    button: "Botão",
    divider: "Divisor",
    embed: "Embed",
    truefalse: "V ou F",
    matching: "Associação",
    fillblank: "Preencher",
    sorting: "Ordenação",
    hotspot: "Hotspot",
    accordion: "Acordeão",
    tabs: "Abas",
    branching: "Ramificação",
    timeline: "Timeline",
    dragdrop: "Arraste",
    interactiveVideo: "Vídeo Interativo",
    likert: "Likert",
    ranking: "Ranking",
    essay: "Dissertação",
    numeric: "Numérico",
    dropdown: "Dropdown",
    matrix: "Matriz",
    "image-choice": "Escolha Visual",
  };
  return labels[block.type] || block.type;
}

// ─── Color by block type ──────────────────────────────────────────────────

function getTrackColor(type: string): string {
  const colors: Record<string, string> = {
    text: "bg-violet-400",
    image: "bg-blue-400",
    shape: "bg-indigo-400",
    video: "bg-orange-400",
    audio: "bg-amber-400",
    quiz: "bg-rose-400",
    flashcard: "bg-teal-400",
    game: "bg-pink-400",
    character: "bg-cyan-400",
    scenario: "bg-emerald-400",
  };
  return colors[type] || "bg-slate-400";
}

// ─── Timeline Ruler ───────────────────────────────────────────────────────

function TimelineRuler({ duration, pixelsPerSecond }: { duration: number; pixelsPerSecond: number }) {
  const marks = [];
  const step = duration <= 10 ? 1 : duration <= 30 ? 2 : 5;
  for (let t = 0; t <= duration; t += step) {
    marks.push(t);
  }
  return (
    <div className="relative h-5 border-b border-slate-200 bg-slate-50/80" style={{ width: `${duration * pixelsPerSecond}px` }}>
      {marks.map((t) => (
        <div
          key={t}
          className="absolute top-0 h-full border-l border-slate-300/60"
          style={{ left: `${t * pixelsPerSecond}px` }}
        >
          <span className="text-[9px] text-slate-400 pl-1 select-none">{t}s</span>
        </div>
      ))}
    </div>
  );
}

// ─── Playhead ─────────────────────────────────────────────────────────────

function Playhead({ time, pixelsPerSecond, height }: { time: number; pixelsPerSecond: number; height: number }) {
  const left = time * pixelsPerSecond;
  return (
    <div
      className="absolute top-0 z-20 pointer-events-none"
      style={{ left: `${left}px`, height: `${height}px` }}
    >
      {/* Triangle marker */}
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500 -translate-x-[5px]" />
      {/* Line */}
      <div className="w-[1px] bg-red-500 -translate-x-[0.5px]" style={{ height: `${height - 6}px` }} />
    </div>
  );
}

// ─── Track Row ────────────────────────────────────────────────────────────

interface TrackRowProps {
  block: Block;
  index: number;
  totalBlocks: number;
  isSelected: boolean;
  trackState: TrackState;
  slideDuration: number;
  pixelsPerSecond: number;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function TrackRow({
  block,
  index,
  totalBlocks,
  isSelected,
  trackState,
  slideDuration,
  pixelsPerSecond,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
}: TrackRowProps) {
  const anim = block.animation;
  const enterDelay = anim?.delay ?? 0;
  const enterDuration = anim?.duration ?? 0.5;
  const barColor = getTrackColor(block.type);

  // Calculate bar position
  const barLeft = enterDelay * pixelsPerSecond;
  const barWidth = Math.max(20, enterDuration * pixelsPerSecond);

  return (
    <div
      className={cn(
        "flex items-stretch border-b border-slate-100 group transition-colors",
        isSelected ? "bg-violet-50" : "hover:bg-slate-50",
        !trackState.visible && "opacity-40"
      )}
      style={{ height: "32px" }}
    >
      {/* ─── Track Info (left panel) ─── */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 shrink-0 border-r border-slate-200 cursor-pointer select-none",
          isSelected && "bg-violet-100/60"
        )}
        style={{ width: "200px" }}
        onClick={onSelect}
      >
        {/* Reorder arrows */}
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
            className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
            title="Mover para cima (z-index +)"
          >
            <ArrowUp className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === totalBlocks - 1}
            className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
            title="Mover para baixo (z-index -)"
          >
            <ArrowDown className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* Visibility toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-0.5 text-slate-400 hover:text-slate-700"
          title={trackState.visible ? "Ocultar" : "Mostrar"}
        >
          {trackState.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
          className="p-0.5 text-slate-400 hover:text-slate-700"
          title={trackState.locked ? "Desbloquear" : "Bloquear"}
        >
          {trackState.locked ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3" />}
        </button>

        {/* Block type icon + name */}
        <BlockIcon type={block.type} />
        <span className="text-[11px] font-medium text-slate-700 truncate flex-1">
          {getBlockLabel(block)}
        </span>

        {/* Z-index badge */}
        <span className="text-[9px] text-slate-400 tabular-nums">{block.zIndex}</span>
      </div>

      {/* ─── Timeline Track (right panel, scrollable) ─── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: Math.ceil(slideDuration) + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-slate-100"
              style={{ left: `${i * pixelsPerSecond}px` }}
            />
          ))}
        </div>

        {/* Animation bar */}
        {anim && anim.type && anim.type !== "none" ? (
          <div
            className={cn(
              "absolute top-1 h-[24px] rounded-sm cursor-pointer shadow-sm",
              barColor,
              isSelected ? "ring-1 ring-violet-500" : "hover:brightness-110"
            )}
            style={{
              left: `${barLeft}px`,
              width: `${barWidth}px`,
            }}
            title={`${anim.type} — Atraso: ${enterDelay.toFixed(1)}s | Duração: ${enterDuration.toFixed(1)}s`}
          >
            <span className="text-[9px] font-semibold text-white/90 px-1.5 truncate block leading-[24px]">
              {anim.type}
            </span>
          </div>
        ) : (
          /* Static presence bar (no animation) */
          <div
            className={cn(
              "absolute top-1 h-[24px] rounded-sm opacity-30",
              barColor
            )}
            style={{
              left: 0,
              width: `${Math.min(slideDuration, 2) * pixelsPerSecond}px`,
            }}
          >
            <span className="text-[9px] text-white/60 px-1.5 truncate block leading-[24px]">
              estático
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Timeline Panel ───────────────────────────────────────────────────

interface TimelinePanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function TimelinePanel({ isVisible, onToggle }: TimelinePanelProps) {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [trackStates, setTrackStates] = useState<Record<string, TrackState>>({});
  const [slideDuration, setSlideDuration] = useState(10);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);

  const PIXELS_PER_SECOND = 50;

  const project = useMemo(() => getCurrentProject(), [getCurrentProject]);
  const currentSlide = useMemo(() => getCurrentSlide(), [getCurrentSlide]);

  // Blocks sorted by zIndex (highest = top of list = front)
  const sortedBlocks = useMemo(() => {
    if (!currentSlide) return [];
    return [...currentSlide.blocks].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
  }, [currentSlide]);

  // Initialize track states for new blocks
  useEffect(() => {
    if (!currentSlide) return;
    setTrackStates((prev) => {
      const updated = { ...prev };
      currentSlide.blocks.forEach((b) => {
        if (!updated[b.id]) {
          updated[b.id] = { visible: true, locked: false };
        }
      });
      return updated;
    });
  }, [currentSlide?.blocks.length]);

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 0.05 * playbackSpeed;
          if (next >= slideDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 50);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, slideDuration]);

  const handleMoveUp = useCallback(
    (blockId: string) => {
      if (!project || !currentSlide) return;
      const idx = sortedBlocks.findIndex((b) => b.id === blockId);
      if (idx <= 0) return;
      const newOrder = [...sortedBlocks];
      [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
      reorderBlocks(project.id, currentSlide.id, newOrder.map((b) => b.id));
    },
    [project, currentSlide, sortedBlocks, reorderBlocks]
  );

  const handleMoveDown = useCallback(
    (blockId: string) => {
      if (!project || !currentSlide) return;
      const idx = sortedBlocks.findIndex((b) => b.id === blockId);
      if (idx >= sortedBlocks.length - 1) return;
      const newOrder = [...sortedBlocks];
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
      reorderBlocks(project.id, currentSlide.id, newOrder.map((b) => b.id));
    },
    [project, currentSlide, sortedBlocks, reorderBlocks]
  );

  const toggleTrackVisibility = useCallback((blockId: string) => {
    setTrackStates((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], visible: !(prev[blockId]?.visible ?? true) },
    }));
  }, []);

  const toggleTrackLock = useCallback((blockId: string) => {
    setTrackStates((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], locked: !(prev[blockId]?.locked ?? false) },
    }));
  }, []);

  const handleRulerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = Math.max(0, Math.min(slideDuration, x / PIXELS_PER_SECOND));
      setCurrentTime(newTime);
    },
    [slideDuration]
  );

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1 bg-white border-t border-slate-200 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors w-full"
      >
        <Clock className="h-3.5 w-3.5" />
        <span>Timeline</span>
        <ChevronUp className="h-3 w-3 ml-auto" />
      </button>
    );
  }

  if (!currentSlide) {
    return (
      <div className="bg-white border-t border-slate-200 p-4 text-sm text-slate-500">
        Nenhum slide selecionado
      </div>
    );
  }

  const totalHeight = sortedBlocks.length * 32 + 24; // tracks + ruler

  return (
    <div className="bg-white border-t-2 border-violet-200 flex flex-col" style={{ height: "240px" }}>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-600" />
          <span className="text-xs font-semibold text-slate-800">Timeline</span>
          <span className="text-[10px] text-slate-400">
            {sortedBlocks.length} {sortedBlocks.length === 1 ? "elemento" : "elementos"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Playback controls */}
          <div className="flex items-center gap-0.5 border border-slate-200 rounded-md px-1 py-0.5 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCurrentTime(0); setIsPlaying(false); }}
              className="h-6 w-6 p-0"
              title="Reiniciar"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-6 w-6 p-0"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <span className="text-[10px] text-slate-500 tabular-nums w-10 text-center">
              {currentTime.toFixed(1)}s
            </span>
          </div>

          {/* Speed */}
          <select
            value={playbackSpeed.toString()}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="h-6 text-[10px] px-1 rounded border border-slate-200 bg-white"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          {/* Duration */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[10px] text-slate-500">Duração:</span>
            <select
              value={slideDuration.toString()}
              onChange={(e) => setSlideDuration(parseInt(e.target.value))}
              className="h-6 text-[10px] px-1 rounded border border-slate-200 bg-white"
            >
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="15">15s</option>
              <option value="20">20s</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
            </select>
          </div>

          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0 ml-1"
            title="Fechar timeline"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: track labels (fixed) */}
        <div className="shrink-0 overflow-y-auto" style={{ width: "200px" }}>
          {/* Ruler spacer */}
          <div className="h-5 border-b border-slate-200 bg-slate-50/80 flex items-center px-2">
            <span className="text-[9px] text-slate-400 font-medium">CAMADAS</span>
          </div>
          {/* Track labels */}
          {sortedBlocks.map((block, i) => (
            <div
              key={block.id}
              className={cn(
                "flex items-center gap-1 px-2 border-b border-slate-100 group cursor-pointer select-none transition-colors",
                selectedBlockIds.includes(block.id) ? "bg-violet-50" : "hover:bg-slate-50",
                !(trackStates[block.id]?.visible ?? true) && "opacity-40"
              )}
              style={{ height: "32px" }}
              onClick={() => setSelectedBlock(block.id)}
            >
              {/* Reorder */}
              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveUp(block.id); }}
                  disabled={i === 0}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ArrowUp className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveDown(block.id); }}
                  disabled={i === sortedBlocks.length - 1}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ArrowDown className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Visibility */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleTrackVisibility(block.id); }}
                className="p-0.5 text-slate-400 hover:text-slate-700"
              >
                {(trackStates[block.id]?.visible ?? true) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>

              {/* Lock */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleTrackLock(block.id); }}
                className="p-0.5 text-slate-400 hover:text-slate-700"
              >
                {(trackStates[block.id]?.locked ?? false) ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3" />}
              </button>

              {/* Icon + Label */}
              <BlockIcon type={block.type} />
              <span className="text-[11px] font-medium text-slate-700 truncate flex-1">
                {getBlockLabel(block)}
              </span>
              <span className="text-[9px] text-slate-400 tabular-nums">{block.zIndex}</span>
            </div>
          ))}
        </div>

        {/* Right: timeline tracks (scrollable horizontally) */}
        <div className="flex-1 overflow-auto" ref={timelineContentRef}>
          <div className="relative" style={{ minWidth: `${slideDuration * PIXELS_PER_SECOND}px` }}>
            {/* Ruler */}
            <div
              className="sticky top-0 z-10 cursor-pointer"
              onClick={handleRulerClick}
            >
              <TimelineRuler duration={slideDuration} pixelsPerSecond={PIXELS_PER_SECOND} />
            </div>

            {/* Tracks */}
            <div className="relative">
              {/* Playhead */}
              <Playhead
                time={currentTime}
                pixelsPerSecond={PIXELS_PER_SECOND}
                height={sortedBlocks.length * 32 + 4}
              />

              {sortedBlocks.map((block, i) => {
                const anim = block.animation;
                const enterDelay = anim?.delay ?? 0;
                const enterDuration = anim?.duration ?? 0.5;
                const barColor = getTrackColor(block.type);
                const isBlockSelected = selectedBlockIds.includes(block.id);

                return (
                  <div
                    key={block.id}
                    className={cn(
                      "relative border-b border-slate-100 transition-colors",
                      isBlockSelected ? "bg-violet-50/50" : ""
                    )}
                    style={{ height: "32px" }}
                  >
                    {/* Grid */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: Math.ceil(slideDuration) + 1 }, (_, j) => (
                        <div
                          key={j}
                          className="absolute top-0 h-full border-l border-slate-100/80"
                          style={{ left: `${j * PIXELS_PER_SECOND}px` }}
                        />
                      ))}
                    </div>

                    {/* Animation bar */}
                    {anim && anim.type && anim.type !== "none" ? (
                      <div
                        className={cn(
                          "absolute top-1 h-[24px] rounded-sm cursor-pointer shadow-sm transition-all",
                          barColor,
                          isBlockSelected ? "ring-1 ring-violet-600 brightness-110" : "hover:brightness-110"
                        )}
                        style={{
                          left: `${enterDelay * PIXELS_PER_SECOND}px`,
                          width: `${Math.max(20, enterDuration * PIXELS_PER_SECOND)}px`,
                        }}
                        onClick={() => setSelectedBlock(block.id)}
                        title={`${anim.type} — ${enterDelay.toFixed(1)}s + ${enterDuration.toFixed(1)}s`}
                      >
                        <span className="text-[9px] font-semibold text-white/90 px-1.5 truncate block leading-[24px]">
                          {anim.type}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={cn("absolute top-1 h-[24px] rounded-sm opacity-25 cursor-pointer", barColor)}
                        style={{ left: 0, width: `${Math.min(slideDuration, 2) * PIXELS_PER_SECOND}px` }}
                        onClick={() => setSelectedBlock(block.id)}
                      >
                        <span className="text-[9px] text-white/50 px-1.5 truncate block leading-[24px]">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer with block count ─── */}
      {sortedBlocks.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Zap className="h-6 w-6 text-slate-300 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Adicione elementos ao slide para ver a timeline</p>
          </div>
        </div>
      )}
    </div>
  );
}
