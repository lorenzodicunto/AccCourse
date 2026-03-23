import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SLIDE_TEMPLATES, SlideTemplate } from "@/lib/templates/slideLayouts";
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
  GalleryHorizontal: <GalleryHorizontal className="h-6 w-6" />
};

export function TemplateSelectorDialog({ open, onOpenChange, onSelect }: TemplateSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Escolha um Layout</DialogTitle>
          <DialogDescription className="text-slate-400">
            Comece com um layout pré-pronto ou um slide em branco.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          {/* Blank Slide Option */}
          <button
            onClick={() => onSelect(null)}
            className="flex flex-col items-center text-left p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-primary transition-all group"
          >
            <div className="h-24 w-full bg-slate-950 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-900 transition-colors border border-slate-800">
              <Square className="h-8 w-8 text-slate-600 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-sm w-full text-slate-200">Em Branco</h3>
            <p className="text-xs text-slate-500 w-full mt-1">Comece do zero com um canvas limpo.</p>
          </button>

          {/* Preset Templates */}
          {SLIDE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex flex-col items-center text-left p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-primary transition-all group"
            >
              <div className="h-24 w-full bg-slate-950 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-900 transition-colors border border-slate-800">
                <div className="text-slate-600 group-hover:text-primary transition-colors">
                  {ICON_MAP[template.icon] || <LayoutTemplate className="h-8 w-8" />}
                </div>
              </div>
              <h3 className="font-semibold text-sm w-full text-slate-200">{template.name}</h3>
              <p className="text-xs text-slate-500 w-full mt-1 line-clamp-2">{template.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
