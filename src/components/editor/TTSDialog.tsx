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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Volume2, Loader2, Plus, Music } from "lucide-react";
import { toast } from "sonner";

interface TTSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slideText?: string;
  onInsertAudio: (url: string) => void;
}

const voices = [
  { id: "alloy", name: "Alloy", color: "text-blue-600" },
  { id: "echo", name: "Echo", color: "text-indigo-600" },
  { id: "fable", name: "Fable", color: "text-purple-600" },
  { id: "onyx", name: "Onyx", color: "text-slate-600" },
  { id: "nova", name: "Nova", color: "text-pink-600" },
  { id: "shimmer", name: "Shimmer", color: "text-amber-600" },
];

export function TTSDialog({
  open,
  onOpenChange,
  slideText = "",
  onInsertAudio,
}: TTSDialogProps) {
  const [text, setText] = useState(slideText);
  const [voice, setVoice] = useState("nova");
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [playing, setPlaying] = useState(false);

  async function handleGenerate() {
    if (text.trim().length < 10) {
      toast.error("Forneça pelo menos 10 caracteres de texto.");
      return;
    }

    setLoading(true);
    setAudioUrl("");

    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voice, speed }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setAudioUrl(data.audioUrl);
      toast.success("Narração gerada com sucesso! 🎵");
    } catch (err) {
      toast.error("Erro ao gerar narração. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInsert() {
    if (!audioUrl) {
      toast.error("Gere uma narração primeiro.");
      return;
    }

    onInsertAudio(audioUrl);
    toast.success("Narração adicionada ao slide! ✅");
    setAudioUrl("");
    setText("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Volume2 className="h-3.5 w-3.5 text-green-600" />
          TTS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-green-600" />
            Gerar Narração de Áudio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Text Textarea */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Texto para narração:
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui o texto que deseja converter em áudio..."
              className="min-h-[120px] text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {text.length} caracteres
            </p>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Voz:
            </label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className={v.color}>{v.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed Slider */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 flex items-center justify-between">
              <span>Velocidade:</span>
              <span className="text-slate-500">{speed.toFixed(1)}x</span>
            </label>
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.5x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || text.length < 10}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando narração...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Gerar Narração
              </>
            )}
          </Button>

          {/* Audio Preview */}
          {audioUrl && (
            <div className="p-4 rounded-lg border border-green-200 bg-green-50 space-y-3">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Narração gerada
                </span>
              </div>
              <audio
                src={audioUrl}
                controls
                className="w-full h-8"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              <Button
                onClick={handleInsert}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar ao Slide
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
