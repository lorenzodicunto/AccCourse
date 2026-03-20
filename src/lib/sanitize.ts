import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * CRITICAL: Always use this before rendering any user-generated HTML
 * (e.g., Rich Text blocks, SCORM exports).
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "u",
      "strong",
      "em",
      "span",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
    ],
    ALLOWED_ATTR: [
      "style",
      "class",
      "href",
      "target",
      "rel",
    ],
    ALLOW_DATA_ATTR: false,
  });
}
