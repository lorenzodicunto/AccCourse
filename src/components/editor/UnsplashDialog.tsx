"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface UnsplashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string) => void;
}

interface UnsplashImage {
  id: string;
  urls: { thumb: string; regular: string };
  alt_description: string;
  user: { name: string; username: string };
  links: { html: string };
}

export function UnsplashDialog({
  open,
  onOpenChange,
  onSelectImage,
}: UnsplashDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

  const debounceSearch = useCallback(
    async (query: string, pageNum: number) => {
      if (!query.trim()) {
        setImages([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/unsplash/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, page: pageNum }),
        });

        if (!res.ok) throw new Error("Erro na API");

        const data = await res.json();
        setImages(pageNum === 1 ? data.results : [...images, ...data.results]);
      } catch (err) {
        toast.error("Erro ao buscar imagens. Tente novamente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [images]
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        debounceSearch(searchQuery, 1);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceSearch]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    debounceSearch(searchQuery, nextPage);
  }

  function handleSelect(image: UnsplashImage) {
    setSelectedImage(image);
  }

  function handleInsert() {
    if (!selectedImage) {
      toast.error("Selecione uma imagem primeiro.");
      return;
    }

    onSelectImage(selectedImage.urls.regular);
    toast.success("Imagem inserida no slide! ✅");
    setSelectedImage(null);
    setImages([]);
    setSearchQuery("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 px-2">
          <Search className="h-3.5 w-3.5 text-rose-600" />
          Unsplash
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-rose-600" />
            Buscar Imagens Unsplash
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar imagens por palavra-chave..."
              className="pl-9 text-sm"
            />
          </div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-3">
                {images.length} imagens encontradas
              </p>
              <div className="grid grid-cols-3 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleSelect(image)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden aspect-square group transition-all ${
                      selectedImage?.id === image.id
                        ? "ring-2 ring-rose-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    <img
                      src={image.urls.thumb}
                      alt={image.alt_description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {selectedImage?.id === image.id && (
                      <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                        <div className="bg-rose-600 text-white rounded-full p-2">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery.trim() && images.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">
                Nenhuma imagem encontrada para "{searchQuery}". Tente outro termo.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            </div>
          )}

          {/* Selected Image Details */}
          {selectedImage && (
            <div className="border border-rose-200 rounded-lg p-4 bg-rose-50 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-rose-700 mb-1">
                    Imagem selecionada
                  </p>
                  <p className="text-[10px] text-rose-600">
                    Foto por{" "}
                    <a
                      href={selectedImage.links.html}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-rose-700 inline-flex items-center gap-1"
                    >
                      {selectedImage.user.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {" "}no Unsplash
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-rose-600 italic">
                Crédito obrigatório: Unsplash
              </p>
              <Button
                onClick={handleInsert}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Inserir Imagem no Slide
              </Button>
            </div>
          )}

          {/* Load More Button */}
          {images.length > 0 && searchQuery.trim() && (
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              className="w-full text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Carregar Mais Imagens"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
