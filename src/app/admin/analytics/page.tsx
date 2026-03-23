"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Layers,
  CheckCircle,
  Clock,
  Blocks,
  Target,
  GraduationCap,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const projects = useEditorStore((s) => s.projects);

  // Aggregate stats
  const totalCourses = projects.length;
  let totalSlides = 0;
  let totalBlocks = 0;
  const blockTypeCounts: Record<string, number> = {};
  let totalQuizBlocks = 0;
  let totalMaxPoints = 0;
  let totalInteractions = 0;

  const assessmentTypes = ["quiz", "truefalse", "matching", "fillblank", "sorting", "hotspot", "branching", "dragdrop"];

  projects.forEach((p) => {
    totalSlides += p.slides.length;
    p.slides.forEach((slide) => {
      totalBlocks += slide.blocks.length;
      slide.blocks.forEach((block) => {
        blockTypeCounts[block.type] = (blockTypeCounts[block.type] || 0) + 1;
        if (assessmentTypes.includes(block.type)) {
          totalInteractions++;
          if ("pointsValue" in block) {
            totalMaxPoints += (block as any).pointsValue || 10;
          }
        }
        if (block.type === "quiz") totalQuizBlocks++;
      });
    });
  });

  const avgSlidesPerCourse = totalCourses > 0 ? (totalSlides / totalCourses).toFixed(1) : "0";
  const avgBlocksPerSlide = totalSlides > 0 ? (totalBlocks / totalSlides).toFixed(1) : "0";

  const blockTypeEntries = Object.entries(blockTypeCounts).sort((a, b) => b[1] - a[1]);

  const cards = [
    { icon: GraduationCap, label: "Total de Cursos", value: totalCourses, color: "text-blue-400 bg-blue-500/15" },
    { icon: Layers, label: "Total de Slides", value: totalSlides, color: "text-indigo-400 bg-indigo-500/15" },
    { icon: Blocks, label: "Total de Blocos", value: totalBlocks, color: "text-violet-400 bg-violet-500/15" },
    { icon: Target, label: "Interações", value: totalInteractions, color: "text-emerald-400 bg-emerald-500/15" },
    { icon: CheckCircle, label: "Pontos Máximos", value: totalMaxPoints, color: "text-amber-400 bg-amber-500/15" },
    { icon: BarChart3, label: "Média Slides/Curso", value: avgSlidesPerCourse, color: "text-pink-400 bg-pink-500/15" },
    { icon: FileText, label: "Média Blocos/Slide", value: avgBlocksPerSlide, color: "text-cyan-400 bg-cyan-500/15" },
    { icon: Clock, label: "~Tempo Estimado", value: `${Math.ceil(totalSlides * 1.5)}min`, color: "text-slate-400 bg-slate-500/15" },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: '#0F172A' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Métricas e análises dos cursos criados na plataforma.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Card key={card.label} className="border-white/5 shadow-none hover:border-purple-500/20 transition-all" style={{ background: '#1E293B' }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Block Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-white/5 shadow-none" style={{ background: '#1E293B' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-200">Distribuição por Tipo de Bloco</CardTitle>
            </CardHeader>
            <CardContent>
              {blockTypeEntries.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum bloco encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {blockTypeEntries.map(([type, count]) => {
                    const pct = totalBlocks > 0 ? (count / totalBlocks) * 100 : 0;
                    const isAssessment = assessmentTypes.includes(type);
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-medium text-slate-300 capitalize flex items-center gap-1.5">
                            {isAssessment && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            {type}
                          </span>
                          <span className="text-slate-400">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isAssessment ? 'bg-emerald-400' : 'bg-blue-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/5 shadow-none" style={{ background: '#1E293B' }}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-200">Cursos Criados</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum curso encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => {
                    const interCount = p.slides.reduce((acc, s) => acc + s.blocks.filter(b => assessmentTypes.includes(b.type)).length, 0);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-white/3 rounded-lg hover:bg-white/5 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-white">{p.title}</p>
                          <p className="text-[10px] text-slate-400">{p.slides.length} slides · {p.slides.reduce((a, s) => a + s.blocks.length, 0)} blocos · {interCount} interações</p>
                        </div>
                        <a href={`/editor/${p.id}`} className="text-xs text-purple-400 hover:underline font-medium">
                          Editar →
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
