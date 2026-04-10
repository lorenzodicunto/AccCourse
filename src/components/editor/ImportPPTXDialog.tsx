"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Loader2, Check, AlertCircle } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { parsePPTX, ParsedPresentation } from "@/lib/import/pptxParser";
import { toast } from "sonner";

export function ImportPPTXDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedPresentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const projects = useEditorStore((s) => s.projects);
  const addSlide = useEditorStore((s) => s.addSlide);
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateSlideBackground = useEditorStore((s) => s.updateSlideBackground);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".pptx")) {
      toast.error("Formato inválido. Selecione um arquivo .pptx");
      return;
    }
    setFile(f);
    setLoading(true);
    setParsed(null);
    try {
      const buffer = await f.arrayBuffer();
      const result = await parsePPTX(buffer);
      setParsed(result);
      toast.success(`${result.slides.length} slides encontrados!`);
    } catch (err) {
      toast.error("Erro ao processar o arquivo .pptx");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!parsed || projects.length === 0) return;
    setImporting(true);

    const projectId = projects[0].id;

    try {
      for (const slide of parsed.slides) {
        const slideId = addSlide(projectId);
        if (slide.background !== "#ffffff") {
          updateSlideBackground(projectId, slideId, slide.background);
        }

        // Add text blocks
        for (const text of slide.texts) {
          addBlock(projectId, slideId, {
            id: crypto.randomUUID(),
            type: "text",
            x: text.x,
            y: text.y,
            width: text.width,
            height: text.height,
            content: text.content,
            fontSize: text.fontSize,
            fontFamily: "Inter",
            color: text.color,
            fontWeight: text.bold ? "bold" : "normal",
            fontStyle: "normal",
            textDecoration: "none",
            textAlign: "left",
            backgroundColor: "transparent",
            lineHeight: 1.5,
            letterSpacing: 0,
            padding: 12,
            borderRadius: 0,
            opacity: 1,
          } as any);
        }

        // Add image blocks (as base64 src)
        for (const img of slide.images) {
          addBlock(projectId, slideId, {
            id: crypto.randomUUID(),
            type: "image",
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height,
            src: img.data, // base64 for now
            alt: "Imagem importada do PowerPoint",
            objectFit: "contain",
            opacity: 1,
            borderRadius: 0,
            borderWidth: 0,
            borderColor: "#000000",
            boxShadow: "none",
          } as any);
        }
      }

      toast.success(`${parsed.slides.length} slides importados com sucesso!`);
      setOpen(false);
      setFile(null);
      setParsed(null);
    } catch (err) {
      toast.error("Erro ao importar slides");
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFile(null); setParsed(null); } }}>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <FileSpreadsheet className="h-3.5 w-3.5 text-orange-500" />
          Importar PPTX
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-5 w-5 text-orange-500" />
            Importar PowerPoint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all"
          >
            <input ref={fileRef} type="file" accept=".pptx" onChange={handleFileChange} className="hidden" />
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                <p className="text-sm text-slate-500">Analisando arquivo...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">Clique para selecionar um arquivo .pptx</p>
                <p className="text-[10px] text-slate-400">Suporta Microsoft PowerPoint 2007+</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {parsed && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{parsed.title}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{parsed.slides.length}</p>
                  <p className="text-[9px] text-slate-400">Slides</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-lg font-bold text-violet-600">{parsed.slides.reduce((a, s) => a + s.texts.length, 0)}</p>
                  <p className="text-[9px] text-slate-400">Textos</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <p className="text-lg font-bold text-emerald-600">{parsed.totalImages}</p>
                  <p className="text-[9px] text-slate-400">Imagens</p>
                </div>
              </div>

              {parsed.slides.length > 10 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-[10px] text-amber-700">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Apresentação grande: a importação pode levar alguns segundos.
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {importing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importando...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Importar {parsed.slides.length} Slides</>
                )}
              </Button>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center">
            Textos, posições e imagens serão preservados. Animações e transições não são suportadas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
