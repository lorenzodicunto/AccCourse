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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface AIImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (url: string) => void;
}

const styles = [
  { id: "realistic", name: "Realista" },
  { id: "illustration", name: "Ilustração" },
  { id: "3d", name: "3D" },
  { id: "watercolor", name: "Aquarela" },
  { id: "flatdesign", name: "Flat Design" },
];

const sizes = [
  { id: "1024x1024", name: "Quadrado 1024x1024", width: 1024, height: 1024 },
  { id: "1792x1024", name: "Paisagem 1792x1024", width: 1792, height: 1024 },
  { id: "1024x1792", name: "Retrato 1024x1792", width: 1024, height: 1792 },
];

export function AIImageDialog({
  open,
  onOpenChange,
  onInsertImage,
}: AIImageDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [size, setSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  async function handleGenerate() {
    if (prompt.trim().length < 5) {
      toast.error("Descreva a imagem com pelo menos 5 caracteres.");
      return;
    }

    setLoading(true);
    setImageUrl("");

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, size }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setImageUrl(data.imageUrl);
      toast.success("Imagem gerada com sucesso! 🖼️");
    } catch (err) {
      toast.error("Erro ao gerar imagem. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInsert() {
    if (!imageUrl) {
      toast.error("Gere uma imagem primeiro.");
      return;
    }

    onInsertImage(imageUrl);
    toast.success("Imagem inserida no slide! ✅");
    setImageUrl("");
    setPrompt("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <ImageIcon className="h-3.5 w-3.5 text-cyan-600" />
          AI Imagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-cyan-600" />
            Gerar Imagem com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Prompt Input */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Descreva a imagem desejada:
            </label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ex: "Uma praia com pôr do sol, palmeiras e mar calmo"'
              className="text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {prompt.length} caracteres
            </p>
          </div>

          {/* Style Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Estilo:
            </label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Tamanho:
            </label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || prompt.length < 5}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando imagem...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Gerar Imagem
              </>
            )}
          </Button>

          {/* Image Preview */}
          {imageUrl && (
            <div className="space-y-3 border border-cyan-200 rounded-lg p-4 bg-cyan-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cyan-700">
                  Imagem gerada
                </span>
              </div>
              <div className="relative w-full bg-slate-200 rounded-lg overflow-hidden aspect-square">
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                onClick={handleInsert}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Inserir no Slide
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
