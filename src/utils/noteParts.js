/**
 * Split free text into plain segments and http(s) links for safe rendering.
 * @param {unknown} raw
 * @returns {{ type: 'text' | 'link', value: string }[]}
 */
export function noteParts(raw) {
  const text = String(raw ?? "");
  const re = /(https?:\/\/[^\s]+)/g;
  const out = [];
  let last = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", value: text.slice(last, m.index) });
    }
    out.push({ type: "link", value: m[0] });
    last = re.lastIndex;
  }
  if (last < text.length) {
    out.push({ type: "text", value: text.slice(last) });
  }
  return out.length ? out : [{ type: "text", value: "-" }];
}
