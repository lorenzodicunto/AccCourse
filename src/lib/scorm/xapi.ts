// xAPI (Tin Can) & cmi5 Statement Generator
// Generates xAPI statements for Learning Record Store (LRS) integration
// with full cmi5 profile support for modern LMS compatibility
// Used in the SCORM player alongside SCORM 1.2 for advanced learning analytics

import { CourseProject, QuizBlock } from "@/store/useEditorStore";

// ═══════════════════════════════════════════════════════════════════════════
// Interfaces e Tipos
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Interface base para declarações xAPI padrão
 */
export interface XAPIStatement {
  actor: { name: string; mbox: string };
  verb: { id: string; display: { "pt-BR": string } };
  object: { id: string; definition: { name: { "pt-BR": string }; description?: { "pt-BR": string }; type: string } };
  result?: { score?: { scaled: number; raw: number; max: number }; success?: boolean; completion?: boolean; duration?: string; response?: string };
  context?: {
    registration?: string;
    language?: string;
    extensions?: Record<string, unknown>;
    contextActivities?: {
      parent?: Array<{ id: string; objectType: string }>;
      grouping?: Array<{ id: string; objectType: string }>;
      category?: Array<{ id: string; objectType: string }>;
    };
  };
  timestamp: string;
}

/**
 * Interface para rastreamento de sessão cmi5
 */
export interface Cmi5Session {
  registration: string;
  masteryScore: number;
  launchUrl: string;
  authToken: string;
  sessionId: string;
}

/**
 * Interface para dados de rastreamento de mídia
 */
export interface MediaEventData {
  type: "played" | "paused" | "seeked" | "completed";
  mediaId: string;
  mediaName: string;
  currentTime: number;
  duration: number;
  timestamp: string;
}

/**
 * Interface para resposta de pesquisa
 */
export interface SurveyResponse {
  surveyId: string;
  surveyName: string;
  questionId: string;
  questionText: string;
  responseValue: string | number | boolean;
  timestamp: string;
}

/**
 * Interface para eventos de interação
 */
export interface InteractionEvent {
  interactionId: string;
  interactionName: string;
  interactionType: "matching" | "sequencing" | "numeric" | "likert" | "choice" | "fill-in" | "hotspot" | "dragdrop" | "true-false";
  response: string;
  correctResponse?: string;
  success?: boolean;
  timestamp: string;
}

/**
 * Interface para dados de painel analítico xAPI
 */
export interface XAPIDashboardData {
  totalStatements: number;
  verbs: string[];
  interactions: number;
  estimatedDuration: string;
  completionRate: number;
  engagementLevel: "low" | "medium" | "high";
  trackingCapabilities: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Constantes: Verbos xAPI Padrão
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verbos xAPI padrão incluindo cmi5
 */
const VERBS = {
  // Verbos básicos
  launched: { id: "http://adlnet.gov/expapi/verbs/launched", display: { "pt-BR": "iniciou" } },
  completed: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "pt-BR": "completou" } },
  passed: { id: "http://adlnet.gov/expapi/verbs/passed", display: { "pt-BR": "foi aprovado em" } },
  failed: { id: "http://adlnet.gov/expapi/verbs/failed", display: { "pt-BR": "reprovou em" } },
  answered: { id: "http://adlnet.gov/expapi/verbs/answered", display: { "pt-BR": "respondeu" } },
  experienced: { id: "http://adlnet.gov/expapi/verbs/experienced", display: { "pt-BR": "visualizou" } },
  interacted: { id: "http://adlnet.gov/expapi/verbs/interacted", display: { "pt-BR": "interagiu com" } },
  progressed: { id: "http://adlnet.gov/expapi/verbs/progressed", display: { "pt-BR": "progrediu em" } },

  // Verbos cmi5
  initialized: { id: "http://adlnet.gov/expapi/verbs/initialized", display: { "pt-BR": "inicializou" } },
  terminated: { id: "http://adlnet.gov/expapi/verbs/terminated", display: { "pt-BR": "finalizou" } },
  suspended: { id: "http://adlnet.gov/expapi/verbs/suspended", display: { "pt-BR": "pausou" } },
  resumed: { id: "http://adlnet.gov/expapi/verbs/resumed", display: { "pt-BR": "retomou" } },
  abandoned: { id: "http://adlnet.gov/expapi/verbs/abandoned", display: { "pt-BR": "abandonou" } },

  // Verbos adicionais
  attempted: { id: "http://adlnet.gov/expapi/verbs/attempted", display: { "pt-BR": "tentou" } },
  mastered: { id: "http://adlnet.gov/expapi/verbs/mastered", display: { "pt-BR": "dominou" } },
  preferred: { id: "http://adlnet.gov/expapi/verbs/preferred", display: { "pt-BR": "preferiu" } },
  commented: { id: "http://adlnet.gov/expapi/verbs/commented", display: { "pt-BR": "comentou em" } },
};

// ═══════════════════════════════════════════════════════════════════════════
// Constantes: Tipos de Atividades
// ═══════════════════════════════════════════════════════════════════════════

const ACTIVITY_TYPES = {
  course: "http://adlnet.gov/expapi/activities/course",
  module: "http://adlnet.gov/expapi/activities/module",
  assessment: "http://adlnet.gov/expapi/activities/assessment",
  interaction: "http://adlnet.gov/expapi/activities/cmi.interaction",
  video: "http://adlnet.gov/expapi/activities/video",
  audio: "http://adlnet.gov/expapi/activities/audio",
  survey: "http://adlnet.gov/expapi/activities/survey",
};

// ═══════════════════════════════════════════════════════════════════════════
// Constantes: Critérios cmi5 moveOn
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Critérios de conclusão cmi5 (moveOn)
 */
export const CMI5_MOVE_ON = {
  Passed: "Passed",
  Completed: "Completed",
  CompletedAndPassed: "CompletedAndPassed",
  CompletedOrPassed: "CompletedOrPassed",
  NotApplicable: "NotApplicable",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Funções Utilitárias
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Escapa caracteres XML especiais
 * @param str String a escapar
 * @returns String escapada
 */
function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Converte milissegundos para formato ISO 8601 de duração
 * @param ms Milissegundos
 * @returns String em formato PT{h}H{m}M{s}S
 */
export function msToISO8601Duration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = "PT";
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (seconds > 0) result += `${seconds}S`;

  return result || "PT0S";
}

/**
 * Gera um UUID v4
 * @returns UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Geração de Scripts xAPI e cmi5
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera o JavaScript xAPI padrão para integração no player SCORM
 * Envia declarações para um endpoint LRS configurado com suporte a contexto avançado
 * @param project Projeto do curso
 * @returns Script JavaScript xAPI
 */
export function generateXAPIScript(project: CourseProject): string {
  const courseId = `https://acccourse.app/courses/${project.id}`;
  const sessionId = generateUUID();

  return `
    // ─── xAPI Integration (Enhanced) ───
    var xAPIConfig = {
      endpoint: window.XAPI_ENDPOINT || '',
      auth: window.XAPI_AUTH || '',
      courseId: '${courseId}',
      courseName: ${JSON.stringify(project.title)},
      courseDesc: ${JSON.stringify(project.description)},
      sessionId: '${sessionId}',
      platform: window.XAPI_PLATFORM || 'AccCourse',
      courseVersion: window.XAPI_COURSE_VERSION || '1.0',
      startTime: new Date().toISOString(),
    };

    /**
     * Envia uma declaração xAPI para o LRS
     */
    function sendXAPIStatement(verb, objectId, objectName, objectType, result, context) {
      if (!xAPIConfig.endpoint) return;

      var statement = {
        actor: {
          name: window.LEARNER_NAME || 'Aluno',
          mbox: 'mailto:' + (window.LEARNER_EMAIL || 'aluno@acccourse.app'),
        },
        verb: verb,
        object: {
          id: objectId || xAPIConfig.courseId,
          definition: {
            name: { 'pt-BR': objectName || xAPIConfig.courseName },
            type: objectType || '${ACTIVITY_TYPES.course}',
          },
        },
        timestamp: new Date().toISOString(),
      };

      if (result) statement.result = result;

      if (context) {
        statement.context = context;
      } else {
        statement.context = {
          language: 'pt-BR',
          extensions: {
            'http://acccourse.app/extensions/sessionId': xAPIConfig.sessionId,
            'http://acccourse.app/extensions/platform': xAPIConfig.platform,
            'http://acccourse.app/extensions/courseVersion': xAPIConfig.courseVersion,
          },
          contextActivities: {
            parent: [{ id: xAPIConfig.courseId, objectType: 'Activity' }],
          },
        };
      }

      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', xAPIConfig.endpoint + '/statements', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Experience-API-Version', '1.0.3');
        if (xAPIConfig.auth) xhr.setRequestHeader('Authorization', xAPIConfig.auth);
        xhr.send(JSON.stringify(statement));
      } catch(e) { console.warn('xAPI send failed', e); }
    }

    // Send "launched" on load
    sendXAPIStatement(
      ${JSON.stringify(VERBS.launched)},
      xAPIConfig.courseId,
      xAPIConfig.courseName,
      '${ACTIVITY_TYPES.course}'
    );

    // Track slide views
    var xapiSlideViewed = {};
    function trackSlideView(slideIndex, slideName) {
      if (xapiSlideViewed[slideIndex]) return;
      xapiSlideViewed[slideIndex] = true;
      sendXAPIStatement(
        ${JSON.stringify(VERBS.experienced)},
        xAPIConfig.courseId + '/slide/' + slideIndex,
        slideName || ('Slide ' + (slideIndex + 1)),
        '${ACTIVITY_TYPES.module}'
      );
    }

    // Track quiz answers with enhanced context
    function trackQuizAnswer(blockId, questionName, isCorrect, score, maxScore) {
      var context = {
        language: 'pt-BR',
        extensions: {
          'http://acccourse.app/extensions/sessionId': xAPIConfig.sessionId,
          'http://acccourse.app/extensions/progress': maxScore > 0 ? (score / maxScore) : 0,
        },
        contextActivities: {
          parent: [{ id: xAPIConfig.courseId, objectType: 'Activity' }],
          category: [{ id: '${ACTIVITY_TYPES.assessment}', objectType: 'Activity' }],
        },
      };

      sendXAPIStatement(
        ${JSON.stringify(VERBS.answered)},
        xAPIConfig.courseId + '/quiz/' + blockId,
        questionName,
        '${ACTIVITY_TYPES.interaction}',
        {
          score: { scaled: maxScore > 0 ? score / maxScore : 0, raw: score, max: maxScore },
          success: isCorrect,
          completion: true,
        },
        context
      );
    }

    // Track course completion
    function trackCourseCompletion(passed, scorePercentage, earned, total) {
      var duration = new Date().toISOString().replace(/[^0-9T:]/g, '');
      var context = {
        language: 'pt-BR',
        extensions: {
          'http://acccourse.app/extensions/sessionId': xAPIConfig.sessionId,
          'http://acccourse.app/extensions/completionPercentage': scorePercentage / 100,
        },
      };

      sendXAPIStatement(
        passed ? ${JSON.stringify(VERBS.passed)} : ${JSON.stringify(VERBS.failed)},
        xAPIConfig.courseId,
        xAPIConfig.courseName,
        '${ACTIVITY_TYPES.course}',
        {
          score: { scaled: scorePercentage / 100, raw: earned, max: total },
          success: passed,
          completion: true,
        },
        context
      );
    }

    // Track media events
    function trackMediaEvent(mediaId, mediaName, eventType, currentTime, duration) {
      var mediaVerb = {
        'played': ${JSON.stringify(VERBS.progressed)},
        'paused': ${JSON.stringify(VERBS.suspended)},
        'completed': ${JSON.stringify(VERBS.completed)},
        'seeked': ${JSON.stringify(VERBS.interacted)},
      }[eventType] || ${JSON.stringify(VERBS.interacted)};

      var result = {
        completion: eventType === 'completed',
      };
      if (duration) result.duration = 'PT' + Math.floor(currentTime || 0) + 'S';

      sendXAPIStatement(
        mediaVerb,
        xAPIConfig.courseId + '/media/' + mediaId,
        mediaName,
        eventType === 'played' || eventType === 'paused' ? '${ACTIVITY_TYPES.video}' : '${ACTIVITY_TYPES.module}',
        result
      );
    }

    // Track survey responses
    function trackSurveyResponse(surveyId, surveyName, questionId, questionText, response) {
      sendXAPIStatement(
        ${JSON.stringify(VERBS.answered)},
        xAPIConfig.courseId + '/survey/' + surveyId + '/question/' + questionId,
        questionText,
        '${ACTIVITY_TYPES.survey}',
        { response: response }
      );
    }

    // Track generic interactions (drag-drop, matching, hotspot)
    function trackInteraction(interactionId, interactionName, interactionType, response, success) {
      sendXAPIStatement(
        success ? ${JSON.stringify(VERBS.mastered)} : ${JSON.stringify(VERBS.attempted)},
        xAPIConfig.courseId + '/interaction/' + interactionId,
        interactionName,
        '${ACTIVITY_TYPES.interaction}',
        { success: success, completion: true }
      );
    }
  `;
}

/**
 * Gera o script JavaScript para comunicação cmi5 com LMS
 * Implementa autenticação cmi5 via fetch e manipulação de tokens
 * @param session Configuração da sessão cmi5
 * @returns Script JavaScript cmi5
 */
export function generateCmi5Script(session: Cmi5Session): string {
  return `
    // ─── cmi5 Integration ───
    var cmi5Config = {
      registration: '${session.registration}',
      masteryScore: ${session.masteryScore},
      launchUrl: '${session.launchUrl}',
      authToken: '${session.authToken}',
      sessionId: '${session.sessionId}',
      lrsEndpoint: new URL('${session.launchUrl}').origin,
      moveOn: 'CompletedAndPassed',
    };

    /**
     * Envia declaração xAPI com autenticação cmi5
     */
    async function sendCmi5Statement(statement) {
      if (!cmi5Config.authToken) {
        console.warn('cmi5: Token de autenticação não configurado');
        return;
      }

      try {
        var statementId = generateCmi5UUID();
        var response = await fetch(cmi5Config.lrsEndpoint + '/xapi/statements', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cmi5Config.authToken,
            'X-Experience-API-Version': '1.0.3',
          },
          body: JSON.stringify({
            id: statementId,
            ...statement,
            context: {
              ...statement.context,
              registration: cmi5Config.registration,
            },
          }),
        });

        if (!response.ok) {
          console.warn('cmi5 statement send failed:', response.status);
        }
      } catch(e) {
        console.warn('cmi5 fetch failed', e);
      }
    }

    /**
     * Gera UUID para cmi5
     */
    function generateCmi5UUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    /**
     * Inicializa sessão cmi5
     */
    async function initializeCmi5() {
      var initStatement = {
        actor: {
          name: window.LEARNER_NAME || 'Aluno',
          mbox: 'mailto:' + (window.LEARNER_EMAIL || 'aluno@acccourse.app'),
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/initialized',
          display: { 'pt-BR': 'inicializou' },
        },
        object: {
          id: window.ACTIVITY_ID || cmi5Config.launchUrl,
          definition: {
            name: { 'pt-BR': window.ACTIVITY_NAME || 'Atividade cmi5' },
            type: 'http://adlnet.gov/expapi/activities/course',
          },
        },
        timestamp: new Date().toISOString(),
      };

      await sendCmi5Statement(initStatement);
    }

    /**
     * Encerra sessão cmi5
     */
    async function terminateCmi5(passed) {
      var termStatement = {
        actor: {
          name: window.LEARNER_NAME || 'Aluno',
          mbox: 'mailto:' + (window.LEARNER_EMAIL || 'aluno@acccourse.app'),
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/terminated',
          display: { 'pt-BR': 'finalizou' },
        },
        object: {
          id: window.ACTIVITY_ID || cmi5Config.launchUrl,
          definition: {
            name: { 'pt-BR': window.ACTIVITY_NAME || 'Atividade cmi5' },
            type: 'http://adlnet.gov/expapi/activities/course',
          },
        },
        result: {
          success: passed,
          completion: true,
        },
        timestamp: new Date().toISOString(),
      };

      await sendCmi5Statement(termStatement);
    }

    // Initialize cmi5 on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeCmi5);
    } else {
      initializeCmi5();
    }

    // Terminate cmi5 on unload
    window.addEventListener('beforeunload', function() {
      terminateCmi5(window.COURSE_PASSED || false);
    });
  `;
}

/**
 * Gera XML tincan para pacotes xAPI (compatível com Tin Can)
 * @param projectId ID do projeto
 * @param title Título do curso
 * @param description Descrição do curso
 * @returns XML tincan
 */
export function generateTinCanXML(projectId: string, title: string, description: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
  <activities>
    <activity id="https://acccourse.app/courses/${projectId}" type="http://adlnet.gov/expapi/activities/course">
      <name>${escapeXml(title)}</name>
      <description lang="pt-BR">${escapeXml(description)}</description>
      <launch lang="pt-BR">index.html</launch>
    </activity>
  </activities>
</tincan>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Funções de Rastreamento Especializado
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rastreia eventos de mídia (vídeo/áudio)
 * Cria declarações xAPI para events de reprodução, pausa, conclusão
 * @param mediaData Dados do evento de mídia
 * @returns Declaração xAPI formatada
 */
export function createMediaEventStatement(mediaData: MediaEventData): XAPIStatement {
  const verbMap: Record<string, (typeof VERBS)[keyof typeof VERBS]> = {
    played: VERBS.progressed,
    paused: VERBS.suspended,
    seeked: VERBS.interacted,
    completed: VERBS.completed,
  };

  const verb = verbMap[mediaData.type] || VERBS.interacted;
  const activityType = mediaData.mediaName.toLowerCase().includes("vídeo") ? ACTIVITY_TYPES.video : ACTIVITY_TYPES.audio;

  return {
    actor: {
      name: "Aluno",
      mbox: "mailto:aluno@acccourse.app",
    },
    verb,
    object: {
      id: `https://acccourse.app/media/${mediaData.mediaId}`,
      definition: {
        name: { "pt-BR": mediaData.mediaName },
        type: activityType,
      },
    },
    result: {
      completion: mediaData.type === "completed",
      duration: msToISO8601Duration(mediaData.currentTime * 1000),
    },
    timestamp: mediaData.timestamp,
  };
}

/**
 * Rastreia respostas de pesquisa
 * Cria declarações xAPI para respostas de questionários
 * @param surveyResponse Resposta da pesquisa
 * @returns Declaração xAPI formatada
 */
export function createSurveyResponseStatement(surveyResponse: SurveyResponse): XAPIStatement {
  return {
    actor: {
      name: "Aluno",
      mbox: "mailto:aluno@acccourse.app",
    },
    verb: VERBS.answered,
    object: {
      id: `https://acccourse.app/survey/${surveyResponse.surveyId}/question/${surveyResponse.questionId}`,
      definition: {
        name: { "pt-BR": surveyResponse.questionText },
        description: { "pt-BR": surveyResponse.surveyName },
        type: ACTIVITY_TYPES.survey,
      },
    },
    result: {
      response: String(surveyResponse.responseValue),
      completion: true,
    },
    timestamp: surveyResponse.timestamp,
  };
}

/**
 * Rastreia eventos de interação (drag-drop, matching, hotspot)
 * Cria declarações xAPI com tipos de interação específicos
 * @param interaction Evento de interação
 * @returns Declaração xAPI formatada
 */
export function createInteractionStatement(interaction: InteractionEvent): XAPIStatement {
  const verb = interaction.success ? VERBS.mastered : VERBS.attempted;

  return {
    actor: {
      name: "Aluno",
      mbox: "mailto:aluno@acccourse.app",
    },
    verb,
    object: {
      id: `https://acccourse.app/interaction/${interaction.interactionId}`,
      definition: {
        name: { "pt-BR": interaction.interactionName },
        type: ACTIVITY_TYPES.interaction,
        description: { "pt-BR": `Tipo: ${interaction.interactionType}` },
      },
    },
    result: {
      response: interaction.response,
      success: interaction.success,
      completion: interaction.success,
    },
    context: {
      language: "pt-BR",
      extensions: {
        "http://acccourse.app/extensions/interactionType": interaction.interactionType,
        "http://acccourse.app/extensions/correctResponse": interaction.correctResponse,
      },
    },
    timestamp: interaction.timestamp,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Funções de Análise e Sumário
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gera sumário aprimorado de declarações xAPI para um curso
 * Útil para análise e prévia de rastreamento
 * @param project Projeto do curso
 * @returns Sumário de declarações xAPI
 */
export function generateXAPISummary(project: CourseProject): {
  totalStatements: number;
  verbs: string[];
  interactions: number;
  estimatedDuration: string;
  trackingFeatures: string[];
} {
  let interactions = 0;
  const trackingFeatures: string[] = [];

  project.slides.forEach((slide) => {
    slide.blocks.forEach((block) => {
      if (["quiz", "truefalse", "matching", "fillblank", "sorting", "hotspot", "branching", "dragdrop"].includes(block.type)) {
        interactions++;
        if (!trackingFeatures.includes("Rastreamento de Quiz")) {
          trackingFeatures.push("Rastreamento de Quiz");
        }
      }

      if (["video", "audio"].includes(block.type)) {
        if (!trackingFeatures.includes("Rastreamento de Mídia")) {
          trackingFeatures.push("Rastreamento de Mídia");
        }
      }

      if ((block.type as string) === "survey") {
        if (!trackingFeatures.includes("Rastreamento de Pesquisa")) {
          trackingFeatures.push("Rastreamento de Pesquisa");
        }
      }
    });
  });

  // Estimativa: 1 min por slide
  const estimatedMinutes = project.slides.length;
  const estimatedDuration = msToISO8601Duration(estimatedMinutes * 60 * 1000);

  // launched + completed + slide views + interactions
  const totalStatements = 2 + project.slides.length + interactions;

  trackingFeatures.push("Rastreamento de Slides");
  trackingFeatures.push("Rastreamento de Progresso");
  trackingFeatures.push("Contexto Estendido");

  return {
    totalStatements,
    verbs: ["launched", "experienced", "answered", "completed/passed/failed", "progressed", "interacted"],
    interactions,
    estimatedDuration,
    trackingFeatures,
  };
}

/**
 * Gera dados estruturados para painel analítico xAPI
 * Retorna informações formatadas para exibição em dashboard
 * @param project Projeto do curso
 * @returns Dados de painel analítico
 */
export function generateXAPIDashboardData(project: CourseProject): XAPIDashboardData {
  const summary = generateXAPISummary(project);

  let engagementLevel: "low" | "medium" | "high" = "low";
  if (summary.interactions > 5) engagementLevel = "high";
  else if (summary.interactions > 2) engagementLevel = "medium";

  // Estima taxa de conclusão baseada em estrutura do curso
  const completionRate = Math.min(100, (summary.interactions / Math.max(project.slides.length, 1)) * 100);

  return {
    totalStatements: summary.totalStatements,
    verbs: summary.verbs,
    interactions: summary.interactions,
    estimatedDuration: summary.estimatedDuration,
    completionRate,
    engagementLevel,
    trackingCapabilities: [
      "xAPI 1.0.3 Completo",
      "cmi5 Profile",
      "Rastreamento de Contexto Avançado",
      "Duração ISO 8601",
      "Extensões Customizadas",
      "Autenticação Token",
      ...summary.trackingFeatures,
    ],
  };
}

/**
 * Cria declaração xAPI personalizada com contexto completo
 * @param actor Dados do ator (learner)
 * @param verb Verbo xAPI
 * @param objectId ID da atividade
 * @param objectName Nome da atividade
 * @param objectType Tipo da atividade
 * @param result Resultado (opcional)
 * @param extensions Extensões personalizadas (opcional)
 * @returns Declaração xAPI completa
 */
export function createCustomXAPIStatement(
  actor: { name: string; email: string },
  verb: (typeof VERBS)[keyof typeof VERBS],
  objectId: string,
  objectName: string,
  objectType: string,
  result?: { score?: { scaled: number; raw: number; max: number }; success?: boolean; completion?: boolean },
  extensions?: Record<string, unknown>
): XAPIStatement {
  return {
    actor: {
      name: actor.name,
      mbox: `mailto:${actor.email}`,
    },
    verb,
    object: {
      id: objectId,
      definition: {
        name: { "pt-BR": objectName },
        type: objectType,
      },
    },
    result,
    context: {
      language: "pt-BR",
      extensions: {
        "http://acccourse.app/extensions/timestamp": new Date().toISOString(),
        ...(extensions || {}),
      },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Exporções públicas para compatibilidade com código existente
 */
export { VERBS, ACTIVITY_TYPES };
