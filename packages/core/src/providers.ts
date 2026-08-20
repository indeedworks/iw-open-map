import type { RasterSourceSpecification, StyleSpecification } from 'maplibre-gl';
import type { MapProvider, TiandituMapType, TiandituProvider, WmtsProvider, XyzProvider } from './types';

const TDT_LAYERS: Record<TiandituMapType, { base: string; label: string }> = {
  vector: { base: 'vec_w', label: 'cva_w' },
  imagery: { base: 'img_w', label: 'cia_w' },
  terrain: { base: 'ter_w', label: 'cta_w' }
};

export const TIANDITU_ATTRIBUTION =
  '地图数据 © <a href="https://www.tianditu.gov.cn/" target="_blank" rel="noopener">天地图</a> GS(2024)0650号';

export function validateProvider(provider: MapProvider): void {
  if (provider.type === 'tianditu' && (!provider.token || provider.token === 'your-tianditu-token')) {
    throw new Error('天地图 Key 未配置。请传入有效的 provider.token，且不要将真实 Key 提交到版本库。');
  }
  if (provider.type === 'xyz' && provider.tiles.length === 0) throw new Error('XYZ provider.tiles 不能为空。');
  if (provider.type === 'wmts' && (!provider.url || !provider.layer || !provider.tileMatrixSet)) {
    throw new Error('WMTS provider 需要 url、layer 和 tileMatrixSet。');
  }
}

export function tiandituTiles(layer: string, provider: TiandituProvider): string[] {
  const subdomains = provider.subdomains?.length ? provider.subdomains : ['0', '1', '2', '3', '4', '5', '6', '7'];
  return subdomains.map(
    (subdomain) =>
      `https://t${subdomain}.tianditu.gov.cn/${layer}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer.slice(0, 3)}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${encodeURIComponent(provider.token)}`
  );
}

export function wmtsTileUrl(provider: WmtsProvider): string {
  const query = new URLSearchParams({
    SERVICE: 'WMTS',
    REQUEST: 'GetTile',
    VERSION: '1.0.0',
    LAYER: provider.layer,
    STYLE: provider.style ?? 'default',
    FORMAT: provider.format ?? 'image/png',
    TILEMATRIXSET: provider.tileMatrixSet,
    TILEMATRIX: '{z}',
    TILEROW: '{y}',
    TILECOL: '{x}',
    ...provider.params
  });
  return `${provider.url}${provider.url.includes('?') ? '&' : '?'}${query.toString()}`
    .replace(/%7B/g, '{')
    .replace(/%7D/g, '}');
}

export function rasterSource(provider: XyzProvider | WmtsProvider): RasterSourceSpecification {
  if (provider.type === 'xyz') {
    return {
      type: 'raster',
      tiles: provider.tiles,
      tileSize: provider.tileSize ?? 256,
      minzoom: provider.minzoom,
      maxzoom: provider.maxzoom,
      attribution: provider.attribution
    };
  }
  return { type: 'raster', tiles: [wmtsTileUrl(provider)], tileSize: 256, attribution: provider.attribution };
}

export function createStyle(provider: MapProvider): string | StyleSpecification {
  validateProvider(provider);
  if (provider.type === 'style') return provider.style;
  if (provider.type === 'tianditu') {
    const selected = TDT_LAYERS[provider.mapType ?? 'vector'];
    return {
      version: 8,
      sources: {
        'open-map-base': { type: 'raster', tiles: tiandituTiles(selected.base, provider), tileSize: 256, attribution: TIANDITU_ATTRIBUTION },
        'open-map-label': { type: 'raster', tiles: tiandituTiles(selected.label, provider), tileSize: 256, attribution: TIANDITU_ATTRIBUTION }
      },
      layers: [
        { id: 'open-map-base', type: 'raster', source: 'open-map-base' },
        { id: 'open-map-label', type: 'raster', source: 'open-map-label' }
      ]
    };
  }
  return {
    version: 8,
    sources: { 'open-map-base': rasterSource(provider) },
    layers: [{ id: 'open-map-base', type: 'raster', source: 'open-map-base' }]
  };
}
