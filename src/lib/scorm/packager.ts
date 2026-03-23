// SCORM 1.2 Package Builder
// Client-side ZIP generation with JSZip + FileSaver
// Phase 10: Asset Bundler — fetches /uploads/ files and bundles them into assets/ folder

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { CourseProject } from "@/store/useEditorStore";
import { generateManifest } from "./manifest";
import { generateCourseHTML } from "./htmlGenerator";
import { generateStyles } from "./styles";
import { SCORM_API_JS } from "./scormApi";
import { generateTinCanXML, generateXAPIScript } from "./xapi";

export interface ExportProgress {
  step: string;
  percent: number;
}

/**
 * Collect all local upload URLs (/uploads/...) from the project state.
 * Returns a Set of unique URLs to fetch.
 */
function collectLocalAssetUrls(project: CourseProject): Set<string> {
  const urls = new Set<string>();

  // Check custom font
  if (project.theme.customFontUrl?.startsWith("/uploads/")) {
    urls.add(project.theme.customFontUrl);
  }

  // Check all image blocks across all slides
  for (const slide of project.slides) {
    for (const block of slide.blocks) {
      if (block.type === "image" && block.src?.startsWith("/uploads/")) {
        urls.add(block.src);
      }
    }
  }

  return urls;
}

/**
 * Fetch local assets and build a map: original URL → ZIP-relative path.
 * Also returns the fetched blobs for zipping.
 */
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

export async function exportScormPackage(
  project: CourseProject,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();

  // Step 1: Generate imsmanifest.xml
  onProgress?.({ step: "Gerando manifesto SCORM...", percent: 5 });
  const manifest = generateManifest(
    project.id,
    project.title,
    project.description
  );
  zip.file("imsmanifest.xml", manifest);

  // Step 2: Generate SCORM API
  onProgress?.({ step: "Incluindo API SCORM 1.2...", percent: 15 });
  zip.file("scorm-api.js", SCORM_API_JS);

  // Step 2.5: Generate xAPI support (Tin Can)
  onProgress?.({ step: "Adicionando suporte xAPI...", percent: 18 });
  zip.file("tincan.xml", generateTinCanXML(project.id, project.title, project.description));
  zip.file("xapi-tracker.js", generateXAPIScript(project));

  // Step 3: Collect and fetch local assets
  onProgress?.({ step: "Analisando assets de mídia...", percent: 25 });
  const localUrls = collectLocalAssetUrls(project);

  let assetMap = new Map<string, string>();

  if (localUrls.size > 0) {
    onProgress?.({ step: `Baixando ${localUrls.size} asset(s) de mídia...`, percent: 35 });
    const result = await fetchAndMapAssets(localUrls, (step) => {
      onProgress?.({ step, percent: 45 });
    });
    assetMap = result.assetMap;

    // Add fetched blobs to ZIP
    for (const [assetPath, blob] of result.blobs) {
      zip.file(assetPath, blob);
    }
  }

  // Step 4: Generate Styles (with asset map for font resolution)
  onProgress?.({ step: "Gerando estilos visuais...", percent: 55 });
  const styles = generateStyles(
    project.theme.primaryColor,
    project.theme.fontFamily,
    project.theme.customFontUrl,
    assetMap.size > 0 ? assetMap : undefined
  );
  zip.file("styles.css", styles);

  // Step 5: Generate HTML (with asset map for image resolution)
  onProgress?.({ step: "Construindo slides e interações...", percent: 70 });
  const html = generateCourseHTML(project, assetMap.size > 0 ? assetMap : undefined);
  zip.file("index.html", html);

  // Step 6: Generate ZIP
  onProgress?.({ step: "Empacotando arquivo SCORM...", percent: 85 });
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
    .toLowerCase()}_scorm.zip`;

  saveAs(blob, fileName);
}
