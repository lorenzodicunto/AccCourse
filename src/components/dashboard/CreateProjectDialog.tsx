"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useEditorStore, createDefaultProject } from "@/store/useEditorStore";
import { useRouter } from "next/navigation";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const addProject = useEditorStore((s) => s.addProject);
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const router = useRouter();

  const handleCreate = () => {
    if (!title.trim()) return;
    const project = createDefaultProject(title.trim(), description.trim());
    addProject(project);
    setCurrentProject(project.id);
    setOpen(false);
    setTitle("");
    setDescription("");
    router.push(`/editor/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="gap-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
          />
        }
      >
        <Plus className="h-5 w-5" />
        Criar Novo Curso
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Novo Projeto de Curso
          </DialogTitle>
          <DialogDescription>
            Dê um nome ao seu curso e comece a criar conteúdo interativo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-title">Título do Curso</Label>
            <Input
              id="project-title"
              placeholder="Ex: Treinamento de Onboarding 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-description">Descrição (opcional)</Label>
            <Input
              id="project-description"
              placeholder="Breve descrição sobre o conteúdo do curso"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="rounded-xl"
          >
            Criar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
