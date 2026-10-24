const SVG_DATA_URI = /^data:image\/svg\+xml(;[^,]*)?,/i;

function decodeSvgDataUri(src: string): string | null {
  const match = SVG_DATA_URI.exec(src);
  if (!match) {
    return null;
  }
  const payload = src.slice(match[0].length);
  try {
    if (/;base64/i.test(match[1] ?? '')) {
      const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    return decodeURIComponent(payload);
  } catch {
    return null;
  }
}

// Gives an <svg> root a viewBox matching its width/height when it has none. Without a
// viewBox an SVG can't scale, so browsers stretch or crop it instead of resizing it.
function addMissingViewBox(svg: string): string {
  const root = /<svg\b[^>]*>/i.exec(svg);
  if (!root || /\bviewBox\s*=/i.test(root[0])) {
    return svg;
  }
  const dim = (name: string) => {
    const m = new RegExp(`\\b${name}\\s*=\\s*["']\\s*([\\d.]+)\\s*(px)?\\s*["']`, 'i').exec(root[0]);
    return m ? Number(m[1]) : null;
  };
  const width = dim('width');
  const height = dim('height');
  if (!width || !height) {
    return svg;
  }
  const fixedRoot = root[0].replace(/^<svg\b/i, `<svg viewBox="0 0 ${width} ${height}"`);
  return svg.slice(0, root.index) + fixedRoot + svg.slice(root.index + root[0].length);
}

// The SVG markup behind raw <svg> markup or an SVG data URI; null for URLs.
function svgMarkup(src: string): string | null {
  const trimmed = src.trim();
  return /^(<\?xml|<svg)/i.test(trimmed) ? trimmed : decodeSvgDataUri(trimmed);
}

// The SVG's intrinsic width/height, from its viewBox or else its width/height
// attributes. Null when it can't be read (e.g. an SVG loaded from a URL).
export function svgAspect(src: string): { width: number; height: number } | null {
  const markup = svgMarkup(src);
  const root = markup ? /<svg\b[^>]*>/i.exec(markup) : null;
  if (!root) {
    return null;
  }
  const viewBox = /\bviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i.exec(root[0]);
  if (viewBox) {
    return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  }
  const width = /\bwidth\s*=\s*["']\s*([\d.]+)\s*(px)?\s*["']/i.exec(root[0]);
  const height = /\bheight\s*=\s*["']\s*([\d.]+)\s*(px)?\s*["']/i.exec(root[0]);
  return width && height ? { width: Number(width[1]), height: Number(height[1]) } : null;
}

// Accepts a URL, an SVG data URI, or raw <svg> markup, and returns an href that renders
// the SVG scaled to fit its box. URLs are passed through untouched.
export function normalizeSvgSource(src: string): string {
  const trimmed = src.trim();
  const markup = svgMarkup(trimmed);
  if (markup === null) {
    return trimmed;
  }
  const fixed = addMissingViewBox(markup);
  if (fixed === markup && markup !== trimmed) {
    return trimmed;
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fixed)}`;
}
