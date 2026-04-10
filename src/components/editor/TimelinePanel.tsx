"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useEditorStore, Block } from "@/store/useEditorStore";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Plus,
  X,
  GripHorizontal,
  Type,
  Image,
  Music,
  HelpCircle,
  Hexagon,
  Play as PlayIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getEntranceAnimations,
  getExitAnimations,
  getAnimationLabel,
  getAnimationCategoryColor,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface BlockAnimation {
  blockId: string;
  enterType: string;
  enterDuration: number;
  enterDelay: number;
  exitType: string;
  exitDuration: number;
  exitDelay: number;
}

interface TimelinePanelState {
  isExpanded: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  animations: BlockAnimation[];
  maxTimeline: number;
}

// ─── Block Icon Component ──────────────────────────────────────────────────

function BlockIcon({ type }: { type: Block["type"] }) {
  const icons: Record<string, React.ReactNode> = {
    text: <Type className="h-3.5 w-3.5 text-violet-500" />,
    image: <Image className="h-3.5 w-3.5 text-blue-500" />,
    audio: <Music className="h-3.5 w-3.5 text-amber-500" />,
    quiz: <HelpCircle className="h-3.5 w-3.5 text-rose-500" />,
    video: <PlayIcon className="h-3.5 w-3.5 text-orange-500" />,
    shape: <Hexagon className="h-3.5 w-3.5 text-indigo-500" />,
  };
  return icons[type] || <Zap className="h-3.5 w-3.5 text-slate-400" />;
}

// ─── Timeline Bar Component ────────────────────────────────────────────────

interface TimelineBarProps {
  animation: BlockAnimation;
  maxTimeline: number;
  onUpdateAnimation: (updated: BlockAnimation) => void;
  isSelected: boolean;
}

function TimelineBar({
  animation,
  maxTimeline,
  onUpdateAnimation,
  isSelected,
}: TimelineBarProps) {
  const [draggingPart, setDraggingPart] = useState<
    "bar" | "start" | "end" | null
  >(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartDelay, setDragStartDelay] = useState(0);
  const [dragStartDuration, setDragStartDuration] = useState(0);

  const enterStart = animation.enterDelay;
  const enterEnd = animation.enterDelay + animation.enterDuration;
  const exitStart = animation.exitDelay;
  const exitEnd = animation.exitDelay + animation.exitDuration;

  const pixelsPerSecond = 40;

  const enterStartPx = enterStart * pixelsPerSecond;
  const enterWidthPx = animation.enterDuration * pixelsPerSecond;
  const exitStartPx = exitStart * pixelsPerSecond;
  const exitWidthPx = animation.exitDuration * pixelsPerSecond;

  const handleMouseDown = (
    e: React.MouseEvent,
    part: "bar" | "start" | "end"
  ) => {
    e.preventDefault();
    setDraggingPart(part);
    setDragStartX(e.clientX);
    setDragStartDelay(animation.enterDelay);
    setDragStartDuration(animation.enterDuration);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingPart) return;

      const deltaX = e.clientX - dragStartX;
      const deltaSeconds = deltaX / pixelsPerSecond;

      if (draggingPart === "bar") {
        const newDelay = Math.max(0, dragStartDelay + deltaSeconds);
        onUpdateAnimation({
          ...animation,
          enterDelay: newDelay,
        });
      } else if (draggingPart === "start") {
        const newDelay = Math.max(0, dragStartDelay + deltaSeconds);
        const maxDuration =
          dragStartDuration + dragStartDelay - newDelay;
        if (maxDuration > 0.1) {
          onUpdateAnimation({
            ...animation,
            enterDelay: newDelay,
            enterDuration: maxDuration,
          });
        }
      } else if (draggingPart === "end") {
        const newDuration = Math.max(0.1, dragStartDuration + deltaSeconds);
        onUpdateAnimation({
          ...animation,
          enterDuration: newDuration,
        });
      }
    },
    [draggingPart, animation, dragStartX, dragStartDelay, dragStartDuration]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingPart(null);
  }, []);

  React.useEffect(() => {
    if (draggingPart) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingPart, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative h-12 bg-slate-50 rounded border border-slate-200">
      {/* Time grid */}
      <div className="absolute inset-0 flex pointer-events-none">
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <div
            key={t}
            className="h-full border-l border-slate-200 flex-1 text-xs text-slate-400 pt-1 pl-1"
          >
            {t}s
          </div>
        ))}
      </div>

      {/* Enter animation bar */}
      {animation.enterType && animation.enterType !== "none" && (
        <div
          className="absolute h-5 top-1 rounded bg-emerald-400 cursor-move group"
          style={{
            left: `${enterStartPx}px`,
            width: `${Math.max(30, enterWidthPx)}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "bar")}
          title={`${animation.enterType} (${animation.enterDuration.toFixed(2)}s)`}
        >
          {/* Left resize handle */}
          <div
            className="absolute top-0 left-0 w-1 h-full bg-emerald-600 cursor-col-resize opacity-0 group-hover:opacity-100"
            onMouseDown={(e) => handleMouseDown(e, "start")}
          />
          {/* Right resize handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full bg-emerald-600 cursor-col-resize opacity-0 group-hover:opacity-100"
            onMouseDown={(e) => handleMouseDown(e, "end")}
          />
          <div className="text-xs font-semibold text-emerald-900 px-1 truncate">
            {animation.enterType}
          </div>
        </div>
      )}

      {/* Exit animation bar */}
      {animation.exitType && animation.exitType !== "none" && (
        <div
          className="absolute h-5 top-8 rounded bg-orange-400 cursor-move group"
          style={{
            left: `${exitStartPx}px`,
            width: `${Math.max(30, exitWidthPx)}px`,
          }}
          title={`${animation.exitType} (${animation.exitDuration.toFixed(2)}s)`}
        >
          <div className="text-xs font-semibold text-orange-900 px-1 truncate">
            {animation.exitType}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Animation Editor Panel ────────────────────────────────────────────────

interface AnimationEditorProps {
  block: Block;
  animation: BlockAnimation;
  onUpdate: (updated: BlockAnimation) => void;
  onRemove: () => void;
}

function AnimationEditor({
  block,
  animation,
  onUpdate,
  onRemove,
}: AnimationEditorProps) {
  const [showExit, setShowExit] = useState(false);

  return (
    <div className="border-t border-slate-200 pt-4 pb-4 px-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BlockIcon type={block.type} />
          <span className="text-sm font-medium text-slate-900">
            {block.type === "text"
              ? (block as any).content?.substring(0, 30) || "Texto"
              : `${block.type.charAt(0).toUpperCase()}${block.type.slice(1)}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-slate-500 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Entrance Animation */}
      <div className="space-y-3 mb-4">
        <Label className="text-xs font-semibold text-slate-700">
          Animação de Entrada
        </Label>
        <select
          value={animation.enterType}
          onChange={(e) =>
            onUpdate({ ...animation, enterType: e.target.value })
          }
          className="w-full h-8 text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="none">Nenhuma</option>
          {getEntranceAnimations().map((anim) => (
            <option key={anim.id} value={anim.id}>
              {anim.label}
            </option>
          ))}
        </select>

        {animation.enterType && animation.enterType !== "none" && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-slate-600">Atraso (s)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={animation.enterDelay.toFixed(1)}
                onChange={(e) =>
                  onUpdate({
                    ...animation,
                    enterDelay: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-600">Duração (s)</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={animation.enterDuration.toFixed(1)}
                onChange={(e) =>
                  onUpdate({
                    ...animation,
                    enterDuration: parseFloat(e.target.value) || 0.5,
                  })
                }
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-600">Facilidade</Label>
              <select
                defaultValue="ease-in-out"
                className="w-full h-7 text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ease">Ease</option>
                <option value="ease-in-out">Ease In-Out</option>
                <option value="linear">Linear</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Exit Animation */}
      <div className="space-y-3">
        <button
          onClick={() => setShowExit(!showExit)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          {showExit ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Animação de Saída
        </button>

        {showExit && (
          <>
            <select
              value={animation.exitType}
              onChange={(e) =>
                onUpdate({ ...animation, exitType: e.target.value })
              }
              className="w-full h-8 text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">Nenhuma</option>
              {getExitAnimations().map((anim) => (
                <option key={anim.id} value={anim.id}>
                  {anim.label}
                </option>
              ))}
            </select>

            {animation.exitType && animation.exitType !== "none" && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-slate-600">Atraso (s)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={animation.exitDelay.toFixed(1)}
                    onChange={(e) =>
                      onUpdate({
                        ...animation,
                        exitDelay: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Duração (s)</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={animation.exitDuration.toFixed(1)}
                    onChange={(e) =>
                      onUpdate({
                        ...animation,
                        exitDuration: parseFloat(e.target.value) || 0.5,
                      })
                    }
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Facilidade</Label>
                  <select
                    defaultValue="ease-in-out"
                    className="w-full h-7 text-xs px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ease">Ease</option>
                    <option value="ease-in-out">Ease In-Out</option>
                    <option value="linear">Linear</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Timeline Panel ───────────────────────────────────────────────────

export function TimelinePanel() {
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);

  const [state, setState] = useState<TimelinePanelState>({
    isExpanded: true,
    isPlaying: false,
    playbackSpeed: 1,
    animations: [],
    maxTimeline: 10,
  });

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const currentSlide = useMemo(() => getCurrentSlide(), [getCurrentSlide]);

  // Initialize animations for current slide blocks
  const initializeAnimations = useCallback(() => {
    if (!currentSlide) return;

    const newAnimations: BlockAnimation[] = currentSlide.blocks.map((block) => {
      const existing = state.animations.find((a) => a.blockId === block.id);
      return (
        existing || {
          blockId: block.id,
          enterType: "none",
          enterDuration: 0.5,
          enterDelay: 0,
          exitType: "none",
          exitDuration: 0.5,
          exitDelay: 0,
        }
      );
    });

    setState((prev) => ({ ...prev, animations: newAnimations }));
  }, [currentSlide, state.animations]);

  React.useEffect(() => {
    if (currentSlide && state.animations.length === 0) {
      initializeAnimations();
    }
  }, [currentSlide?.id]);

  const handleUpdateAnimation = useCallback((updated: BlockAnimation) => {
    setState((prev) => ({
      ...prev,
      animations: prev.animations.map((a) =>
        a.blockId === updated.blockId ? updated : a
      ),
    }));
  }, []);

  const handleRemoveAnimation = useCallback((blockId: string) => {
    setState((prev) => ({
      ...prev,
      animations: prev.animations.map((a) =>
        a.blockId === blockId
          ? {
              ...a,
              enterType: "none",
              exitType: "none",
            }
          : a
      ),
    }));
    setEditingBlockId(null);
  }, []);

  const animatedBlocks = useMemo(
    () =>
      currentSlide?.blocks.filter((block) => {
        const anim = state.animations.find((a) => a.blockId === block.id);
        return anim && (anim.enterType !== "none" || anim.exitType !== "none");
      }) || [],
    [currentSlide?.blocks, state.animations]
  );

  if (!currentSlide) {
    return (
      <div className="bg-white border-t border-slate-200 p-4 text-sm text-slate-500">
        Nenhum slide selecionado
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-slate-200 flex flex-col max-h-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-900">
            Animações
          </span>
          <span className="text-xs text-slate-500">
            ({animatedBlocks.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Playback controls */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  isPlaying: !prev.isPlaying,
                }))
              }
              className="h-7 w-7 p-0"
            >
              {state.isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, isPlaying: false }))}
              className="h-7 w-7 p-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>

            {/* Speed selector */}
            <select
              value={state.playbackSpeed.toString()}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  playbackSpeed: parseFloat(e.target.value),
                }))
              }
              className="h-7 text-xs px-2 rounded border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>

          {/* Expand/collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                isExpanded: !prev.isExpanded,
              }))
            }
            className="h-7 w-7 p-0"
          >
            {state.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      {state.isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {animatedBlocks.length === 0 ? (
            <div className="p-8 text-center">
              <Zap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Adicione animações aos blocos para visualizá-los aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {animatedBlocks.map((block) => {
                const animation = state.animations.find(
                  (a) => a.blockId === block.id
                );
                if (!animation) return null;

                const isEditing = editingBlockId === block.id;

                return (
                  <div
                    key={block.id}
                    className={cn(
                      "rounded-lg border border-slate-200 overflow-hidden bg-slate-50",
                      isEditing && "ring-2 ring-purple-500"
                    )}
                  >
                    {/* Timeline bar */}
                    <div className="p-3 bg-white border-b border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() =>
                            setEditingBlockId(
                              isEditing ? null : block.id
                            )
                          }
                          className="flex-1 flex items-center gap-2 hover:bg-slate-50 p-2 rounded transition-colors"
                        >
                          <BlockIcon type={block.type} />
                          <span className="text-xs font-medium text-slate-700 flex-1 text-left">
                            {block.type === "text"
                              ? (block as any).content?.substring(0, 30) ||
                                "Texto"
                              : `${block.type.charAt(0).toUpperCase()}${block.type.slice(1)}`}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 text-slate-400 transition-transform",
                              isEditing && "rotate-180"
                            )}
                          />
                        </button>
                      </div>

                      <TimelineBar
                        animation={animation}
                        maxTimeline={state.maxTimeline}
                        onUpdateAnimation={handleUpdateAnimation}
                        isSelected={selectedBlockIds.includes(block.id)}
                      />
                    </div>

                    {/* Editor */}
                    {isEditing && (
                      <AnimationEditor
                        block={block}
                        animation={animation}
                        onUpdate={handleUpdateAnimation}
                        onRemove={() => handleRemoveAnimation(block.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
