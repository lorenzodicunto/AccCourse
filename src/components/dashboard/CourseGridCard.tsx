"use client";

import { useRouter } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Layers,
  Type,
  Image as ImageIcon,
  HelpCircle,
  CreditCard,
  Play,
  Pencil,
  Copy,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CourseRow = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  courseData: unknown;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  author: { name: string; email: string };
  tenant: { name: string } | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getFirstSlidePreview(courseData: unknown): {
  background: string;
  blocks: { type: string; x: number; y: number; width: number; height: number; content?: string; color?: string; fontSize?: number }[];
  slideCount: number;
} | null {
  if (!courseData) return null;
  try {
    const project = typeof courseData === "string" ? JSON.parse(courseData) : courseData;
    if (!project.slides || project.slides.length === 0) return null;
    const firstSlide = project.slides[0];
    return {
      background: firstSlide.background || "#ffffff",
      blocks: (firstSlide.blocks || []).map((b: Record<string, unknown>) => ({
        type: b.type,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        content: b.content,
        color: b.color,
        fontSize: b.fontSize,
      })),
      slideCount: project.slides.length,
    };
  } catch {
    return null;
  }
}

export function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
  return `${Math.floor(diffDays / 365)} anos atrás`;
}

function MiniBlockIcon({ type }: { type: string }) {
  const cls = "h-full w-full";
  switch (type) {
    case "text":
      return <Type className={cls} />;
    case "image":
      return <ImageIcon className={cls} />;
    case "quiz":
      return <HelpCircle className={cls} />;
    case "flashcard":
      return <CreditCard className={cls} />;
    case "video":
      return <Play className={cls} />;
    default:
      return <Layers className={cls} />;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface CourseGridCardProps {
  course: CourseRow;
  onDuplicate: (course: CourseRow) => void;
  onDelete: (course: CourseRow) => void;
  onToggleStatus: (course: CourseRow) => void;
}

export function CourseGridCard({ course, onDuplicate, onDelete, onToggleStatus }: CourseGridCardProps) {
  const router = useRouter();
  const slidePreview = getFirstSlidePreview(course.courseData);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-md cursor-pointer animate-fade-in bg-card"
      aria-label={`Curso: ${course.title}`}
    >
      {/* Thumbnail / Slide Preview */}
      <button
        onClick={() => router.push(`/editor/${course.id}`)}
        className="relative h-40 w-full overflow-hidden cursor-pointer bg-muted"
        aria-label={`Abrir editor do curso ${course.title}`}
      >
        {slidePreview ? (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundColor: slidePreview.background }}
          >
            {slidePreview.blocks.map((block, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${(block.x / 960) * 100}%`,
                  top: `${(block.y / 540) * 100}%`,
                  width: `${(block.width / 960) * 100}%`,
                  height: `${(block.height / 540) * 100}%`,
                }}
              >
                {block.type === "text" && block.content ? (
                  <div
                    className="w-full h-full overflow-hidden px-1"
                    style={{
                      fontSize: `${Math.max(((block.fontSize || 16) / 540) * 160, 5)}px`,
                      color: block.color || "#000",
                      lineHeight: 1.3,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        block.content.replace(/<[^>]*>/g, (tag) =>
                          tag.replace(/font-size:[^;"]+;?/g, "")
                        )
                      ),
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-sm bg-muted flex items-center justify-center">
                    <div className="h-3 w-3 text-muted-foreground/50">
                      <MiniBlockIcon type={block.type} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {slidePreview.blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs text-muted-foreground/50 font-medium">Slide vazio</div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
            style={{
              background: course.thumbnail || "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          {course.status === "published" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Publicado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" aria-hidden="true" />
              Rascunho
            </span>
          )}
        </div>

        {/* Slide count badge */}
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm bg-card/90 text-foreground/80 border border-border">
            <Layers className="h-3 w-3" aria-hidden="true" />
            {slidePreview?.slideCount ?? 1} slide{(slidePreview?.slideCount ?? 1) !== 1 ? "s" : ""}
          </span>
        </div>
      </button>

      {/* Floating action buttons on hover */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => router.push(`/editor/${course.id}`)}
          className="p-1.5 rounded-lg shadow-sm hover:bg-muted transition-colors cursor-pointer bg-card/90 border border-border"
          aria-label={`Editar curso ${course.title}`}
        >
          <Pencil className="h-3.5 w-3.5 text-foreground/80" aria-hidden="true" />
        </button>
        <button
          onClick={() => onDuplicate(course)}
          className="p-1.5 rounded-lg shadow-sm hover:bg-muted transition-colors cursor-pointer bg-card/90 border border-border"
          aria-label={`Duplicar curso ${course.title}`}
        >
          <Copy className="h-3.5 w-3.5 text-foreground/80" aria-hidden="true" />
        </button>
        <button
          onClick={() => onDelete(course)}
          className="p-1.5 rounded-lg shadow-sm hover:bg-red-100 transition-colors cursor-pointer bg-card/90 border border-border"
          aria-label={`Excluir curso ${course.title}`}
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => router.push(`/editor/${course.id}`)}
            className="text-left flex-1 cursor-pointer"
          >
            <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">
              {course.title}
            </h3>
          </button>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label={`Mais opções para ${course.title}`}
                />
              }
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground/70" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card border border-border shadow-md">
              <DropdownMenuItem
                onClick={() => router.push(`/editor/${course.id}`)}
                className="gap-2 cursor-pointer text-foreground/80 hover:text-foreground focus:text-foreground focus:bg-muted"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDuplicate(course)}
                className="gap-2 cursor-pointer text-foreground/80 hover:text-foreground focus:text-foreground focus:bg-muted"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleStatus(course)}
                className="gap-2 cursor-pointer text-foreground/80 hover:text-foreground focus:text-foreground focus:bg-muted"
              >
                {course.status === "published" ? (
                  <>
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    Voltar a Rascunho
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Publicar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => onDelete(course)}
                className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Last edited date */}
        <div className="flex items-center gap-1.5 mt-2">
          <Clock className="h-3 w-3 text-muted-foreground/70" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            Última edição: {getRelativeDate(course.updatedAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
