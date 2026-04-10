"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Search,
  Grid,
  List,
  Upload,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Trash2,
  Copy,
  X,
  Eye,
  Download,
  Menu,
  BookOpen,
  Users,
  Layout,
  FolderOpen,
  Clock,
  User,
  Loader2,
  AlertCircle,
  Bell,
  LogOut,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

type Asset = {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  createdAt: string;
  uploader: { name: string; email: string };
};

type FilterType = "todos" | "imagens" | "videos" | "audios" | "documentos";
type SortType = "recentes" | "antigos" | "nome-az" | "tamanho";
type ViewType = "grid" | "list";

export default function BibliotecaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef<HTMLDivElement>(null);

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [filterType, setFilterType] = useState<FilterType>("todos");
  const [sortType, setSortType] = useState<SortType>("recentes");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load assets on mount
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/assets");
      if (!response.ok) throw new Error("Erro ao carregar assets");
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      toast.error("Erro ao carregar biblioteca.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter assets based on current filters
  const filteredAssets = assets
    .filter((asset) => {
      if (filterType === "todos") return true;
      if (filterType === "imagens" && asset.type === "image") return true;
      if (filterType === "videos" && asset.type === "video") return true;
      if (filterType === "audios" && asset.type === "audio") return true;
      if (filterType === "documentos" && asset.type === "document") return true;
      return false;
    })
    .filter((asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortType) {
        case "recentes":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "antigos":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "nome-az":
          return a.name.localeCompare(b.name);
        case "tamanho":
          return b.size - a.size;
        default:
          return 0;
      }
    });

  // Get stats
  const stats = {
    total: assets.length,
    images: assets.filter((a) => a.type === "image").length,
    videos: assets.filter((a) => a.type === "video").length,
    audios: assets.filter((a) => a.type === "audio").length,
    documents: assets.filter((a) => a.type === "document").length,
    totalSize: assets.reduce((sum, a) => sum + a.size, 0),
  };

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/assets", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erro ao fazer upload de ${file.name}`);
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast.success("Arquivos enviados com sucesso!");
      await loadAssets();
      setUploadProgress(0);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer upload."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle delete
  const handleDelete = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets?id=${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar");

      toast.success("Arquivo deletado com sucesso.");
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      setDeleteConfirm(null);
      setPreviewOpen(false);
    } catch (error) {
      toast.error("Erro ao deletar arquivo.");
      console.error(error);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // Get icon for asset type
  const getAssetIcon = (type: Asset["type"]) => {
    const iconClass = "h-8 w-8";
    switch (type) {
      case "image":
        return <ImageIcon className={`${iconClass} text-purple-600`} />;
      case "video":
        return <Film className={`${iconClass} text-violet-600`} />;
      case "audio":
        return <Music className={`${iconClass} text-violet-600`} />;
      case "document":
        return <FileText className={`${iconClass} text-blue-600`} />;
      default:
        return <FileText className={`${iconClass} text-slate-600`} />;
    }
  };

  const getAssetBgColor = (type: Asset["type"]) => {
    switch (type) {
      case "image":
        return "bg-purple-100";
      case "video":
        return "bg-violet-100";
      case "audio":
        return "bg-violet-100";
      case "document":
        return "bg-blue-100";
      default:
        return "bg-slate-100";
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-full px-6 py-3 flex items-center justify-between">
          {/* Left: Sidebar toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-xl shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                }}
              >
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  AccCourse
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-purple-700 bg-purple-100">
                    2.0
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 leading-none -mt-0.5">
                  Plataforma Enterprise E-Learning
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 bg-transparent cursor-pointer hidden sm:flex"
                onClick={() => router.push("/admin")}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>

            {/* User info + Logout */}
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-200">
              <div
                className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
                }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-900">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout: Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          aria-label="Navegação principal"
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } transition-all duration-300 border-r border-slate-200 bg-white hidden lg:flex lg:w-64 flex-col`}
        >
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <NavItem
              icon={BookOpen}
              label="Meus Cursos"
              onClick={() => router.push("/")}
            />
            <NavItem icon={Users} label="Compartilhados" />
            <NavItem icon={Layout} label="Templates" />
            <NavItem icon={FolderOpen} label="Biblioteca" active />
            <NavItem icon={Trash2} label="Lixeira" />
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" role="main" className="flex-1 mx-auto max-w-7xl px-6 py-8 w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 animate-fade-in">
            <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-600">Total de arquivos</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                <ImageIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.images}
                </p>
                <p className="text-xs text-slate-600">Imagens</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-100">
                <Film className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.videos}
                </p>
                <p className="text-xs text-slate-600">Vídeos</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-100">
                <Music className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.audios}
                </p>
                <p className="text-xs text-slate-600">Áudios</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.documents}
                </p>
                <p className="text-xs text-slate-600">Documentos</p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            ref={dragOverRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mb-8 rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? "border-purple-500 bg-purple-50"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <div className="p-12 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white border border-slate-200 mx-auto mb-4 shadow-sm">
                <Upload className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Arraste arquivos ou clique para fazer upload
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Imagens (PNG, JPG, GIF), Vídeos (MP4, WebM), Áudios (MP3, WAV), Documentos (PDF, DOC, PPT)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                }}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Selecionar arquivos
                  </>
                )}
              </button>

              {uploading && (
                <div className="mt-6">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    {Math.round(uploadProgress)}% concluído
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Biblioteca de Mídia
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {loading
                  ? "Carregando..."
                  : filteredAssets.length === 0
                  ? "Nenhum arquivo encontrado"
                  : `${filteredAssets.length} arquivo${
                      filteredAssets.length !== 1 ? "s" : ""
                    }`}
              </p>
            </div>

            {/* Search and Controls */}
            {assets.length > 0 && (
              <div className="flex flex-col gap-4">
                {/* Search bar */}
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar arquivos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Filters and controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  {/* Filter chips */}
                  <div className="flex gap-2 flex-wrap">
                    <FilterChip
                      label="Todos"
                      active={filterType === "todos"}
                      onClick={() => setFilterType("todos")}
                    />
                    <FilterChip
                      label="Imagens"
                      active={filterType === "imagens"}
                      onClick={() => setFilterType("imagens")}
                    />
                    <FilterChip
                      label="Vídeos"
                      active={filterType === "videos"}
                      onClick={() => setFilterType("videos")}
                    />
                    <FilterChip
                      label="Áudios"
                      active={filterType === "audios"}
                      onClick={() => setFilterType("audios")}
                    />
                    <FilterChip
                      label="Documentos"
                      active={filterType === "documentos"}
                      onClick={() => setFilterType("documentos")}
                    />
                  </div>

                  {/* Sort and View */}
                  <div className="flex items-center gap-3">
                    <select
                      value={sortType}
                      onChange={(e) => setSortType(e.target.value as SortType)}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="recentes">Mais recentes</option>
                      <option value="antigos">Mais antigos</option>
                      <option value="nome-az">Nome A-Z</option>
                      <option value="tamanho">Maior tamanho</option>
                    </select>

                    <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() => setViewType("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          viewType === "grid"
                            ? "bg-purple-100 text-purple-600"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Visualização em grade"
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewType("list")}
                        className={`p-2 rounded-md transition-colors ${
                          viewType === "list"
                            ? "bg-purple-100 text-purple-600"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Visualização em lista"
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assets Display */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : filteredAssets.length === 0 && assets.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
              <div className="flex items-center justify-center h-24 w-24 rounded-3xl mb-6 bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100">
                <FolderOpen className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Sua biblioteca está vazia
              </h3>
              <p className="text-slate-600 text-center max-w-md mb-8">
                Faça upload do seu primeiro arquivo para começar a organizar seus
                recursos de mídia
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all cursor-pointer shadow-md hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                }}
              >
                <Upload className="h-4 w-4" />
                Fazer upload agora
              </button>
            </div>
          ) : filteredAssets.length === 0 ? (
            /* No results */
            <div className="flex flex-col items-center justify-center py-24">
              <Search className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Nenhum resultado encontrado
              </h3>
              <p className="text-slate-600 text-sm">
                Tente ajustar os filtros ou buscar com outros termos
              </p>
            </div>
          ) : viewType === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 transition-all duration-300 hover:border-slate-300 hover:shadow-md cursor-pointer bg-white"
                >
                  {/* Preview / Icon */}
                  <button
                    onClick={() => {
                      setSelectedAsset(asset);
                      setPreviewOpen(true);
                    }}
                    className={`relative h-40 w-full overflow-hidden flex items-center justify-center ${getAssetBgColor(
                      asset.type
                    )} group-hover:brightness-110 transition-all`}
                  >
                    {asset.type === "image" ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      getAssetIcon(asset.type)
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </button>

                  {/* Floating action buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleCopyUrl(asset.url)}
                      className="p-1.5 rounded-lg shadow-sm hover:bg-slate-200 transition-colors cursor-pointer bg-white/90 border border-slate-200"
                      aria-label={`Copiar URL de ${asset.name}`}
                      title="Copiar URL"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-700" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(asset.id)}
                      className="p-1.5 rounded-lg shadow-sm hover:bg-red-100 transition-colors cursor-pointer bg-white/90 border border-slate-200"
                      aria-label={`Deletar ${asset.name}`}
                      title="Deletar"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-3">
                    <h3 className="font-medium text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                      {asset.name}
                    </h3>

                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        {asset.type === "image" && "Imagem"}
                        {asset.type === "video" && "Vídeo"}
                        {asset.type === "audio" && "Áudio"}
                        {asset.type === "document" && "Documento"}
                      </span>
                      <span className="text-[10px] font-medium text-slate-600">
                        {formatSize(asset.size)}
                      </span>
                    </div>

                    <div className="mt-auto pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <p className="line-clamp-1">
                        {asset.uploader.name}
                      </p>
                      <p>{formatDate(asset.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white animate-fade-in">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Preview
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Nome
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Tipo
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Tamanho
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Enviado por
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Data
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3.5">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setPreviewOpen(true);
                          }}
                          className={`flex items-center justify-center h-10 w-10 rounded-lg ${getAssetBgColor(
                            asset.type
                          )}`}
                        >
                          {asset.type === "image" && asset.url ? (
                            <img
                              src={asset.url}
                              alt={asset.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            getAssetIcon(asset.type)
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setPreviewOpen(true);
                          }}
                          className="text-sm font-medium text-slate-900 hover:text-purple-600 transition-colors line-clamp-1 max-w-xs"
                        >
                          {asset.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                          {asset.type === "image" && "Imagem"}
                          {asset.type === "video" && "Vídeo"}
                          {asset.type === "audio" && "Áudio"}
                          {asset.type === "document" && "Documento"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatSize(asset.size)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            {asset.uploader.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {asset.uploader.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(asset.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCopyUrl(asset.url)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
                            title="Copiar URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(asset.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      {previewOpen && selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                {selectedAsset.name}
              </h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              {/* Asset Preview */}
              <div className="mb-6 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center min-h-64">
                {selectedAsset.type === "image" ? (
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    className="max-w-full max-h-96 rounded-lg"
                  />
                ) : selectedAsset.type === "video" ? (
                  <video
                    src={selectedAsset.url}
                    controls
                    className="max-w-full max-h-96 rounded-lg"
                  />
                ) : selectedAsset.type === "audio" ? (
                  <audio
                    src={selectedAsset.url}
                    controls
                    className="w-full max-w-md"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-slate-900">
                        {selectedAsset.name}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatSize(selectedAsset.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tipo:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedAsset.type === "image" && "Imagem"}
                    {selectedAsset.type === "video" && "Vídeo"}
                    {selectedAsset.type === "audio" && "Áudio"}
                    {selectedAsset.type === "document" && "Documento"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tamanho:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatSize(selectedAsset.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Data:</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatDate(selectedAsset.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Enviado por:</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {selectedAsset.uploader.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedAsset.uploader.email}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600 break-all">
                    URL: <br />
                    <code className="text-xs bg-white p-2 rounded border border-slate-200 block mt-1 text-slate-600">
                      {selectedAsset.url}
                    </code>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleCopyUrl(selectedAsset.url)}
                  className="flex-1 gap-2 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer border border-slate-200"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                  Copiar URL
                </Button>
                <a
                  href={selectedAsset.url}
                  download={selectedAsset.name}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer border border-slate-200 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <Button
                  onClick={() => setDeleteConfirm(selectedAsset.id)}
                  className="gap-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer border border-red-200"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Deletar arquivo?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Esta ação não pode ser desfeita. O arquivo será permanentemente
                  removido da biblioteca.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="ghost"
                className="rounded-xl cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Deletar permanentemente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-slate-600">
          <p>© 2026 Accuracy. Todos os direitos reservados.</p>
          <p>AccCourse v2.0</p>
        </div>
      </footer>
    </div>
  );
}

// Helper component for sidebar navigation
function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
        active
          ? "bg-purple-100 text-purple-700"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

// Helper component for filter chips
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
        active
          ? "bg-purple-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
