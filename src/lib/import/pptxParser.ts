// PowerPoint (.pptx) Parser
// Extracts slides, text content and images from .pptx files (OpenXML format)
// .pptx files are ZIP archives containing XML slide definitions

import JSZip from "jszip";

export interface ParsedSlide {
  order: number;
  texts: { content: string; x: number; y: number; width: number; height: number; fontSize: number; bold: boolean; color: string }[];
  images: { data: string; mimeType: string; x: number; y: number; width: number; height: number }[];
  background: string;
}

export interface ParsedPresentation {
  title: string;
  slides: ParsedSlide[];
  totalImages: number;
}

/**
 * Parse a .pptx file buffer and extract slide content.
 */
export async function parsePPTX(buffer: ArrayBuffer): Promise<ParsedPresentation> {
  const zip = await JSZip.loadAsync(buffer);
  
  const slides: ParsedSlide[] = [];
  let title = "Apresentação Importada";
  let totalImages = 0;

  // Find all slide XML files (ppt/slides/slide1.xml, slide2.xml, ...)
  const slideFiles = Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
      return numA - numB;
    });

  // Try to get presentation title from core properties
  try {
    const coreXml = await zip.file("docProps/core.xml")?.async("text");
    if (coreXml) {
      const titleMatch = coreXml.match(/<dc:title>(.*?)<\/dc:title>/);
      if (titleMatch?.[1]) title = titleMatch[1];
    }
  } catch {}

  // Parse each slide
  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.file(slideFiles[i])?.async("text");
    if (!slideXml) continue;

    const parsedSlide: ParsedSlide = {
      order: i,
      texts: [],
      images: [],
      background: "#ffffff",
    };

    // Extract text content from shape trees
    // <a:t> tags contain text content
    const textMatches = slideXml.matchAll(/<p:sp\b[^>]*>[\s\S]*?<\/p:sp>/g);
    for (const match of textMatches) {
      const spXml = match[0];
      
      // Extract position from <a:off x="" y=""/> and <a:ext cx="" cy=""/>
      const offMatch = spXml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
      const extMatch = spXml.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);
      
      // EMU to pixels (1 inch = 914400 EMU, 96 DPI)
      const emuToPx = (emu: number) => Math.round(emu / 914400 * 96);
      
      const x = offMatch ? emuToPx(parseInt(offMatch[1])) : 50;
      const y = offMatch ? emuToPx(parseInt(offMatch[2])) : 50;
      const width = extMatch ? emuToPx(parseInt(extMatch[1])) : 400;
      const height = extMatch ? emuToPx(parseInt(extMatch[2])) : 100;

      // Extract all text runs
      const textParts: string[] = [];
      const tMatches = spXml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g);
      for (const t of tMatches) {
        textParts.push(t[1]);
      }
      
      if (textParts.length === 0) continue;
      
      const fullText = textParts.join("");
      if (!fullText.trim()) continue;

      // Text properties
      const fontSize = (() => {
        const szMatch = spXml.match(/<a:rPr[^>]*\s+sz="(\d+)"/);
        return szMatch ? Math.round(parseInt(szMatch[1]) / 100) : 18;
      })();

      const bold = /<a:rPr[^>]*\s+b="1"/.test(spXml);
      
      const color = (() => {
        const colorMatch = spXml.match(/<a:solidFill>\s*<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
        return colorMatch ? `#${colorMatch[1]}` : "#000000";
      })();

      parsedSlide.texts.push({ content: fullText, x, y, width, height, fontSize, bold, color });
    }

    // Extract images (references to media files)
    const picMatches = slideXml.matchAll(/<p:pic\b[\s\S]*?<\/p:pic>/g);
    for (const picMatch of picMatches) {
      const picXml = picMatch[0];
      
      // Get relationship ID
      const rIdMatch = picXml.match(/r:embed="(rId\d+)"/);
      if (!rIdMatch) continue;

      // Get position
      const offMatch = picXml.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
      const extMatch = picXml.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);
      const emuToPx = (emu: number) => Math.round(emu / 914400 * 96);
      
      const x = offMatch ? emuToPx(parseInt(offMatch[1])) : 100;
      const y = offMatch ? emuToPx(parseInt(offMatch[2])) : 100;
      const width = extMatch ? emuToPx(parseInt(extMatch[1])) : 300;
      const height = extMatch ? emuToPx(parseInt(extMatch[2])) : 200;

      // Resolve relationship to actual file
      const slideNum = i + 1;
      const relsFile = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
      const relsXml = await zip.file(relsFile)?.async("text");
      
      if (relsXml) {
        const relId = rIdMatch[1];
        const relMatch = relsXml.match(new RegExp(`Id="${relId}"[^>]*Target="([^"]+)"`));
        if (relMatch) {
          const target = relMatch[1].replace("../", "ppt/");
          const imageFile = zip.file(target);
          if (imageFile) {
            const imageData = await imageFile.async("base64");
            const ext = target.split(".").pop()?.toLowerCase() || "png";
            const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "png" ? "image/png" : `image/${ext}`;
            
            parsedSlide.images.push({ data: `data:${mimeType};base64,${imageData}`, mimeType, x, y, width, height });
            totalImages++;
          }
        }
      }
    }

    // Background color
    const bgMatch = slideXml.match(/<p:bg>[\s\S]*?<a:srgbClr\s+val="([0-9A-Fa-f]{6})"[\s\S]*?<\/p:bg>/);
    if (bgMatch) {
      parsedSlide.background = `#${bgMatch[1]}`;
    }

    slides.push(parsedSlide);
  }

  return { title, slides, totalImages };
}
