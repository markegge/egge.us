/**
 * Render a project summary string to safe inline HTML.
 *
 * Supports a small, safe subset of Markdown so summaries can be authored
 * naturally in front-matter:
 *   [text](url)   → <a> (http/https/mailto, root-relative, or #anchor only;
 *                   external links open in a new tab)
 *   **bold**      → <strong>
 *   *italic*      → <em>
 *   `code`        → <code> in the mono token
 *
 * Everything else is HTML-escaped first, so summary content can never inject
 * raw markup, and link hrefs are scheme-checked to block javascript: et al.
 */
export function renderSummary(text: string): string {
  // Escape HTML first so nothing in the source can inject markup.
  let out = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // [text](url) → link. Only allow safe schemes; otherwise leave the literal
  // markdown in place (so a typo'd link is visible, not silently dropped).
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
    const safe = /^(https?:\/\/|mailto:|\/|#)/i.test(url);
    if (!safe) return match;
    const external = /^https?:\/\//i.test(url);
    const attrs = external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${url}"${attrs}>${label}</a>`;
  });

  // **bold** before *italic* so the double-star isn't eaten by the italic rule.
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // `…` backtick spans → mono <code>.
  out = out.replace(/`([^`]+)`/g, '<code class="summary-code">$1</code>');

  return out;
}
