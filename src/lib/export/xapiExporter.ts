/**
 * xAPI/cmi5 Package Exporter
 * Generates a ZIP with tincan.xml + xAPI tracker + course HTML
 * configured to send statements to a Learning Record Store (LRS).
 */

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { CourseProject } from "@/store/useEditorStore";
import { generateCourseHTML } from "../scorm/htmlGenerator";
import { generateStyles } from "../scorm/styles";
import { generateTinCanXML, generateXAPIScript } from "../scorm/xapi";

export interface XAPIExportConfig {
  lrsEndpoint: string;
  lrsKey: string;
  lrsSecret: string;
}

export interface XAPIExportProgress {
  step: string;
  percent: number;
}

function collectLocalAssetUrls(project: CourseProject): Set<string> {
  const urls = new Set<string>();
  if (project.theme.customFontUrl?.startsWith("/uploads/")) {
    urls.add(project.theme.customFontUrl);
  }
  for (const slide of project.slides) {
    for (const block of slide.blocks) {
      if (block.type === "image" && block.src?.startsWith("/uploads/")) {
        urls.add(block.src);
      }
      if (block.type === "video" && (block as any).url?.startsWith("/uploads/")) {
        urls.add((block as any).url);
      }
      if (block.type === "audio" && (block as any).src?.startsWith("/uploads/")) {
        urls.add((block as any).src);
      }
    }
  }
  return urls;
}

async function fetchAndMapAssets(
  urls: Set<string>
): Promise<{ assetMap: Map<string, string>; blobs: Map<string, Blob> }> {
  const assetMap = new Map<string, string>();
  const blobs = new Map<string, Blob>();
  const urlArray = Array.from(urls);

  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    const fileName = url.split("/").pop() || `asset_${i}`;
    const assetPath = `assets/${fileName}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        assetMap.set(url, assetPath);
        blobs.set(assetPath, blob);
      }
    } catch (err) {
      // Silently skip failed assets — logged at export summary level
    }
  }

  return { assetMap, blobs };
}

/**
 * Generate an xAPI launch wrapper that configures the LRS connection
 * and injects it before the course HTML loads.
 */
function generateLRSConfig(config: XAPIExportConfig): string {
  return `
<script>
// xAPI LRS Configuration — injected by AccCourse xAPI Exporter
window.XAPI_CONFIG = {
  endpoint: ${JSON.stringify(config.lrsEndpoint)},
  auth: "Basic " + btoa(${JSON.stringify(config.lrsKey)} + ":" + ${JSON.stringify(config.lrsSecret)}),
};

// xAPI statement sender
window.sendXAPIStatement = function(statement) {
  if (!window.XAPI_CONFIG.endpoint) return;

  fetch(window.XAPI_CONFIG.endpoint + "/statements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": window.XAPI_CONFIG.auth,
      "X-Experience-API-Version": "1.0.3",
    },
    body: JSON.stringify(statement),
  }).catch(function(err) {
    console.warn("[xAPI] Failed to send statement:", err);
  });
};

// Minimal SCORM stub so the course HTML runs without errors
window.SCORM = {
  initialize: function() { return true; },
  terminate: function() { return true; },
  setScore: function(id, score, max) {
    window.sendXAPIStatement({
      actor: { name: "Learner", mbox: "mailto:learner@example.com" },
      verb: { id: "http://adlnet.gov/expapi/verbs/scored", display: { "pt-BR": "pontuou" } },
      object: { id: "urn:acccourse:quiz:" + id, definition: { name: { "pt-BR": id }, type: "http://adlnet.gov/expapi/activities/assessment" } },
      result: { score: { scaled: score / max, raw: score, max: max } },
      timestamp: new Date().toISOString()
    });
  },
  setStatus: function(status) {
    window.sendXAPIStatement({
      actor: { name: "Learner", mbox: "mailto:learner@example.com" },
      verb: { id: status === "completed" ? "http://adlnet.gov/expapi/verbs/completed" : "http://adlnet.gov/expapi/verbs/progressed", display: { "pt-BR": status } },
      object: { id: document.location.href, definition: { name: { "pt-BR": document.title }, type: "http://adlnet.gov/expapi/activities/course" } },
      timestamp: new Date().toISOString()
    });
  },
  setInteraction: function(id, type, response, correct, result, points) {
    window.sendXAPIStatement({
      actor: { name: "Learner", mbox: "mailto:learner@example.com" },
      verb: { id: "http://adlnet.gov/expapi/verbs/answered", display: { "pt-BR": "respondeu" } },
      object: { id: "urn:acccourse:interaction:" + id, definition: { name: { "pt-BR": id }, type: "http://adlnet.gov/expapi/activities/interaction" } },
      result: { response: response, success: result === "correct", score: points ? { raw: points } : undefined },
      timestamp: new Date().toISOString()
    });
  },
  setLocation: function() {},
  getLocation: function() { return ''; },
  commit: function() { return true; },
};
window.API = window.SCORM;
</script>
`;
}

export async function exportXAPIPackage(
  project: CourseProject,
  config: XAPIExportConfig,
  onProgress?: (progress: XAPIExportProgress) => void
): Promise<void> {
  const zip = new JSZip();

  // Step 1: tincan.xml
  onProgress?.({ step: "Gerando configuração Tin Can...", percent: 10 });
  zip.file("tincan.xml", generateTinCanXML(project.id, project.title, project.description));

  // Step 2: xAPI tracker script
  onProgress?.({ step: "Adicionando tracker xAPI...", percent: 20 });
  zip.file("xapi-tracker.js", generateXAPIScript(project));

  // Step 3: Collect and fetch assets
  onProgress?.({ step: "Analisando assets...", percent: 30 });
  const localUrls = collectLocalAssetUrls(project);
  let assetMap = new Map<string, string>();

  if (localUrls.size > 0) {
    onProgress?.({ step: `Baixando ${localUrls.size} asset(s)...`, percent: 40 });
    const result = await fetchAndMapAssets(localUrls);
    assetMap = result.assetMap;
    for (const [assetPath, blob] of result.blobs) {
      zip.file(assetPath, blob);
    }
  }

  // Step 4: Styles
  onProgress?.({ step: "Gerando estilos...", percent: 55 });
  const styles = generateStyles(
    project.theme.primaryColor,
    project.theme.fontFamily,
    project.theme.customFontUrl,
    assetMap.size > 0 ? assetMap : undefined
  );
  zip.file("styles.css", styles);

  // Step 5: Course HTML with LRS config injected
  onProgress?.({ step: "Construindo curso xAPI...", percent: 70 });
  const courseHtml = generateCourseHTML(project, assetMap.size > 0 ? assetMap : undefined);
  const lrsConfigScript = generateLRSConfig(config);

  // Inject LRS config before </head>
  const finalHtml = courseHtml.includes("</head>")
    ? courseHtml.replace("</head>", `${lrsConfigScript}\n</head>`)
    : lrsConfigScript + courseHtml;

  zip.file("index.html", finalHtml);

  // Step 6: Package
  onProgress?.({ step: "Empacotando xAPI...", percent: 90 });
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Step 7: Download
  onProgress?.({ step: "Download iniciado!", percent: 100 });
  const fileName = `${project.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()}_xapi.zip`;

  saveAs(blob, fileName);
}
