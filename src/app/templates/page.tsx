"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  Package,
  MessageCircle,
  FileText,
  Loader2,
  Layers,
} from "lucide-react";
import { COURSE_TEMPLATES, CourseTemplate } from "@/lib/templates";
import { createCourse } from "@/actions/courses";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus,
  ShieldCheck,
  Package,
  MessageCircle,
  FileText,
};

const CATEGORY_LABELS: Record<string, string> = {
  blank: "Em Branco",
  onboarding: "Onboarding",
  compliance: "Compliance",
  product: "Produto",
  "soft-skills": "Soft Skills",
};

const CATEGORY_COLORS: Record<string, string> = {
  blank: "from-gray-500 to-gray-600",
  onboarding: "from-blue-500 to-blue-600",
  compliance: "from-red-500 to-red-600",
  product: "from-green-500 to-green-600",
  "soft-skills": "from-amber-500 to-amber-600",
};

export default function TemplatesPage() {
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);

  const handleUseTemplate = async (template: CourseTemplate) => {
    setCreating(template.id);
    try {
      const result = await createCourse(
        template.name,
        template.description,
        "",
        JSON.stringify(template.courseData)
      );
      toast.success(`Curso "${template.name}" criado a partir do template!`);
      router.push(`/editor/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar curso.");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-purple-600" />
              Templates de Curso
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha um template para começar rapidamente
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSE_TEMPLATES.map((template) => {
            const Icon = ICON_MAP[template.icon] || FileText;
            const isCreating = creating === template.id;

            return (
              <div
                key={template.id}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all duration-200"
              >
                {/* Color header */}
                <div
                  className={`h-32 bg-gradient-to-br ${CATEGORY_COLORS[template.category]} flex items-center justify-center`}
                >
                  <Icon className="h-12 w-12 text-white/90" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground uppercase tracking-wider">
                      {CATEGORY_LABELS[template.category]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {template.slideCount} slide{template.slideCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  <Button
                    className="w-full rounded-xl gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium cursor-pointer"
                    disabled={isCreating}
                    onClick={() => handleUseTemplate(template)}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Usar Template"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
