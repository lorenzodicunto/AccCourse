"use client";

import { useState } from "react";
import { useEditorStore, CourseVariable, VariableType } from "@/store/useEditorStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Variable, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface VariablesPanelProps {
  open: boolean;
  onClose: () => void;
}

export function VariablesPanel({ open, onClose }: VariablesPanelProps) {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const updateProject = useEditorStore((s) => s.updateProject);

  const project = getCurrentProject();
  const variables = project?.variables ?? [];

  const [isAddingVariable, setIsAddingVariable] = useState(false);
  const [newVariable, setNewVariable] = useState<Partial<CourseVariable>>({
    name: "",
    type: "text",
    defaultValue: "",
    scope: "course",
    persistent: true,
  });

  const handleAddVariable = () => {
    if (!project || !newVariable.name?.trim()) {
      toast.error("Por favor, insira um nome para a variável.");
      return;
    }

    if (!newVariable.type) {
      toast.error("Por favor, selecione um tipo.");
      return;
    }

    const variable: CourseVariable = {
      id: crypto.randomUUID(),
      name: newVariable.name,
      type: newVariable.type as VariableType,
      defaultValue: newVariable.defaultValue ?? "",
      scope: (newVariable.scope as "course" | "slide") ?? "course",
      persistent: newVariable.persistent ?? true,
    };

    const updatedVariables = [...variables, variable];
    updateProject(project.id, { variables: updatedVariables });
    setNewVariable({ name: "", type: "text", defaultValue: "", scope: "course", persistent: true });
    setIsAddingVariable(false);
    toast.success("Variável adicionada!");
  };

  const handleDeleteVariable = (variableId: string) => {
    if (!project) return;
    const updatedVariables = variables.filter((v) => v.id !== variableId);
    updateProject(project.id, { variables: updatedVariables });
    toast.success("Variável removida.");
  };

  const handleUpdateVariable = (variableId: string, updates: Partial<CourseVariable>) => {
    if (!project) return;
    const updatedVariables = variables.map((v) =>
      v.id === variableId ? { ...v, ...updates } : v
    );
    updateProject(project.id, { variables: updatedVariables });
  };

  if (!open) return null;

  const getVariableTypeLabel = (type: VariableType): string => {
    const labels: Record<VariableType, string> = {
      text: "Texto",
      number: "Número",
      boolean: "Booleano",
    };
    return labels[type];
  };

  const getScopeLabel = (scope: string): string => {
    return scope === "course" ? "Curso" : "Slide";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5 text-violet-500" />
            Variáveis do Curso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {variables.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhuma variável criada ainda
            </div>
          ) : (
            <div className="space-y-2">
              {variables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Input
                        value={variable.name}
                        onChange={(e) =>
                          handleUpdateVariable(variable.id, { name: e.target.value })
                        }
                        className="h-7 text-sm font-medium"
                        placeholder="Nome da variável"
                      />
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium whitespace-nowrap">
                        {getVariableTypeLabel(variable.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={String(variable.defaultValue)}
                        onChange={(e) =>
                          handleUpdateVariable(variable.id, {
                            defaultValue:
                              variable.type === "number"
                                ? parseFloat(e.target.value) || 0
                                : e.target.value,
                          })
                        }
                        className="h-6 text-xs flex-1"
                        placeholder="Valor padrão"
                      />
                      <span className="text-[9px] text-slate-500 whitespace-nowrap">
                        {getScopeLabel(variable.scope)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVariable(variable.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isAddingVariable && (
            <div className="p-3 rounded-lg border-2 border-violet-200 bg-violet-50 space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-700">
                  Nome da Variável
                </label>
                <Input
                  value={newVariable.name || ""}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  className="h-8"
                  placeholder="Ex: pontos, página_atual, tema"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-700">
                    Tipo
                  </label>
                  <Select
                    value={newVariable.type || "text"}
                    onValueChange={(value) =>
                      setNewVariable({ ...newVariable, type: value as VariableType })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="boolean">Booleano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-700">
                    Escopo
                  </label>
                  <Select
                    value={newVariable.scope || "course"}
                    onValueChange={(value) =>
                      setNewVariable({ ...newVariable, scope: value as "course" | "slide" })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Curso</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-700">
                  Valor Padrão
                </label>
                <Input
                  value={String(newVariable.defaultValue || "")}
                  onChange={(e) =>
                    setNewVariable({
                      ...newVariable,
                      defaultValue:
                        newVariable.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                    })
                  }
                  className="h-8"
                  placeholder="Ex: 0, true, iniciante"
                  type={newVariable.type === "number" ? "number" : "text"}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddVariable}
                  className="flex-1 h-7 text-xs bg-violet-500 hover:bg-violet-600"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
                <Button
                  onClick={() => setIsAddingVariable(false)}
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isAddingVariable && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={() => setIsAddingVariable(true)}
              className="flex-1 h-8 text-sm bg-violet-500 hover:bg-violet-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Variável
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 h-8 text-sm">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
