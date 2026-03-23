// SCORM 2004 3rd Edition imsmanifest.xml Generator

export function generateManifest2004(
  courseId: string,
  courseTitle: string,
  courseDescription: string = ""
): string {
  const escapedTitle = escapeXml(courseTitle);
  const escapedDesc = escapeXml(courseDescription || courseTitle);

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}"
  version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
    http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
    http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
    http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
    http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 3rd Edition</schemaversion>
  </metadata>

  <organizations default="org_${courseId}">
    <organization identifier="org_${courseId}">
      <title>${escapedTitle}</title>
      <item identifier="item_${courseId}" identifierref="res_${courseId}">
        <title>${escapedTitle}</title>
        <imsss:sequencing>
          <imsss:deliveryControls tracked="true" completionSetByContent="true" objectiveSetByContent="true" />
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="res_${courseId}"
      type="webcontent"
      adlcp:scormType="sco"
      href="index.html">
      <file href="index.html"/>
      <file href="scorm-api.js"/>
      <file href="styles.css"/>
    </resource>
  </resources>
</manifest>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
