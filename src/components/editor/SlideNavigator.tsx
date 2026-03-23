import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateSelectorDialog } from "./TemplateSelectorDialog";
import { SlideTemplate } from "@/lib/templates/slideLayouts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slide } from "@/store/useEditorStore";

interface SortableSlideProps {
  slide: Slide;
  index: number;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SortableSlide({
  slide,
  index,
  isSelected,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden outline-none",
        isDragging && "shadow-2xl scale-[1.03] ring-1 ring-primary/50 opacity-90",
        isSelected
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : "ring-1 ring-white/10 hover:ring-white/25"
      )}
      onClick={(e) => {
        // Only select if not dragging
        if (!isDragging) onSelect();
      }}
      {...attributes}
      {...listeners}
    >
      {/* Active indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary z-20 rounded-l-lg" />
      )}

      {/* Drag handle removido, pois o slide todo é o handle agora */}

      {/* Slide number */}
      <div className="absolute top-1 right-1 z-10">
        <span
          className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded",
            isSelected
              ? "bg-primary text-white"
              : "bg-black/30 text-white/80"
          )}
        >
          {index + 1}
        </span>
      </div>

      {/* Thumbnail 16:9 */}
      <div
        className="aspect-video w-full"
        style={{ backgroundColor: slide.background }}
      >
        <div className="relative w-full h-full overflow-hidden">
          {slide.blocks.map((block) => (
            <div
              key={block.id}
              className="absolute rounded-[1px]"
              style={{
                left: `${(block.x / 960) * 100}%`,
                top: `${(block.y / 540) * 100}%`,
                width: `${(block.width / 960) * 100}%`,
                height: `${(block.height / 540) * 100}%`,
                backgroundColor:
                  block.type === "text"
                    ? "rgba(124, 58, 237, 0.25)"
                    : block.type === "image"
                    ? "rgba(59, 130, 246, 0.25)"
                    : block.type === "flashcard"
                    ? "rgba(16, 185, 129, 0.25)"
                    : block.type === "video"
                    ? "rgba(249, 115, 22, 0.25)"
                    : "rgba(239, 68, 68, 0.25)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions overlay */}
      <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 rounded bg-white/90 hover:bg-white shadow-sm transition-colors"
          title="Duplicar"
        >
          <Copy className="h-2.5 w-2.5 text-slate-600" />
        </button>
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded bg-white/90 hover:bg-red-50 shadow-sm transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-2.5 w-2.5 text-destructive" />
          </button>
        )}
      </div>

      {/* Transition indicator */}
      {isSelected && (
        <div
          className="absolute bottom-1 left-1 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={slide.transition || "none"}
            onChange={(e) => {
              const store = useEditorStore.getState();
              const project = store.getCurrentProject();
              if (project) {
                store.updateSlideTransition(
                  project.id,
                  slide.id,
                  e.target.value as "none" | "fade" | "slide" | "zoom"
                );
              }
            }}
            className="h-5 text-[8px] rounded bg-black/60 text-white/90 border-none px-1 cursor-pointer"
            title="Transição de slide"
          >
            <option value="none">Sem transição</option>
            <option value="fade">Fade</option>
            <option value="slide">Deslizar</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>
      )}
    </div>
  );
}

export function SlideNavigator() {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const addSlide = useEditorStore((s) => s.addSlide);
  const addBlocks = useEditorStore((s) => s.addBlocks);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const deleteSlide = useEditorStore((s) => s.deleteSlide);
  const reorderSlides = useEditorStore((s) => s.reorderSlides);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const project = getCurrentProject();
  const slides = project?.slides ?? [];

  const handleTemplateSelect = (template: SlideTemplate | null) => {
    setIsTemplateDialogOpen(false);
    if (!project) return;
    const newSlideId = addSlide(project.id);
    if (template) {
      addBlocks(project.id, newSlideId, template.generateBlocks());
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !project) return;
    if (active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(
      slides.map((s) => s.id),
      oldIndex,
      newIndex
    );
    reorderSlides(project.id, reordered);
  };

  return (
    <div className="w-[200px] flex flex-col flex-shrink-0 overflow-hidden" style={{ background: '#1E293B', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Slides
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded text-slate-400 hover:text-white hover:bg-white/10"
          onClick={() => project && setIsTemplateDialogOpen(true)}
          title="Adicionar Slide"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="p-2 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slides.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {slides.map((slide, index) => (
                <SortableSlide
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isSelected={currentSlideId === slide.id}
                  canDelete={slides.length > 1}
                  onSelect={() => setCurrentSlide(slide.id)}
                  onDuplicate={() =>
                    project && duplicateSlide(project.id, slide.id)
                  }
                  onDelete={() =>
                    project && deleteSlide(project.id, slide.id)
                  }
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Add Slide Button */}
      <div className="p-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 border border-dashed border-white/15"
          onClick={() => project && setIsTemplateDialogOpen(true)}
        >
          <Plus className="h-3 w-3" />
          Novo Slide
        </Button>
      </div>

      {project && (
        <TemplateSelectorDialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          onSelect={handleTemplateSelect}
        />
      )}
    </div>
  );
}
