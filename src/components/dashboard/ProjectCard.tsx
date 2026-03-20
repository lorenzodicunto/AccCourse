"use client";

import { CourseProject } from "@/store/useEditorStore";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store/useEditorStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Layers,
  Calendar,
} from "lucide-react";

interface ProjectCardProps {
  project: CourseProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const setCurrentSlide = useEditorStore((s) => s.setCurrentSlide);
  const deleteProject = useEditorStore((s) => s.deleteProject);
  const addProject = useEditorStore((s) => s.addProject);

  const handleOpen = () => {
    setCurrentProject(project.id);
    if (project.slides.length > 0) {
      setCurrentSlide(project.slides[0].id);
    }
    router.push(`/editor/${project.id}`);
  };

  const handleDuplicate = () => {
    const duplicated: CourseProject = {
      ...JSON.parse(JSON.stringify(project)),
      id: crypto.randomUUID(),
      title: `${project.title} (cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProject(duplicated);
  };

  const handleDelete = () => {
    deleteProject(project.id);
  };

  const formattedDate = new Date(project.updatedAt).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail */}
      <button
        onClick={handleOpen}
        className="relative h-40 w-full overflow-hidden cursor-pointer"
      >
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
          style={{ background: project.thumbnail }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        {/* Slide count badge */}
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm text-xs font-medium gap-1 rounded-lg"
          >
            <Layers className="h-3 w-3" />
            {project.slides.length} slide{project.slides.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </button>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={handleOpen}
            className="text-left flex-1 cursor-pointer"
          >
            <h3 className="font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </button>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" />
              }
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={handleOpen} className="gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} className="gap-2 cursor-pointer">
                <Copy className="h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
