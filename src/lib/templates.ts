// ─── Course Templates ──────────────────────────────────────────────────────
// Each template provides a pre-built courseData JSON structure that can be
// used to create a new course instantly.

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: "onboarding" | "compliance" | "product" | "soft-skills" | "blank";
  icon: string; // Lucide icon name
  slideCount: number;
  courseData: object;
}

// Helper to create a blank slide
function makeSlide(id: string, title: string, blocks: object[]) {
  return {
    id,
    title,
    background: "#ffffff",
    blocks,
  };
}

function textBlock(id: string, x: number, y: number, w: number, h: number, content: string, fontSize = 18) {
  return {
    id,
    type: "text",
    x, y, width: w, height: h,
    content,
    style: { fontSize, fontFamily: "Inter", color: "#1a1a2e", fontWeight: "normal" },
    animation: "none",
  };
}

function titleBlock(id: string, content: string) {
  return textBlock(id, 40, 30, 880, 60, content, 32);
}

function quizBlock(id: string, question: string, options: { text: string; correct: boolean }[]) {
  return {
    id,
    type: "quiz",
    x: 40, y: 120, width: 880, height: 350,
    question,
    options,
    feedback: { correct: "Correto!", incorrect: "Tente novamente." },
    points: 10,
    style: { fontSize: 16, fontFamily: "Inter" },
    animation: "none",
  };
}

// ─── Template: Onboarding ───
const onboardingTemplate: CourseTemplate = {
  id: "onboarding-starter",
  name: "Onboarding de Funcionários",
  description: "Apresente novos colaboradores à empresa com boas-vindas, cultura, benefícios e quiz final.",
  category: "onboarding",
  icon: "UserPlus",
  slideCount: 5,
  courseData: {
    slides: [
      makeSlide("s1", "Bem-vindo à Empresa!", [
        titleBlock("b1", "Bem-vindo à nossa equipe!"),
        textBlock("b2", 40, 110, 880, 200,
          "Estamos muito felizes em tê-lo(a) conosco. Neste curso rápido, você vai conhecer nossa missão, valores, e tudo o que precisa para começar com o pé direito."),
      ]),
      makeSlide("s2", "Nossa Missão e Valores", [
        titleBlock("b3", "Missão e Valores"),
        textBlock("b4", 40, 110, 880, 300,
          "Nossa missão é transformar a maneira como as pessoas aprendem e se desenvolvem. Nossos valores fundamentais são: inovação, colaboração, excelência e respeito mútuo."),
      ]),
      makeSlide("s3", "Estrutura da Empresa", [
        titleBlock("b5", "Como estamos organizados"),
        textBlock("b6", 40, 110, 880, 300,
          "Conheça os departamentos principais: RH, Tecnologia, Comercial, Operações e Financeiro. Cada equipe tem um papel fundamental no nosso sucesso coletivo."),
      ]),
      makeSlide("s4", "Benefícios e Ferramentas", [
        titleBlock("b7", "Seus Benefícios"),
        textBlock("b8", 40, 110, 880, 300,
          "Plano de saúde, vale-refeição, horário flexível, home office, auxílio educação e muito mais. Acesse o portal do colaborador para detalhes completos."),
      ]),
      makeSlide("s5", "Quiz de Boas-vindas", [
        titleBlock("b9", "Vamos testar seu conhecimento!"),
        quizBlock("b10", "Qual é o principal valor da empresa mencionado neste curso?", [
          { text: "Competitividade", correct: false },
          { text: "Inovação e Colaboração", correct: true },
          { text: "Lucro máximo", correct: false },
          { text: "Hierarquia rígida", correct: false },
        ]),
      ]),
    ],
    settings: {
      scormVersion: "1.2",
      passingScore: 70,
      completionThreshold: 100,
    },
  },
};

// ─── Template: Compliance ───
const complianceTemplate: CourseTemplate = {
  id: "compliance-lgpd",
  name: "Compliance — LGPD",
  description: "Treinamento sobre proteção de dados pessoais conforme a Lei Geral de Proteção de Dados.",
  category: "compliance",
  icon: "ShieldCheck",
  slideCount: 5,
  courseData: {
    slides: [
      makeSlide("s1", "LGPD — Introdução", [
        titleBlock("b1", "Lei Geral de Proteção de Dados"),
        textBlock("b2", 40, 110, 880, 250,
          "A LGPD (Lei nº 13.709/2018) regulamenta o tratamento de dados pessoais no Brasil. Todos os colaboradores devem entender seus princípios e obrigações."),
      ]),
      makeSlide("s2", "O que são Dados Pessoais?", [
        titleBlock("b3", "Dados Pessoais e Sensíveis"),
        textBlock("b4", 40, 110, 880, 300,
          "Dados pessoais: nome, CPF, email, endereço. Dados sensíveis: origem racial, convicção religiosa, dados de saúde, dados biométricos. Ambos exigem tratamento adequado."),
      ]),
      makeSlide("s3", "Princípios da LGPD", [
        titleBlock("b5", "10 Princípios Fundamentais"),
        textBlock("b6", 40, 110, 880, 300,
          "Finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização."),
      ]),
      makeSlide("s4", "Boas Práticas no Dia a Dia", [
        titleBlock("b7", "Como Proteger Dados no Trabalho"),
        textBlock("b8", 40, 110, 880, 300,
          "Não compartilhe senhas. Bloqueie o computador ao sair. Não envie dados pessoais por canais inseguros. Reporte incidentes ao DPO imediatamente."),
      ]),
      makeSlide("s5", "Avaliação Final", [
        titleBlock("b9", "Teste seus conhecimentos"),
        quizBlock("b10", "Qual destes NÃO é um dado pessoal sensível segundo a LGPD?", [
          { text: "Dados de saúde", correct: false },
          { text: "Email corporativo", correct: true },
          { text: "Convicção religiosa", correct: false },
          { text: "Dados biométricos", correct: false },
        ]),
      ]),
    ],
    settings: {
      scormVersion: "1.2",
      passingScore: 80,
      completionThreshold: 100,
    },
  },
};

// ─── Template: Product Training ───
const productTemplate: CourseTemplate = {
  id: "product-training",
  name: "Treinamento de Produto",
  description: "Apresente um novo produto ou serviço com funcionalidades, benefícios e quiz de validação.",
  category: "product",
  icon: "Package",
  slideCount: 4,
  courseData: {
    slides: [
      makeSlide("s1", "Conheça o Produto", [
        titleBlock("b1", "Nosso Novo Produto"),
        textBlock("b2", 40, 110, 880, 250,
          "Apresentamos o [Nome do Produto] — uma solução inovadora que resolve [problema específico] de forma simples e eficiente. Personalize este template com suas informações."),
      ]),
      makeSlide("s2", "Funcionalidades Principais", [
        titleBlock("b3", "Funcionalidades"),
        textBlock("b4", 40, 110, 880, 300,
          "1) Funcionalidade A — descrição breve.\n2) Funcionalidade B — descrição breve.\n3) Funcionalidade C — descrição breve.\n\nPersonalize cada item com as features reais do seu produto."),
      ]),
      makeSlide("s3", "Casos de Uso", [
        titleBlock("b5", "Como nossos clientes usam"),
        textBlock("b6", 40, 110, 880, 300,
          "Case 1: Empresa X reduziu custos em 30%.\nCase 2: Empresa Y aumentou produtividade em 50%.\n\nAdicione seus próprios cases de sucesso aqui."),
      ]),
      makeSlide("s4", "Quiz — Produto", [
        titleBlock("b7", "Verifique seu aprendizado"),
        quizBlock("b8", "Qual é o principal benefício do produto apresentado?", [
          { text: "Reduzir custos", correct: false },
          { text: "Resolver [problema específico]", correct: true },
          { text: "Substituir a equipe", correct: false },
          { text: "Nenhuma das alternativas", correct: false },
        ]),
      ]),
    ],
    settings: {
      scormVersion: "1.2",
      passingScore: 70,
      completionThreshold: 100,
    },
  },
};

// ─── Template: Soft Skills ───
const softSkillsTemplate: CourseTemplate = {
  id: "soft-skills-communication",
  name: "Comunicação Efetiva",
  description: "Desenvolva habilidades de comunicação no ambiente de trabalho com técnicas práticas.",
  category: "soft-skills",
  icon: "MessageCircle",
  slideCount: 4,
  courseData: {
    slides: [
      makeSlide("s1", "Comunicação Efetiva", [
        titleBlock("b1", "A Arte de Comunicar Bem"),
        textBlock("b2", 40, 110, 880, 250,
          "Uma boa comunicação é a base de qualquer equipe de sucesso. Neste curso, vamos explorar técnicas para melhorar sua comunicação no dia a dia profissional."),
      ]),
      makeSlide("s2", "Escuta Ativa", [
        titleBlock("b3", "Primeiro: Ouvir"),
        textBlock("b4", 40, 110, 880, 300,
          "A escuta ativa é a habilidade de se concentrar totalmente no que o outro está dizendo. Envolve: manter contato visual, não interromper, fazer perguntas de clarificação e parafrasear para confirmar entendimento."),
      ]),
      makeSlide("s3", "Feedback Construtivo", [
        titleBlock("b5", "Como dar e receber feedback"),
        textBlock("b6", 40, 110, 880, 300,
          "Use o modelo SBI: Situação (quando/onde), Comportamento (o que foi feito), Impacto (qual o efeito). Seja específico, oportuno e focado no comportamento, não na pessoa."),
      ]),
      makeSlide("s4", "Quiz Final", [
        titleBlock("b7", "Teste seu conhecimento"),
        quizBlock("b8", "O que significa 'escuta ativa'?", [
          { text: "Ouvir enquanto faz outras coisas", correct: false },
          { text: "Concentrar-se totalmente no interlocutor", correct: true },
          { text: "Concordar com tudo que é dito", correct: false },
          { text: "Falar mais do que ouvir", correct: false },
        ]),
      ]),
    ],
    settings: {
      scormVersion: "1.2",
      passingScore: 70,
      completionThreshold: 100,
    },
  },
};

// ─── Template: Blank ───
const blankTemplate: CourseTemplate = {
  id: "blank",
  name: "Curso em Branco",
  description: "Comece do zero com um curso vazio e totalmente personalizável.",
  category: "blank",
  icon: "FileText",
  slideCount: 1,
  courseData: {
    slides: [
      makeSlide("s1", "Slide 1", [
        titleBlock("b1", "Título do Curso"),
        textBlock("b2", 40, 110, 880, 200, "Comece a criar seu conteúdo aqui."),
      ]),
    ],
    settings: {
      scormVersion: "1.2",
      passingScore: 70,
      completionThreshold: 100,
    },
  },
};

export const COURSE_TEMPLATES: CourseTemplate[] = [
  blankTemplate,
  onboardingTemplate,
  complianceTemplate,
  productTemplate,
  softSkillsTemplate,
];

export function getTemplateById(id: string): CourseTemplate | undefined {
  return COURSE_TEMPLATES.find((t) => t.id === id);
}
