"use client";

import { useState } from "react";
import { useEditorStore, Trigger, TriggerEvent, TriggerAction, CourseVariable } from "@/store/useEditorStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Zap, X, Eye, EyeOff } from "lucide-react";
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

interface TriggersPanelProps {
  open: boolean;
  onClose: () => void;
}

const TRIGGER_EVENTS: { value: TriggerEvent; label: string }[] = [
  { value: "click", label: "Clique" },
  { value: "hover", label: "Hover" },
  { value: "slide-start", label: "Slide Iniciado" },
  { value: "slide-end", label: "Slide Finalizado" },
  { value: "variable-change", label: "Variável Mudou" },
  { value: "media-complete", label: "Mídia Completa" },
  { value: "quiz-correct", label: "Quiz Correto" },
  { value: "quiz-incorrect", label: "Quiz Incorreto" },
  { value: "key-press", label: "Tecla Pressionada" },
];

const ACTION_TYPES: { value: TriggerAction["type"]; label: string }[] = [
  { value: "navigate", label: "Navegar para Slide" },
  { value: "show-layer", label: "Mostrar Camada" },
  { value: "hide-layer", label: "Esconder Camada" },
  { value: "set-variable", label: "Definir Variável" },
  { value: "increment-variable", label: "Incrementar Variável" },
  { value: "play-audio", label: "Tocar Áudio" },
  { value: "show-block", label: "Mostrar Bloco" },
  { value: "hide-block", label: "Esconder Bloco" },
  { value: "change-state", label: "Mudar Estado" },
  { value: "open-lightbox", label: "Abrir Lightbox" },
  { value: "set-completion", label: "Definir Conclusão" },
];

export function TriggersPanel({ open, onClose }: TriggersPanelProps) {
  const getCurrentProject = useEditorStore((s) => s.getCurrentProject);
  const getCurrentSlide = useEditorStore((s) => s.getCurrentSlide);
  const updateSlideMethod = useEditorStore((s) => s.updateSlide);

  const project = getCurrentProject();
  const slide = getCurrentSlide();
  const triggers = slide?.triggers ?? [];

  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<Trigger>>({
    name: "",
    event: "click",
    action: { type: "navigate", slideIndex: 0 },
    conditions: [],
    enabled: true,
  });

  const handleAddTrigger = () => {
    if (!project || !slide || !newTrigger.name?.trim()) {
      toast.error("Por favor, insira um nome para o trigger.");
      return;
    }

    const trigger: Trigger = {
      id: crypto.randomUUID(),
      name: newTrigger.name,
      event: newTrigger.event as TriggerEvent,
      action: (newTrigger.action ?? { type: "navigate", slideIndex: 0 }) as TriggerAction,
      conditions: newTrigger.conditions ?? [],
      enabled: newTrigger.enabled ?? true,
    };

    const updatedTriggers = [...triggers, trigger];
    updateSlideMethod(project.id, slide.id, { triggers: updatedTriggers });
    setNewTrigger({ name: "", event: "click", action: { type: "navigate", slideIndex: 0 }, conditions: [], enabled: true });
    setIsAddingTrigger(false);
    toast.success("Trigger adicionado!");
  };

  const handleDeleteTrigger = (triggerId: string) => {
    if (!project || !slide) return;
    const updatedTriggers = triggers.filter((t) => t.id !== triggerId);
    updateSlideMethod(project.id, slide.id, { triggers: updatedTriggers });
    toast.success("Trigger removido.");
  };

  const handleToggleTrigger = (triggerId: string) => {
    if (!project || !slide) return;
    const updatedTriggers = triggers.map((t) =>
      t.id === triggerId ? { ...t, enabled: !t.enabled } : t
    );
    updateSlideMethod(project.id, slide.id, { triggers: updatedTriggers });
  };

  const getEventLabel = (event: TriggerEvent): string => {
    return TRIGGER_EVENTS.find((e) => e.value === event)?.label || event;
  };

  const getActionLabel = (action: TriggerAction): string => {
    return ACTION_TYPES.find((a) => a.value === action.type)?.label || action.type;
  };

  const renderActionDescription = (action: TriggerAction): string => {
    switch (action.type) {
      case "navigate":
        return `Slide ${action.slideIndex + 1}`;
      case "show-layer":
      case "hide-layer":
        return `ID: ${action.layerId}`;
      case "set-variable":
        return `${action.variableId} = ${action.value}`;
      case "increment-variable":
        return `${action.variableId} += ${action.amount}`;
      case "play-audio":
        return action.audioUrl;
      case "show-block":
      case "hide-block":
        return `ID: ${action.blockId}`;
      case "change-state":
        return `${action.blockId} → ${action.stateName}`;
      case "open-lightbox":
        return action.content.substring(0, 30) + "...";
      case "set-completion":
        return action.status;
      default:
        return "";
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Triggers do Slide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {triggers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhum trigger criado ainda
            </div>
          ) : (
            <div className="space-y-2">
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    trigger.enabled
                      ? "border-slate-200 hover:border-slate-300"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-slate-900">{trigger.name}</h4>
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                          {getEventLabel(trigger.event)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Ação:</span>
                          <span className="text-slate-700">{getActionLabel(trigger.action)}</span>
                        </div>
                        <div className="text-slate-500 ml-14">
                          {renderActionDescription(trigger.action)}
                        </div>
                        {trigger.conditions && trigger.conditions.length > 0 && (
                          <div className="text-slate-500 ml-14">
                            {trigger.conditions.length} condição(ões)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggleTrigger(trigger.id)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title={trigger.enabled ? "Desativar" : "Ativar"}
                      >
                        {trigger.enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(trigger.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAddingTrigger && (
            <div className="p-3 rounded-lg border-2 border-amber-200 bg-amber-50 space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-700">
                  Nome do Trigger
                </label>
                <Input
                  value={newTrigger.name || ""}
                  onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                  className="h-8"
                  placeholder="Ex: Mostrar dica"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-700">
                  Evento
                </label>
                <Select
                  value={newTrigger.event || "click"}
                  onValueChange={(value) =>
                    setNewTrigger({ ...newTrigger, event: value as TriggerEvent })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_EVENTS.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-700">
                  Tipo de Ação
                </label>
                <Select
                  value={newTrigger.action?.type || "navigate"}
                  onValueChange={(value) =>
                    setNewTrigger({
                      ...newTrigger,
                      action: { type: value as TriggerAction["type"], slideIndex: 0 } as any,
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddTrigger}
                  className="flex-1 h-7 text-xs bg-amber-500 hover:bg-amber-600"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Trigger
                </Button>
                <Button
                  onClick={() => setIsAddingTrigger(false)}
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

        {!isAddingTrigger && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={() => setIsAddingTrigger(true)}
              className="flex-1 h-8 text-sm bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Trigger
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
