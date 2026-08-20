import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  LineString,
  Point,
  Polygon
} from 'geojson';
import type { ExpressionSpecification, LngLatBoundsLike, MapOptions, StyleSpecification } from 'maplibre-gl';

export type Coordinates = [number, number];
export type TiandituMapType = 'vector' | 'imagery' | 'terrain';

export interface TiandituProvider {
  type: 'tianditu';
  token: string;
  mapType?: TiandituMapType;
  subdomains?: string[];
}

export interface XyzProvider {
  type: 'xyz';
  tiles: string[];
  attribution: string;
  tileSize?: 256 | 512;
  minzoom?: number;
  maxzoom?: number;
}

export interface WmtsProvider {
  type: 'wmts';
  url: string;
  layer: string;
  tileMatrixSet: string;
  format?: string;
  style?: string;
  attribution: string;
  params?: Record<string, string>;
}

export interface StyleProvider {
  type: 'style';
  style: string | StyleSpecification;
}

export type MapProvider = TiandituProvider | XyzProvider | WmtsProvider | StyleProvider;

export interface OpenMapOptions extends Omit<MapOptions, 'style' | 'container' | 'center' | 'zoom'> {
  container: string | HTMLElement;
  provider: MapProvider;
  center?: Coordinates;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface MarkerOptions {
  id: string;
  coordinates: Coordinates;
  label?: string;
  popup?: string | HTMLElement;
  color?: string;
  rotation?: number;
  image?: string;
  svg?: string;
  html?: string | HTMLElement;
  className?: string;
  draggable?: boolean;
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export type MarkerEvent = 'click' | 'dblclick' | 'mouseenter' | 'mouseleave' | 'dragstart' | 'drag' | 'dragend';

export interface GeoJSONLayerOptions {
  id: string;
  data: Feature | FeatureCollection | Geometry | string;
  type: 'circle' | 'line' | 'fill' | 'symbol';
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  filter?: ExpressionSpecification;
  minzoom?: number;
  maxzoom?: number;
  beforeId?: string;
}

export type DrawMode = 'point' | 'line' | 'rectangle' | 'circle' | 'polygon';
export type DrawFeature = Feature<Point | LineString | Polygon, GeoJsonProperties>;

export interface DrawOptions {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  circleSteps?: number;
}

export interface ClusterOptions {
  id: string;
  data: FeatureCollection<Point> | string;
  radius?: number;
  maxZoom?: number;
  colorSteps?: Array<[number, string]>;
}

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  array: [[number, number], [number, number]];
}

export interface FitOptions {
  padding?: number;
  maxZoom?: number;
  duration?: number;
}

export interface CustomSourceOptions {
  id: string;
  provider: XyzProvider | WmtsProvider;
  beforeId?: string;
  opacity?: number;
}

export interface SourceAdapter {
  type: string;
  createSource: (options: Record<string, unknown>) => unknown | Promise<unknown>;
  dispose?: () => void | Promise<void>;
}

export type OpenMapEvent = 'ready' | 'error' | 'move' | 'zoom' | 'rotate' | 'click' | 'draw.create' | 'draw.update' | 'draw.delete';
export type EventHandler<T = unknown> = (payload: T) => void;
export type BoundsLike = LngLatBoundsLike;
