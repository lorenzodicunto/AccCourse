/**
 * Certificate PDF Generator
 * Generates professional certificates in various templates
 * Uses a canvas-based approach compatible with the existing PDF export pattern
 */

import { CertificateConfig } from "@/store/useEditorStore";

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  score?: number;
  maxScore?: number;
  hoursSpent?: number;
  validationHash: string;
}

/**
 * Generates an HTML string for the certificate based on template and configuration
 */
function generateCertificateHTML(
  config: CertificateConfig,
  data: CertificateData
): string {
  const { template, orientation, accentColor } = config;
  const width = orientation === "landscape" ? "11in" : "8.5in";
  const height = orientation === "landscape" ? "8.5in" : "11in";

  const formattedDate = new Date(data.completionDate).toLocaleDateString("pt-BR");
  const scoreDisplay =
    config.includeScore && data.score !== undefined && data.maxScore
      ? `${Math.round((data.score / data.maxScore) * 100)}%`
      : "";
  const hoursDisplay =
    config.includeHours && data.hoursSpent ? `${data.hoursSpent} horas` : "";

  let templateHTML = "";

  if (template === "classic") {
    templateHTML = classicTemplate(
      config,
      data,
      formattedDate,
      scoreDisplay,
      hoursDisplay,
      accentColor
    );
  } else if (template === "modern") {
    templateHTML = modernTemplate(
      config,
      data,
      formattedDate,
      scoreDisplay,
      hoursDisplay,
      accentColor
    );
  } else if (template === "minimal") {
    templateHTML = minimalTemplate(
      config,
      data,
      formattedDate,
      scoreDisplay,
      hoursDisplay,
      accentColor
    );
  } else if (template === "corporate") {
    templateHTML = corporateTemplate(
      config,
      data,
      formattedDate,
      scoreDisplay,
      hoursDisplay,
      accentColor
    );
  } else {
    // custom or default
    templateHTML = classicTemplate(
      config,
      data,
      formattedDate,
      scoreDisplay,
      hoursDisplay,
      accentColor
    );
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificado - ${data.studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f5f5f5; padding: 20px; font-family: 'Inter', sans-serif; }
    .certificate { width: ${width}; height: ${height}; margin: 0 auto; background: white; }
    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none; }
    }
    .no-print { position: fixed; bottom: 20px; right: 20px; background: ${accentColor}; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; z-index: 100; }
    .no-print:hover { opacity: 0.9; }
  </style>
</head>
<body>
  ${templateHTML}
  <button class="no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</body>
</html>`;
}

function classicTemplate(
  config: CertificateConfig,
  data: CertificateData,
  formattedDate: string,
  scoreDisplay: string,
  hoursDisplay: string,
  accentColor: string
): string {
  return `
    <div class="certificate" style="
      border: 3px solid ${accentColor};
      border-radius: 8px;
      padding: 60px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      ${config.backgroundImage ? `background-image: url('${config.backgroundImage}'); background-size: cover;` : ""}
    ">
      ${config.companyLogo ? `<img src="${config.companyLogo}" style="height: 60px; margin-bottom: 20px; object-fit: contain;" alt="Logo" />` : ""}

      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 14px; color: ${accentColor}; letter-spacing: 2px; text-transform: uppercase;">Certificado de Conclusão</p>
      </div>

      <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #1a1a1a; margin-bottom: 20px;">
        ${config.title}
      </h1>

      ${config.subtitle ? `<p style="font-size: 16px; color: #555; margin-bottom: 30px;">${config.subtitle}</p>` : ""}

      <div style="margin: 40px 0; padding: 20px 0; border-top: 2px solid ${accentColor}; border-bottom: 2px solid ${accentColor};">
        <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Certificamos que</p>
        <p style="font-size: 28px; color: #1a1a1a; font-weight: 600; margin: 16px 0;">${data.studentName}</p>
        <p style="font-size: 14px; color: #666; margin-top: 8px;">completou com sucesso o curso</p>
      </div>

      <div style="margin: 30px 0; font-size: 13px; color: #666; line-height: 1.8;">
        <p>${config.bodyText}</p>
      </div>

      ${scoreDisplay || hoursDisplay ? `<div style="margin: 20px 0; padding: 15px; background: rgba(${accentColor}, 0.05); border-radius: 6px; font-size: 12px; color: #666;">
        ${scoreDisplay ? `<p>Desempenho: <strong>${scoreDisplay}</strong></p>` : ""}
        ${hoursDisplay ? `<p>Duração: <strong>${hoursDisplay}</strong></p>` : ""}
      </div>` : ""}

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; width: 100%; padding-top: 20px; border-top: 1px solid #ddd;">
        ${config.signatureName ? `<div style="text-align: center; flex: 1;">
          ${config.signatureImage ? `<img src="${config.signatureImage}" style="height: 40px; object-fit: contain; margin-bottom: 8px;" alt="Assinatura" />` : `<div style="width: 120px; height: 2px; background: #1a1a1a; margin: 0 auto; margin-bottom: 4px;"></div>`}
          <p style="font-size: 11px; font-weight: 600; color: #1a1a1a;">${config.signatureName}</p>
          ${config.signatureTitle ? `<p style="font-size: 10px; color: #666;">${config.signatureTitle}</p>` : ""}
        </div>` : ""}

        <div style="text-align: center; flex: 1;">
          <p style="font-size: 11px; color: #999;">${formattedDate}</p>
        </div>
      </div>

      ${config.validationHash ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; color: #999;">
        <p>Código de Validação: ${data.validationHash}</p>
      </div>` : ""}
    </div>
  `;
}

function modernTemplate(
  config: CertificateConfig,
  data: CertificateData,
  formattedDate: string,
  scoreDisplay: string,
  hoursDisplay: string,
  accentColor: string
): string {
  return `
    <div class="certificate" style="
      background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
      padding: 50px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    ">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, ${accentColor} 0%, transparent 100%);"></div>

      ${config.companyLogo ? `<img src="${config.companyLogo}" style="height: 50px; margin-bottom: 30px; object-fit: contain;" alt="Logo" />` : ""}

      <div style="text-align: center; margin-bottom: 40px;">
        <p style="font-size: 13px; color: ${accentColor}; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Certificado</p>
        <h1 style="font-family: 'Playfair Display', serif; font-size: 42px; color: #1a1a1a; margin-top: 10px; margin-bottom: 10px;">
          ${config.title}
        </h1>
      </div>

      <p style="font-size: 16px; color: #666; margin-bottom: 35px; font-style: italic;">
        ${config.bodyText}
      </p>

      <div style="background: ${accentColor}; color: white; padding: 25px; border-radius: 8px; margin: 30px 0; width: 100%;">
        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 10px;">Concedido a</p>
        <p style="font-size: 26px; font-weight: 700; margin-bottom: 10px;">${data.studentName}</p>
        <p style="font-size: 12px; opacity: 0.9;">Data: ${formattedDate}</p>
      </div>

      ${scoreDisplay || hoursDisplay ? `<div style="display: flex; justify-content: space-around; margin: 25px 0; width: 100%;">
        ${scoreDisplay ? `<div style="text-align: center;">
          <p style="font-size: 28px; font-weight: 700; color: ${accentColor};">${scoreDisplay}</p>
          <p style="font-size: 12px; color: #666; margin-top: 5px;">Desempenho</p>
        </div>` : ""}
        ${hoursDisplay ? `<div style="text-align: center;">
          <p style="font-size: 28px; font-weight: 700; color: ${accentColor};">${hoursDisplay}</p>
          <p style="font-size: 12px; color: #666; margin-top: 5px;">Duração</p>
        </div>` : ""}
      </div>` : ""}

      ${config.signatureName ? `<div style="margin-top: 40px; text-align: center;">
        ${config.signatureImage ? `<img src="${config.signatureImage}" style="height: 50px; object-fit: contain; margin-bottom: 8px;" alt="Assinatura" />` : `<div style="width: 120px; height: 2px; background: #1a1a1a; margin: 0 auto; margin-bottom: 8px;"></div>`}
        <p style="font-size: 12px; font-weight: 600; color: #1a1a1a;">${config.signatureName}</p>
        ${config.signatureTitle ? `<p style="font-size: 11px; color: #666;">${config.signatureTitle}</p>` : ""}
      </div>` : ""}

      ${config.validationHash ? `<div style="margin-top: 20px; font-size: 10px; color: #999;">
        <p>Validação: ${data.validationHash}</p>
      </div>` : ""}
    </div>
  `;
}

function minimalTemplate(
  config: CertificateConfig,
  data: CertificateData,
  formattedDate: string,
  scoreDisplay: string,
  hoursDisplay: string,
  accentColor: string
): string {
  return `
    <div class="certificate" style="
      padding: 80px 60px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    ">
      <p style="font-size: 12px; color: ${accentColor}; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 40px;">
        Certificado de Conclusão
      </p>

      <h1 style="font-family: 'Playfair Display', serif; font-size: 48px; color: #1a1a1a; margin-bottom: 50px; line-height: 1.2;">
        ${config.title}
      </h1>

      <p style="font-size: 16px; color: #666; margin-bottom: 60px; font-style: italic; max-width: 80%;">
        ${config.bodyText}
      </p>

      <p style="font-size: 18px; color: #1a1a1a; font-weight: 500; margin-bottom: 60px;">
        ${data.studentName}
      </p>

      <p style="font-size: 13px; color: #999; margin-bottom: 60px;">
        ${formattedDate}
      </p>

      ${scoreDisplay || hoursDisplay ? `<div style="font-size: 12px; color: #666; margin-bottom: 40px;">
        ${scoreDisplay ? `<p>Desempenho: ${scoreDisplay}</p>` : ""}
        ${hoursDisplay ? `<p>Horas: ${hoursDisplay}</p>` : ""}
      </div>` : ""}

      ${config.signatureName ? `<div style="margin-top: 60px; border-top: 1px solid #1a1a1a; padding-top: 20px; width: 120px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 11px; color: #1a1a1a; font-weight: 600;">${config.signatureName}</p>
      </div>` : ""}

      ${config.validationHash ? `<div style="margin-top: 60px; font-size: 9px; color: #ccc;">
        <p>${data.validationHash}</p>
      </div>` : ""}
    </div>
  `;
}

function corporateTemplate(
  config: CertificateConfig,
  data: CertificateData,
  formattedDate: string,
  scoreDisplay: string,
  hoursDisplay: string,
  accentColor: string
): string {
  return `
    <div class="certificate" style="
      background: white;
      padding: 60px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-left: 8px solid ${accentColor};
    ">
      ${config.companyName ? `<p style="font-size: 11px; color: ${accentColor}; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px;">${config.companyName}</p>` : ""}

      ${config.companyLogo ? `<img src="${config.companyLogo}" style="height: 60px; margin-bottom: 25px; object-fit: contain;" alt="Logo" />` : ""}

      <h2 style="font-size: 14px; color: #666; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 30px;">
        Certificado de Conclusão
      </h2>

      <h1 style="font-family: 'Playfair Display', serif; font-size: 38px; color: #1a1a1a; margin-bottom: 30px;">
        ${config.title}
      </h1>

      <div style="margin: 30px 0; padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
        <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Este certificado atesta que</p>
        <p style="font-size: 24px; color: #1a1a1a; font-weight: 600; margin: 15px 0;">${data.studentName}</p>
        <p style="font-size: 13px; color: #666; margin-top: 15px;">completou com êxito</p>
      </div>

      <div style="margin: 30px 0; font-size: 13px; color: #666; line-height: 1.6;">
        <p>${config.bodyText}</p>
      </div>

      ${scoreDisplay || hoursDisplay ? `<div style="margin: 25px 0; padding: 15px; background: #f0f0f0; border-radius: 4px;">
        <p style="font-size: 12px; color: #666;">
          ${scoreDisplay ? `Desempenho: <strong>${scoreDisplay}</strong>` : ""}
          ${scoreDisplay && hoursDisplay ? " • " : ""}
          ${hoursDisplay ? `Duração: <strong>${hoursDisplay}</strong>` : ""}
        </p>
      </div>` : ""}

      <div style="margin-top: 40px; display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        ${config.signatureName ? `<div style="text-align: left; flex: 1;">
          <div style="width: 100px; height: 1px; background: #1a1a1a; margin-bottom: 5px;"></div>
          <p style="font-size: 11px; font-weight: 600; color: #1a1a1a;">${config.signatureName}</p>
          ${config.signatureTitle ? `<p style="font-size: 10px; color: #666;">${config.signatureTitle}</p>` : ""}
        </div>` : ""}
        <div style="text-align: right; flex: 1;">
          <p style="font-size: 11px; color: #999;">${formattedDate}</p>
        </div>
      </div>

      ${config.validationHash ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 9px; color: #aaa;">
        <p>ID: ${data.validationHash}</p>
      </div>` : ""}
    </div>
  `;
}

/**
 * Generates a certificate as an HTML blob
 * Returns a blob that can be printed or saved
 */
export async function generateCertificatePDF(
  config: CertificateConfig,
  data: CertificateData
): Promise<Blob> {
  const html = generateCertificateHTML(config, data);
  return new Blob([html], { type: "text/html" });
}

/**
 * Opens certificate in a new window for printing/saving
 */
export function openCertificatePDF(
  config: CertificateConfig,
  data: CertificateData
): void {
  const html = generateCertificateHTML(config, data);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error(
      "Não foi possível abrir janela de impressão. Verifique o bloqueador de pop-ups."
    );
  }
  printWindow.document.write(html);
  printWindow.document.close();
}
