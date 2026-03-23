"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Library,
  Upload,
  Search,
  Image as ImageIcon,
  Film,
  FileText,
  Music,
  Trash2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  uploader?: { name: string; email: string };
}

const TYPE_FILTERS = [
  { value: "", label: "Todos", icon: Library },
  { value: "image", label: "Imagens", icon: ImageIcon },
  { value: "video", label: "Vídeos", icon: Film },
  { value: "audio", label: "Áudios", icon: Music },
  { value: "document", label: "Docs", icon: FileText },
];

interface AssetLibraryDialogProps {
  onSelect?: (url: string, type: string) => void;
}

export function AssetLibraryDialog({ onSelect }: AssetLibraryDialogProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/assets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch {
      toast.error("Erro ao carregar ativos");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    if (open) fetchAssets();
  }, [open, fetchAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/assets", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
      }
      toast.success(`${files.length} arquivo(s) enviado(s)!`);
      fetchAssets();
    } catch {
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await fetch(`/api/assets?id=${assetId}`, { method: "DELETE" });
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      if (selectedAsset?.id === assetId) setSelectedAsset(null);
      toast.success("Ativo excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleInsert = () => {
    if (!selectedAsset) return;
    onSelect?.(selectedAsset.url, selectedAsset.type);
    setOpen(false);
    setSelectedAsset(null);
    toast.success("Ativo inserido!");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-7 text-xs"
          title="Biblioteca de Ativos"
        >
          <Library className="h-3.5 w-3.5" />
          Biblioteca
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Biblioteca de Ativos
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar ativos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-1">
            {TYPE_FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1",
                    typeFilter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Upload button */}
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Asset Grid */}
        <ScrollArea className="h-[400px] mt-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Library className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum ativo encontrado</p>
              <p className="text-xs mt-1">Faça upload para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-1">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={cn(
                    "group relative rounded-lg border overflow-hidden cursor-pointer transition-all",
                    selectedAsset?.id === asset.id
                      ? "ring-2 ring-primary border-primary"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedAsset(asset)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {asset.type === "image" ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.type === "video" ? (
                      <Film className="h-8 w-8 text-muted-foreground/40" />
                    ) : asset.type === "audio" ? (
                      <Music className="h-8 w-8 text-muted-foreground/40" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-1.5">
                    <p className="text-[10px] font-medium truncate">{asset.name}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {formatSize(asset.size)}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {selectedAsset?.id === asset.id && (
                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset.id);
                    }}
                    className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-destructive/90 text-white transition-opacity"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-[10px] text-muted-foreground">
            {filteredAssets.length} ativo(s) • {selectedAsset ? `Selecionado: ${selectedAsset.name}` : "Nenhum selecionado"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setOpen(false)}
            >
              <X className="h-3 w-3 mr-1" />
              Fechar
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleInsert}
              disabled={!selectedAsset}
            >
              <Check className="h-3 w-3 mr-1" />
              Inserir no Canvas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
