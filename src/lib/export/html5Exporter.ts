/**
 * HTML5 Standalone Exporter
 * Generates a self-contained ZIP with an index.html that works offline.
 * No SCORM/xAPI dependencies — pure HTML5 course player.
 */

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { CourseProject } from "@/store/useEditorStore";
import { generateCourseHTML } from "../scorm/htmlGenerator";
import { generateStyles } from "../scorm/styles";

export interface HTML5ExportProgress {
  step: string;
  percent: number;
}

/**
 * Collect all local upload URLs from the project.
 */
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
      if (block.type === "hotspot" && (block as any).imageSrc?.startsWith("/uploads/")) {
        urls.add((block as any).imageSrc);
      }
      if (block.type === "interactiveVideo" && (block as any).src?.startsWith("/uploads/")) {
        urls.add((block as any).src);
      }
    }
  }
  return urls;
}

async function fetchAndMapAssets(
  urls: Set<string>,
  onProgress?: (step: string) => void
): Promise<{ assetMap: Map<string, string>; blobs: Map<string, Blob> }> {
  const assetMap = new Map<string, string>();
  const blobs = new Map<string, Blob>();

  const urlArray = Array.from(urls);
  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    const fileName = url.split("/").pop() || `asset_${i}`;
    const assetPath = `assets/${fileName}`;

    onProgress?.(`Baixando asset ${i + 1}/${urlArray.length}: ${fileName}`);

    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        assetMap.set(url, assetPath);
        blobs.set(assetPath, blob);
      }
    } catch (err) {
      console.warn(`Failed to fetch asset: ${url}`, err);
    }
  }

  return { assetMap, blobs };
}

/**
 * Generate a standalone HTML5 wrapper that removes SCORM dependencies.
 * Replaces SCORM API calls with no-op stubs so the course runs offline.
 */
function wrapAsStandalone(courseHtml: string, projectTitle: string): string {
  // Inject a stub SCORM API so the HTML doesn't throw errors
  const scormStub = `
<script>
// Stub SCORM API for standalone mode — no-op implementations
window.SCORM = {
  initialize: function() { return true; },
  terminate: function() { return true; },
  setScore: function() {},
  setStatus: function() {},
  setInteraction: function() {},
  setLocation: function() {},
  getLocation: function() { return ''; },
  commit: function() { return true; },
};
window.API = {
  LMSInitialize: function() { return 'true'; },
  LMSFinish: function() { return 'true'; },
  LMSGetValue: function() { return ''; },
  LMSSetValue: function() { return 'true'; },
  LMSCommit: function() { return 'true'; },
  LMSGetLastError: function() { return '0'; },
  LMSGetErrorString: function() { return ''; },
  LMSGetDiagnostic: function() { return ''; },
};
</script>
`;

  // Insert the stub right before </head> or at the very beginning
  if (courseHtml.includes("</head>")) {
    return courseHtml.replace("</head>", `${scormStub}\n</head>`);
  }
  return scormStub + courseHtml;
}

export async function exportHTML5Package(
  project: CourseProject,
  onProgress?: (progress: HTML5ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();

  // Step 1: Collect and fetch local assets
  onProgress?.({ step: "Analisando assets de mídia...", percent: 10 });
  const localUrls = collectLocalAssetUrls(project);

  let assetMap = new Map<string, string>();

  if (localUrls.size > 0) {
    onProgress?.({ step: `Baixando ${localUrls.size} asset(s)...`, percent: 25 });
    const result = await fetchAndMapAssets(localUrls, (step) => {
      onProgress?.({ step, percent: 40 });
    });
    assetMap = result.assetMap;

    for (const [assetPath, blob] of result.blobs) {
      zip.file(assetPath, blob);
    }
  }

  // Step 2: Generate styles
  onProgress?.({ step: "Gerando estilos visuais...", percent: 55 });
  const styles = generateStyles(
    project.theme.primaryColor,
    project.theme.fontFamily,
    project.theme.customFontUrl,
    assetMap.size > 0 ? assetMap : undefined
  );
  zip.file("styles.css", styles);

  // Step 3: Generate HTML and wrap as standalone
  onProgress?.({ step: "Construindo curso HTML5...", percent: 70 });
  const courseHtml = generateCourseHTML(project, assetMap.size > 0 ? assetMap : undefined);
  const standaloneHtml = wrapAsStandalone(courseHtml, project.title);
  zip.file("index.html", standaloneHtml);

  // Step 4: Add a README
  zip.file(
    "LEIA-ME.txt",
    `${project.title}\n${"=".repeat(project.title.length)}\n\nCurso HTML5 standalone exportado pelo AccCourse.\nAbra o arquivo index.html em qualquer navegador moderno.\nNenhuma conexão à internet é necessária.\n\nGerado em: ${new Date().toLocaleString("pt-BR")}\n`
  );

  // Step 5: Package
  onProgress?.({ step: "Empacotando arquivo HTML5...", percent: 90 });
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  // Step 6: Download
  onProgress?.({ step: "Download iniciado!", percent: 100 });
  const fileName = `${project.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()}_html5.zip`;

  saveAs(blob, fileName);
}
