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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseData: any;
  onApplyTranslation: (translatedData: any) => void;
}

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "no", name: "Norsk", flag: "🇳🇴" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
];

export function TranslateDialog({
  open,
  onOpenChange,
  courseData,
  onApplyTranslation,
}: TranslateDialogProps) {
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  async function handleTranslate() {
    if (!targetLanguage) {
      toast.error("Selecione um idioma de destino.");
      return;
    }

    setLoading(true);
    setPreview(null);

    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseData, targetLanguage }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setPreview(data.translatedData);
      toast.success("Curso traduzido com sucesso! 🌍");
    } catch (err) {
      toast.error("Erro ao traduzir curso. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!preview) {
      toast.error("Traduza o curso primeiro.");
      return;
    }

    onApplyTranslation(preview);
    toast.success("Tradução aplicada ao curso! ✅");
    setPreview(null);
    setTargetLanguage("en");
    onOpenChange(false);
  }

  const selectedLang = languages.find((l) => l.code === targetLanguage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Languages className="h-3.5 w-3.5 text-indigo-600" />
          Traduzir
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-indigo-600" />
            Traduzir Curso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Language Selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 block">
              Idioma de destino:
            </label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="gap-2 flex items-center">
                      {lang.flag} {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning Message */}
          <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-700">
              <p className="font-semibold mb-1">Aviso importante</p>
              <p>
                A tradução será aplicada a TODOS os slides do curso. Esta ação
                pode levar alguns minutos.
              </p>
            </div>
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={loading || !targetLanguage}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traduzindo curso...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 mr-2" />
                Traduzir para {selectedLang?.name}
              </>
            )}
          </Button>

          {/* Preview Section */}
          {preview && (
            <div className="space-y-3 border border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <div>
                <span className="text-sm font-medium text-indigo-700 block mb-2">
                  Prévia da tradução
                </span>
                <div className="max-h-[200px] overflow-y-auto text-[10px] text-indigo-700 space-y-2">
                  {preview.slides?.slice(0, 3).map((slide: any, idx: number) => (
                    <div key={idx} className="p-2 bg-white rounded border border-indigo-100">
                      <p className="font-medium mb-1">Slide {idx + 1}:</p>
                      <p className="line-clamp-2">
                        {slide.blocks?.[0]?.content?.substring(0, 60) ||
                          slide.title ||
                          "..."}
                      </p>
                    </div>
                  ))}
                  {preview.slides?.length > 3 && (
                    <p className="text-indigo-600 font-medium">
                      + {preview.slides.length - 3} slides...
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleApply}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Aplicar Tradução
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
