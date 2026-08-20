import { describe, expect, it } from 'vitest';
import { createStyle, tiandituTiles, validateProvider, wmtsTileUrl } from './providers';

describe('provider helpers', () => {
  it('rejects a missing or placeholder Tianditu token', () => {
    expect(() => validateProvider({ type: 'tianditu', token: '' })).toThrow('Key 未配置');
    expect(() => validateProvider({ type: 'tianditu', token: 'your-tianditu-token' })).toThrow('Key 未配置');
  });

  it('creates Tianditu subdomain tile URLs without embedding a real token', () => {
    const urls = tiandituTiles('vec_w', { type: 'tianditu', token: 'test-token', subdomains: ['0', '2'] });
    expect(urls).toHaveLength(2);
    expect(urls[0]).toContain('LAYER=vec');
    expect(urls[0]).toContain('tk=test-token');
    expect(urls[1]).toContain('t2.tianditu.gov.cn');
  });

  it('builds a WMTS template while preserving map tile placeholders', () => {
    const url = wmtsTileUrl({ type: 'wmts', url: 'https://example.com/wmts', layer: 'base', tileMatrixSet: 'w', attribution: 'test' });
    expect(url).toContain('TILEMATRIX={z}');
    expect(url).toContain('TILEROW={y}');
    expect(url).toContain('TILECOL={x}');
  });

  it('creates a two-layer Tianditu style', () => {
    const style = createStyle({ type: 'tianditu', token: 'test-token', mapType: 'imagery' });
    expect(typeof style).toBe('object');
    if (typeof style !== 'string') expect(style.layers).toHaveLength(2);
  });
});
