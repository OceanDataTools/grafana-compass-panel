import { normalizeSvgSource, svgAspect } from './svgSource';

const decode = (href: string) => decodeURIComponent(href.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
const base64 = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

describe('normalizeSvgSource', () => {
  it('passes URLs through untouched', () => {
    expect(normalizeSvgSource('https://example.com/drone.svg')).toBe('https://example.com/drone.svg');
    expect(normalizeSvgSource('public/img/drone.svg')).toBe('public/img/drone.svg');
  });

  it('leaves SVG data URIs that already have a viewBox untouched', () => {
    const src = base64('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"/>');
    expect(normalizeSvgSource(src)).toBe(src);
  });

  it('adds a viewBox to a base64 SVG that only has width/height', () => {
    const href = normalizeSvgSource(base64('<svg xmlns="http://www.w3.org/2000/svg" width="512px" height="256"/>'));
    expect(decode(href)).toContain('<svg viewBox="0 0 512 256" xmlns=');
  });

  it('adds a viewBox to a URL-encoded SVG data URI', () => {
    const src = `data:image/svg+xml,${encodeURIComponent('<svg width="100" height="50"><rect/></svg>')}`;
    expect(decode(normalizeSvgSource(src))).toBe('<svg viewBox="0 0 100 50" width="100" height="50"><rect/></svg>');
  });

  it('decodes non-ASCII base64 content', () => {
    const svg = '<svg width="10" height="10"><title>Drône</title></svg>';
    expect(decode(normalizeSvgSource(base64(svg)))).toContain('Drône');
  });

  it('accepts raw SVG markup', () => {
    const href = normalizeSvgSource('  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>');
    expect(href.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decode(href)).toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>');
  });

  it('leaves SVGs without a numeric width/height alone', () => {
    const src = base64('<svg width="100%" height="100%"/>');
    expect(normalizeSvgSource(src)).toBe(src);
  });

  it('returns malformed data URIs untouched', () => {
    expect(normalizeSvgSource('data:image/svg+xml;base64,%%%')).toBe('data:image/svg+xml;base64,%%%');
  });
});

describe('svgAspect', () => {
  it('reads the viewBox size', () => {
    expect(svgAspect(base64('<svg width="10" height="10" viewBox="0 0 20 100"/>'))).toEqual({ width: 20, height: 100 });
    expect(svgAspect('<svg viewBox="-5,-5,30,60"/>')).toEqual({ width: 30, height: 60 });
  });

  it('falls back to width/height', () => {
    expect(svgAspect(base64('<svg width="512px" height="256"/>'))).toEqual({ width: 512, height: 256 });
  });

  it('returns null when the size is unknown', () => {
    expect(svgAspect('https://example.com/drone.svg')).toBeNull();
    expect(svgAspect(base64('<svg width="100%" height="100%"/>'))).toBeNull();
  });
});
