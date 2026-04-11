"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Loader2, Sparkles, Briefcase, Laugh, Crown, Zap, Wind } from "lucide-react";
import { toast } from "sonner";

interface SmartColorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTheme: (colors: any) => void;
}

const moods = [
  { id: "professional", name: "Profissional", icon: Briefcase, color: "text-blue-600" },
  { id: "fun", name: "Divertido", icon: Laugh, color: "text-amber-600" },
  { id: "elegant", name: "Elegante", icon: Crown, color: "text-purple-600" },
  { id: "energetic", name: "Energético", icon: Zap, color: "text-red-600" },
  { id: "calm", name: "Calmo", icon: Wind, color: "text-cyan-600" },
];

export function SmartColorsDialog({
  open,
  onOpenChange,
  onApplyTheme,
}: SmartColorsDialogProps) {
  const [description, setDescription] = useState("");
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [selectedMood, setSelectedMood] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState<string[] | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setPalette(null);

    try {
      const res = await fetch("/api/ai/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          baseColor,
          mood: selectedMood,
        }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setPalette(data.colors);
      toast.success("Paleta gerada com sucesso! 🎨");
    } catch (err) {
      toast.error("Erro ao gerar paleta. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!palette) {
      toast.error("Gere uma paleta primeiro.");
      return;
    }

    onApplyTheme({
      colors: palette,
      mood: selectedMood,
      baseColor,
    });
    toast.success("Paleta aplicada ao curso! ✅");
    setPalette(null);
    setDescription("");
    setSelectedMood("professional");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Palette className="h-3.5 w-3.5 text-fuchsia-600" />
          Cores IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-fuchsia-600" />
            Gerar Paleta de Cores
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Descrição (opcional):
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o tema do seu curso para gerar cores apropriadas..."
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* Base Color Picker */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Cor base (opcional):
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                placeholder="#6366f1"
                className="text-sm font-mono flex-1"
              />
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-3 block">
              Mood:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                      selectedMood === mood.id
                        ? `border-slate-900 bg-slate-100`
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${mood.color}`} />
                    <span className="text-xs font-medium">{mood.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando paleta...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Paleta
              </>
            )}
          </Button>

          {/* Palette Preview */}
          {palette && (
            <div className="space-y-3 border border-fuchsia-200 rounded-lg p-4 bg-fuchsia-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-fuchsia-700">
                  Paleta gerada
                </span>
                <span className="text-[10px] text-fuchsia-600 bg-white px-2 py-1 rounded">
                  {palette.length} cores
                </span>
              </div>

              <div className="space-y-2">
                {palette.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-mono text-slate-700">
                        {color.toUpperCase()}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Cor {idx + 1}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(color);
                        toast.success(`${color} copiado!`);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-600"
                    >
                      Copiar
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleApply}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white gap-2"
              >
                <Palette className="h-4 w-4" />
                Aplicar ao Curso
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
