// SCORM 1.2 imsmanifest.xml Generator

export function generateManifest(
  courseId: string,
  courseTitle: string,
  courseDescription: string = ""
): string {
  const escapedTitle = escapeXml(courseTitle);
  const escapedDesc = escapeXml(courseDescription || courseTitle);

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}"
  version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="org_${courseId}">
    <organization identifier="org_${courseId}">
      <title>${escapedTitle}</title>
      <item identifier="item_${courseId}" identifierref="res_${courseId}" isvisible="true">
        <title>${escapedTitle}</title>
        <adlcp:masteryscore>70</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="res_${courseId}"
      type="webcontent"
      adlcp:scormtype="sco"
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
