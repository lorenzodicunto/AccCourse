// xAPI (Tin Can) Statement Generator
// Generates xAPI statements for Learning Record Store (LRS) integration
// Used in the SCORM player alongside SCORM 1.2 for modern LMS support

import { CourseProject, QuizBlock } from "@/store/useEditorStore";

export interface XAPIStatement {
  actor: { name: string; mbox: string };
  verb: { id: string; display: { "pt-BR": string } };
  object: { id: string; definition: { name: { "pt-BR": string }; description?: { "pt-BR": string }; type: string } };
  result?: { score?: { scaled: number; raw: number; max: number }; success?: boolean; completion?: boolean; duration?: string };
  timestamp: string;
}

// Standard xAPI Verbs
const VERBS = {
  launched: { id: "http://adlnet.gov/expapi/verbs/launched", display: { "pt-BR": "iniciou" } },
  completed: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "pt-BR": "completou" } },
  passed: { id: "http://adlnet.gov/expapi/verbs/passed", display: { "pt-BR": "foi aprovado em" } },
  failed: { id: "http://adlnet.gov/expapi/verbs/failed", display: { "pt-BR": "reprovou em" } },
  answered: { id: "http://adlnet.gov/expapi/verbs/answered", display: { "pt-BR": "respondeu" } },
  experienced: { id: "http://adlnet.gov/expapi/verbs/experienced", display: { "pt-BR": "visualizou" } },
  interacted: { id: "http://adlnet.gov/expapi/verbs/interacted", display: { "pt-BR": "interagiu com" } },
  progressed: { id: "http://adlnet.gov/expapi/verbs/progressed", display: { "pt-BR": "progrediu em" } },
};

const ACTIVITY_TYPES = {
  course: "http://adlnet.gov/expapi/activities/course",
  module: "http://adlnet.gov/expapi/activities/module",
  assessment: "http://adlnet.gov/expapi/activities/assessment",
  interaction: "http://adlnet.gov/expapi/activities/cmi.interaction",
};

/**
 * Generates the xAPI JavaScript to embed in the SCORM player HTML.
 * This sends statements to a configured LRS endpoint.
 */
export function generateXAPIScript(project: CourseProject): string {
  const courseId = `https://acccourse.app/courses/${project.id}`;

  return `
    // ─── xAPI Integration ───
    var xAPIConfig = {
      endpoint: window.XAPI_ENDPOINT || '',
      auth: window.XAPI_AUTH || '',
      courseId: '${courseId}',
      courseName: ${JSON.stringify(project.title)},
      courseDesc: ${JSON.stringify(project.description)},
    };

    function sendXAPIStatement(verb, objectId, objectName, objectType, result) {
      if (!xAPIConfig.endpoint) return; // Skip if no LRS configured

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
    function trackSlideView(slideIndex) {
      if (xapiSlideViewed[slideIndex]) return;
      xapiSlideViewed[slideIndex] = true;
      sendXAPIStatement(
        ${JSON.stringify(VERBS.experienced)},
        xAPIConfig.courseId + '/slide/' + slideIndex,
        'Slide ' + (slideIndex + 1),
        '${ACTIVITY_TYPES.module}'
      );
    }

    // Track quiz answers
    function trackQuizAnswer(blockId, questionName, isCorrect, score, maxScore) {
      sendXAPIStatement(
        ${JSON.stringify(VERBS.answered)},
        xAPIConfig.courseId + '/quiz/' + blockId,
        questionName,
        '${ACTIVITY_TYPES.interaction}',
        {
          score: { scaled: maxScore > 0 ? score / maxScore : 0, raw: score, max: maxScore },
          success: isCorrect,
          completion: true,
        }
      );
    }

    // Track course completion
    function trackCourseCompletion(passed, scorePercentage, earned, total) {
      sendXAPIStatement(
        passed ? ${JSON.stringify(VERBS.passed)} : ${JSON.stringify(VERBS.failed)},
        xAPIConfig.courseId,
        xAPIConfig.courseName,
        '${ACTIVITY_TYPES.course}',
        {
          score: { scaled: scorePercentage / 100, raw: earned, max: total },
          success: passed,
          completion: true,
        }
      );
    }
  `;
}

/**
 * Generates tincan.xml for xAPI packages (Tin Can compliant).
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

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Generates a summary of xAPI statements that would be sent for a course.
 * Useful for analytics and preview.
 */
export function generateXAPISummary(project: CourseProject): {
  totalStatements: number;
  verbs: string[];
  interactions: number;
} {
  let interactions = 0;
  project.slides.forEach(slide => {
    slide.blocks.forEach(block => {
      if (['quiz', 'truefalse', 'matching', 'fillblank', 'sorting', 'hotspot', 'branching', 'dragdrop'].includes(block.type)) {
        interactions++;
      }
    });
  });

  return {
    totalStatements: 2 + project.slides.length + interactions, // launched + completed + slides + interactions
    verbs: ['launched', 'experienced', 'answered', 'completed/passed/failed'],
    interactions,
  };
}
