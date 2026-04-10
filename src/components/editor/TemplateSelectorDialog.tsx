import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SLIDE_TEMPLATES, SlideTemplate } from "@/lib/templates/slideLayouts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Square, LayoutTemplate, Columns, ListOrdered, Image as ImageIcon, GalleryHorizontal } from "lucide-react";

interface TemplateSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: SlideTemplate | null) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutTemplate: <LayoutTemplate className="h-6 w-6" />,
  Columns: <Columns className="h-6 w-6" />,
  ListOrdered: <ListOrdered className="h-6 w-6" />,
  Image: <ImageIcon className="h-6 w-6" />,
  GalleryHorizontal: <GalleryHorizontal className="h-6 w-6" />,
};

function getTemplateIcon(category: string) {
  const key =
    category === "abertura" ? "LayoutTemplate" :
    category === "conteudo" ? "Columns" :
    category === "dados" ? "ListOrdered" :
    category === "interativo" ? "GalleryHorizontal" :
    "Image";
  return ICON_MAP[key] || <LayoutTemplate className="h-6 w-6" />;
}

export function TemplateSelectorDialog({ open, onOpenChange, onSelect }: TemplateSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <LayoutTemplate className="h-5 w-5 text-purple-600" />
            Escolha um Layout
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Comece com um layout pré-pronto ou um slide em branco.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[450px] rounded-lg border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {/* Blank Slide Option */}
            <button
              onClick={() => onSelect(null)}
              className="flex flex-col items-center text-left p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-purple-50 hover:border-purple-400 transition-all group"
            >
              <div className="h-24 w-full bg-white rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-50 transition-colors border border-slate-200">
                <Square className="h-8 w-8 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <h3 className="font-semibold text-sm w-full text-slate-800">Em Branco</h3>
              <p className="text-xs text-slate-500 w-full mt-1">Comece do zero com um canvas limpo.</p>
            </button>

            {/* Preset Templates */}
            {SLIDE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="flex flex-col items-center text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div className="h-24 w-full bg-slate-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-50 transition-colors border border-slate-100">
                  <div className="text-slate-400 group-hover:text-purple-500 transition-colors">
                    {getTemplateIcon(template.category)}
                  </div>
                </div>
                <h3 className="font-semibold text-sm w-full text-slate-800">{template.name}</h3>
                <p className="text-xs text-slate-500 w-full mt-1 line-clamp-2">{template.description}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
