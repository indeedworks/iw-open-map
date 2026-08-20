import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type MapMouseEvent,
  type Marker
} from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import { circleFeature, drawPreviewFeature, isDrawFeature, measureArea, measureDistance, normalizeGeoJSON, rectangleFeature, serializeFeatures } from './geo';
import { createStyle, rasterSource } from './providers';
import type {
  ClusterOptions,
  Coordinates,
  CustomSourceOptions,
  DrawFeature,
  DrawMode,
  DrawOptions,
  EventHandler,
  FitOptions,
  GeoJSONLayerOptions,
  MapBounds,
  MapProvider,
  MarkerEvent,
  MarkerOptions,
  OpenMapEvent,
  OpenMapOptions,
  SourceAdapter,
  TiandituMapType
} from './types';

type StoredLayer = GeoJSONLayerOptions & { data: FeatureCollection };
type DrawState = { mode: DrawMode; points: Coordinates[]; options: DrawOptions };

const DEFAULT_CENTER: Coordinates = [116.397, 39.908];
const SOURCE_SUFFIX = '-source';

export class OpenMap {
  readonly map: MapLibreMap;
  private provider: MapProvider;
  private markers = new Map<string, Marker>();
  private markerOptions = new Map<string, MarkerOptions>();
  private geoLayers = new Map<string, StoredLayer>();
  private drawings = new Map<string, DrawFeature>();
  private clusters = new Map<string, ClusterOptions>();
  private customSources = new Map<string, CustomSourceOptions>();
  private adapters = new Map<string, SourceAdapter>();
  private events = new Map<OpenMapEvent, Set<EventHandler>>();
  private drawState?: DrawState;
  private drawPreview?: DrawFeature;
  private drawSequence = 0;
  private editMarkers: Marker[] = [];
  private readyPromise: Promise<this>;
  private destroyed = false;

  constructor(options: OpenMapOptions) {
    this.provider = options.provider;
    this.map = new maplibregl.Map({
      ...options,
      container: options.container,
      style: createStyle(options.provider),
      center: options.center ?? DEFAULT_CENTER,
      zoom: options.zoom ?? 10,
      attributionControl: options.attributionControl === false || typeof options.attributionControl === 'object'
        ? options.attributionControl
        : undefined
    });
    this.map.getContainer().classList.add('open-map-root');
    this.readyPromise = new Promise((resolve, reject) => {
      this.map.once('load', () => {
        this.installDrawLayers();
        this.emit('ready', this);
        resolve(this);
      });
      this.map.once('error', (event) => {
        this.emit('error', event.error);
        if (!this.map.loaded()) reject(event.error);
      });
    });
    this.bindBaseEvents();
  }

  ready(): Promise<this> {
    return this.readyPromise;
  }

  on<T = unknown>(event: OpenMapEvent, handler: EventHandler<T>): this {
    const handlers = this.events.get(event) ?? new Set<EventHandler>();
    handlers.add(handler as EventHandler);
    this.events.set(event, handlers);
    return this;
  }

  off<T = unknown>(event: OpenMapEvent, handler: EventHandler<T>): this {
    this.events.get(event)?.delete(handler as EventHandler);
    return this;
  }

  once<T = unknown>(event: OpenMapEvent, handler: EventHandler<T>): this {
    const wrapped: EventHandler<T> = (payload) => {
      this.off(event, wrapped);
      handler(payload);
    };
    return this.on(event, wrapped);
  }

  zoomTo(zoom: number, duration = 300): this {
    this.map.easeTo({ zoom, duration });
    return this;
  }

  panTo(coordinates: Coordinates, duration = 300): this {
    this.map.easeTo({ center: coordinates, duration });
    return this;
  }

  rotateTo(bearing: number, duration = 300): this {
    this.map.easeTo({ bearing, duration });
    return this;
  }

  flyTo(coordinates: Coordinates, zoom?: number): this {
    this.map.flyTo({ center: coordinates, zoom });
    return this;
  }

  locate(options?: PositionOptions): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('当前浏览器不支持定位。'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const location: Coordinates = [coords.longitude, coords.latitude];
          this.flyTo(location, Math.max(this.map.getZoom(), 14));
          resolve(location);
        },
        (error) => reject(error),
        options
      );
    });
  }

  getBounds(): MapBounds {
    const bounds = this.map.getBounds();
    return {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      array: [[bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]]
    };
  }

  fitBounds(bounds: [[number, number], [number, number]], options: FitOptions = {}): this {
    this.map.fitBounds(bounds, options);
    return this;
  }

  resize(): this {
    this.map.resize();
    return this;
  }

  async setProvider(provider: MapProvider): Promise<this> {
    this.provider = provider;
    await new Promise<void>((resolve) => {
      this.map.once('style.load', () => {
        this.restoreCustomContent();
        resolve();
      });
      this.map.setStyle(createStyle(provider));
    });
    return this;
  }

  setMapType(mapType: TiandituMapType): Promise<this> {
    if (this.provider.type !== 'tianditu') return Promise.reject(new Error('setMapType 仅适用于天地图 provider。'));
    return this.setProvider({ ...this.provider, mapType });
  }

  addMarker(options: MarkerOptions): Marker {
    if (this.markers.has(options.id)) throw new Error(`标记 ${options.id} 已存在。`);
    const element = this.createMarkerElement(options);
    const marker = new maplibregl.Marker({
      element,
      draggable: options.draggable,
      rotation: options.rotation,
      anchor: options.anchor ?? 'bottom'
    }).setLngLat(options.coordinates);
    if (options.popup) {
      const popup = new maplibregl.Popup({ offset: 18 });
      if (typeof options.popup === 'string') popup.setHTML(options.popup);
      else popup.setDOMContent(options.popup);
      marker.setPopup(popup);
    }
    marker.addTo(this.map);
    this.markers.set(options.id, marker);
    this.markerOptions.set(options.id, { ...options });
    return marker;
  }

  updateMarker(id: string, changes: Partial<Omit<MarkerOptions, 'id'>>): Marker {
    const previous = this.markerOptions.get(id);
    if (!previous) throw new Error(`未找到标记 ${id}。`);
    const next = { ...previous, ...changes, id };
    this.removeMarker(id);
    return this.addMarker(next);
  }

  removeMarker(id: string): boolean {
    const marker = this.markers.get(id);
    if (!marker) return false;
    marker.remove();
    this.markers.delete(id);
    this.markerOptions.delete(id);
    return true;
  }

  clearMarkers(): this {
    for (const id of [...this.markers.keys()]) this.removeMarker(id);
    return this;
  }

  onMarker(id: string, event: MarkerEvent, handler: EventListener): () => void {
    const marker = this.markers.get(id);
    if (!marker) throw new Error(`未找到标记 ${id}。`);
    if (event.startsWith('drag')) {
      marker.on(event as 'drag', handler as unknown as () => void);
      return () => marker.off(event as 'drag', handler as unknown as () => void);
    }
    const element = marker.getElement();
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }

  addGeoJSONLayer(options: GeoJSONLayerOptions): this {
    if (this.geoLayers.has(options.id)) throw new Error(`图层 ${options.id} 已存在。`);
    if (typeof options.data === 'string') throw new Error('字符串 GeoJSON 请先使用 importGeoJSON 或传入对象。');
    const data = normalizeGeoJSON(options.data);
    this.geoLayers.set(options.id, { ...options, data });
    this.addStoredLayer({ ...options, data });
    return this;
  }

  updateGeoJSONLayer(id: string, data: Feature | FeatureCollection | Geometry): this {
    const layer = this.geoLayers.get(id);
    if (!layer) throw new Error(`未找到图层 ${id}。`);
    const normalized = normalizeGeoJSON(data);
    layer.data = normalized;
    (this.map.getSource(`${id}${SOURCE_SUFFIX}`) as GeoJSONSource | undefined)?.setData(normalized);
    return this;
  }

  removeGeoJSONLayer(id: string): boolean {
    if (this.map.getLayer(id)) this.map.removeLayer(id);
    const sourceId = `${id}${SOURCE_SUFFIX}`;
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
    return this.geoLayers.delete(id);
  }

  onLayer(id: string, event: 'click' | 'mouseenter' | 'mouseleave', handler: (event: MapLayerMouseEvent) => void): () => void {
    this.map.on(event, id, handler);
    return () => this.map.off(event, id, handler);
  }

  addCluster(options: ClusterOptions): this {
    if (this.clusters.has(options.id)) throw new Error(`聚合图层 ${options.id} 已存在。`);
    this.clusters.set(options.id, options);
    const sourceId = `${options.id}${SOURCE_SUFFIX}`;
    this.map.addSource(sourceId, {
      type: 'geojson',
      data: options.data,
      cluster: true,
      clusterRadius: options.radius ?? 50,
      clusterMaxZoom: options.maxZoom ?? 14
    });
    const steps = options.colorSteps ?? [[0, '#3b82f6'], [100, '#8b5cf6'], [750, '#ef4444']];
    this.map.addLayer({
      id: `${options.id}-clusters`,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], steps[0]?.[1] ?? '#3b82f6', ...(steps.slice(1).flatMap(([count, color]) => [count, color]))],
        'circle-radius': ['step', ['get', 'point_count'], 18, 100, 24, 750, 32],
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
      }
    });
    this.map.addLayer({
      id: `${options.id}-count`,
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
      paint: { 'text-color': '#fff' }
    });
    this.map.addLayer({
      id: `${options.id}-points`,
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: { 'circle-color': '#2563eb', 'circle-radius': 6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 1 }
    });
    this.map.on('click', `${options.id}-clusters`, async (event) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id as number | undefined;
      if (clusterId === undefined || feature?.geometry.type !== 'Point') return;
      const zoom = await (this.map.getSource(sourceId) as GeoJSONSource).getClusterExpansionZoom(clusterId);
      this.map.easeTo({ center: feature.geometry.coordinates as Coordinates, zoom });
    });
    return this;
  }

  removeCluster(id: string): this {
    for (const layerId of [`${id}-count`, `${id}-points`, `${id}-clusters`]) if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
    const sourceId = `${id}${SOURCE_SUFFIX}`;
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
    this.clusters.delete(id);
    return this;
  }

  addCustomSource(options: CustomSourceOptions): this {
    if (this.customSources.has(options.id)) throw new Error(`自定义地图源 ${options.id} 已存在。`);
    this.customSources.set(options.id, options);
    const sourceId = `${options.id}${SOURCE_SUFFIX}`;
    this.map.addSource(sourceId, rasterSource(options.provider));
    this.map.addLayer({
      id: options.id,
      type: 'raster',
      source: sourceId,
      paint: { 'raster-opacity': options.opacity ?? 1 }
    }, options.beforeId);
    return this;
  }

  removeCustomSource(id: string): boolean {
    if (this.map.getLayer(id)) this.map.removeLayer(id);
    const sourceId = `${id}${SOURCE_SUFFIX}`;
    if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
    return this.customSources.delete(id);
  }

  registerSourceAdapter(adapter: SourceAdapter): this {
    if (this.adapters.has(adapter.type)) throw new Error(`扩展源 ${adapter.type} 已注册。`);
    this.adapters.set(adapter.type, adapter);
    return this;
  }

  async addExtensionSource(type: string, id: string, options: Record<string, unknown>): Promise<this> {
    const adapter = this.adapters.get(type);
    if (!adapter) throw new Error(`未注册 ${type} 源适配器。可用于接入 PMTiles、MBTiles 或自定义 MVT 协议。`);
    const source = await adapter.createSource(options);
    this.map.addSource(id, source as maplibregl.SourceSpecification);
    return this;
  }

  startDraw(mode: DrawMode, options: DrawOptions = {}): this {
    this.cancelDraw();
    this.drawState = { mode, points: [], options };
    this.map.getCanvas().classList.add('open-map-draw-cursor');
    return this;
  }

  cancelDraw(): this {
    this.drawState = undefined;
    this.drawPreview = undefined;
    this.map.getCanvas().classList.remove('open-map-draw-cursor');
    this.syncDrawings();
    return this;
  }

  updateDrawFeature(id: string, feature: DrawFeature): this {
    if (!this.drawings.has(id)) throw new Error(`未找到绘制要素 ${id}。`);
    feature.id = id;
    this.drawings.set(id, feature);
    this.syncDrawings();
    this.emit('draw.update', feature);
    return this;
  }

  startEdit(id: string): this {
    this.stopEdit();
    const feature = this.drawings.get(id);
    if (!feature) throw new Error(`未找到绘制要素 ${id}。`);
    const coordinates = feature.geometry.type === 'Point'
      ? [feature.geometry.coordinates]
      : feature.geometry.type === 'LineString'
        ? feature.geometry.coordinates
        : feature.geometry.coordinates[0]!.slice(0, -1);
    coordinates.forEach((coordinate, index) => {
      const element = document.createElement('button');
      element.className = 'open-map-edit-vertex';
      element.type = 'button';
      element.title = `拖拽编辑顶点 ${index + 1}`;
      const marker = new maplibregl.Marker({ element, draggable: true, anchor: 'center' }).setLngLat(coordinate as Coordinates).addTo(this.map);
      marker.on('drag', () => {
        const position = marker.getLngLat();
        const next: Coordinates = [position.lng, position.lat];
        if (feature.geometry.type === 'Point') feature.geometry.coordinates = next;
        else if (feature.geometry.type === 'LineString') feature.geometry.coordinates[index] = next;
        else {
          feature.geometry.coordinates[0]![index] = next;
          if (index === 0) feature.geometry.coordinates[0]![feature.geometry.coordinates[0]!.length - 1] = next;
        }
        this.syncDrawings();
        this.emit('draw.update', feature);
      });
      this.editMarkers.push(marker);
    });
    return this;
  }

  stopEdit(): this {
    for (const marker of this.editMarkers) marker.remove();
    this.editMarkers = [];
    return this;
  }

  deleteDrawFeature(id: string): boolean {
    const feature = this.drawings.get(id);
    if (!feature) return false;
    this.stopEdit();
    this.drawings.delete(id);
    this.syncDrawings();
    this.emit('draw.delete', feature);
    return true;
  }

  clearDrawings(): this {
    for (const id of [...this.drawings.keys()]) this.deleteDrawFeature(id);
    return this;
  }

  importGeoJSON(input: string | FeatureCollection | Feature): FeatureCollection {
    const parsed = typeof input === 'string' ? JSON.parse(input) as FeatureCollection | Feature : input;
    const collection = normalizeGeoJSON(parsed);
    for (const feature of collection.features) {
      if (!isDrawFeature(feature)) continue;
      const id = String(feature.id ?? `draw-${++this.drawSequence}`);
      feature.id = id;
      this.drawings.set(id, feature);
    }
    this.syncDrawings();
    return collection;
  }

  exportGeoJSON(pretty = true): string {
    const featureLayers = [...this.geoLayers.values()].flatMap((layer) => layer.data.features);
    const collection = serializeFeatures([...featureLayers, ...this.drawings.values()]);
    return JSON.stringify(collection, null, pretty ? 2 : 0);
  }

  measureDistance(feature: Parameters<typeof measureDistance>[0]): number {
    return measureDistance(feature);
  }

  measureArea(feature: Feature<Polygon>): number {
    return measureArea(feature);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopEdit();
    this.clearMarkers();
    for (const adapter of this.adapters.values()) void adapter.dispose?.();
    this.events.clear();
    this.map.remove();
  }

  private emit(event: OpenMapEvent, payload: unknown): void {
    for (const handler of this.events.get(event) ?? []) handler(payload);
  }

  private bindBaseEvents(): void {
    for (const event of ['move', 'zoom', 'rotate'] as const) this.map.on(event, () => this.emit(event, this));
    this.map.on('click', (event) => {
      if (this.drawState) this.handleDrawClick(event);
      else this.emit('click', event);
    });
    this.map.on('dblclick', (event) => this.handleDrawDoubleClick(event));
    this.map.on('mousemove', (event) => {
      if (!this.drawState) return;
      this.drawPreview = drawPreviewFeature(
        this.drawState.mode,
        this.drawState.points,
        [event.lngLat.lng, event.lngLat.lat],
        this.drawState.options.circleSteps
      );
      this.syncDrawings();
    });
    this.map.getCanvas().addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.cancelDraw();
    });
  }

  private handleDrawClick(event: MapMouseEvent): void {
    const state = this.drawState;
    if (!state) return;
    state.points.push([event.lngLat.lng, event.lngLat.lat]);
    if (state.mode === 'point') {
      this.completeDraw({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: state.points[0]! } });
    } else if ((state.mode === 'rectangle' || state.mode === 'circle') && state.points.length === 2) {
      this.completeDraw(state.mode === 'rectangle'
        ? rectangleFeature(state.points[0]!, state.points[1]!)
        : circleFeature(state.points[0]!, state.points[1]!, state.options.circleSteps));
    } else {
      this.drawPreview = drawPreviewFeature(state.mode, state.points, state.points[state.points.length - 1]!, state.options.circleSteps);
      this.syncDrawings();
    }
  }

  private handleDrawDoubleClick(event: MapMouseEvent): void {
    const state = this.drawState;
    if (!state || !['line', 'polygon'].includes(state.mode)) return;
    event.preventDefault();
    const points = state.points.filter((point, index, all) => {
      const previous = all[index - 1];
      return !previous || point[0] !== previous[0] || point[1] !== previous[1];
    });
    if (points.length < (state.mode === 'line' ? 2 : 3)) return;
    if (state.mode === 'line') {
      this.completeDraw({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: points } });
    } else {
      this.completeDraw({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...points, points[0]!]] } });
    }
  }

  private completeDraw(feature: DrawFeature): void {
    const id = `draw-${++this.drawSequence}`;
    feature.id = id;
    feature.properties = { ...feature.properties, id };
    this.drawings.set(id, feature);
    this.cancelDraw();
    this.emit('draw.create', feature);
  }

  private installDrawLayers(): void {
    if (this.map.getSource('open-map-drawings')) return;
    this.map.addSource('open-map-drawings', { type: 'geojson', data: serializeFeatures(this.getDrawingFeatures()) });
    this.map.addLayer({ id: 'open-map-draw-fill', type: 'fill', source: 'open-map-drawings', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': '#2563eb', 'fill-opacity': ['case', ['boolean', ['get', '__openMapPreview'], false], 0.12, 0.2] } });
    this.map.addLayer({ id: 'open-map-draw-line', type: 'line', source: 'open-map-drawings', filter: ['in', '$type', 'LineString', 'Polygon'], paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-opacity': ['case', ['boolean', ['get', '__openMapPreview'], false], 0.72, 1] } });
    this.map.addLayer({ id: 'open-map-draw-point', type: 'circle', source: 'open-map-drawings', filter: ['==', '$type', 'Point'], paint: { 'circle-color': ['case', ['boolean', ['get', '__openMapPreview'], false], '#f97316', '#2563eb'], 'circle-radius': 6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
  }

  private syncDrawings(): void {
    const source = this.map.getSource('open-map-drawings') as GeoJSONSource | undefined;
    source?.setData(serializeFeatures(this.getDrawingFeatures()));
  }

  private getDrawingFeatures(): Array<Feature<Geometry>> {
    const features: Array<Feature<Geometry>> = [...this.drawings.values()];
    if (this.drawPreview) features.push(this.drawPreview);
    for (const [index, coordinates] of (this.drawState?.points ?? []).entries()) {
      features.push({
        type: 'Feature',
        id: `preview-vertex-${index}`,
        properties: { __openMapPreview: true },
        geometry: { type: 'Point', coordinates }
      });
    }
    return features;
  }

  private createMarkerElement(options: MarkerOptions): HTMLElement {
    if (options.html instanceof HTMLElement) {
      options.html.classList.add('open-map-marker');
      return options.html;
    }
    const element = document.createElement('div');
    element.className = `open-map-marker ${options.className ?? ''}`.trim();
    element.setAttribute('data-marker-id', options.id);
    if (typeof options.html === 'string') element.innerHTML = options.html;
    else if (options.image) {
      const image = document.createElement('img');
      image.src = options.image;
      image.alt = options.label ?? '';
      element.append(image);
    } else if (options.svg) {
      const icon = document.createElement('span');
      icon.innerHTML = options.svg;
      element.append(icon);
    } else {
      const pin = document.createElement('span');
      pin.className = 'open-map-marker__pin';
      if (options.color) pin.style.background = options.color;
      element.append(pin);
    }
    if (options.label) {
      const label = document.createElement('span');
      label.className = 'open-map-marker__label';
      label.textContent = options.label;
      element.append(label);
    }
    return element;
  }

  private addStoredLayer(options: StoredLayer): void {
    const sourceId = `${options.id}${SOURCE_SUFFIX}`;
    this.map.addSource(sourceId, { type: 'geojson', data: options.data });
    this.map.addLayer({
      id: options.id,
      source: sourceId,
      type: options.type,
      paint: options.paint,
      layout: options.layout,
      filter: options.filter,
      minzoom: options.minzoom,
      maxzoom: options.maxzoom
    } as maplibregl.LayerSpecification, options.beforeId);
  }

  private restoreCustomContent(): void {
    this.installDrawLayers();
    for (const layer of this.geoLayers.values()) this.addStoredLayer(layer);
    const clusters = [...this.clusters.values()];
    this.clusters.clear();
    for (const cluster of clusters) this.addCluster(cluster);
    const customSources = [...this.customSources.values()];
    this.customSources.clear();
    for (const source of customSources) this.addCustomSource(source);
  }
}
