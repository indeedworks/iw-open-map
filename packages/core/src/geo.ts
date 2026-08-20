import {
  area,
  circle,
  distance,
  featureCollection,
  length,
  lineString,
  polygon
} from '@turf/turf';
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString, Point, Polygon } from 'geojson';
import type { Coordinates, DrawFeature, DrawMode } from './types';

export function normalizeGeoJSON(input: Feature | FeatureCollection | Geometry): FeatureCollection {
  if (input.type === 'FeatureCollection') return input;
  if (input.type === 'Feature') return featureCollection([input]);
  return featureCollection([{ type: 'Feature', properties: {}, geometry: input }]);
}

export function rectangleFeature(start: Coordinates, end: Coordinates): Feature<Polygon> {
  const [west, east] = start[0] < end[0] ? [start[0], end[0]] : [end[0], start[0]];
  const [south, north] = start[1] < end[1] ? [start[1], end[1]] : [end[1], start[1]];
  return polygon([[[west, south], [east, south], [east, north], [west, north], [west, south]]]);
}

export function circleFeature(center: Coordinates, edge: Coordinates, steps = 64): Feature<Polygon> {
  const radius = distance(center, edge, { units: 'kilometers' });
  return circle(center, radius, { steps, units: 'kilometers' });
}

export function drawPreviewFeature(
  mode: DrawMode,
  points: Coordinates[],
  cursor: Coordinates,
  circleSteps = 64
): DrawFeature {
  const properties = { __openMapPreview: true };
  if (mode === 'point' || points.length === 0) {
    return { type: 'Feature', properties, geometry: { type: 'Point', coordinates: cursor } };
  }
  if (mode === 'rectangle') return { ...rectangleFeature(points[0]!, cursor), properties };
  if (mode === 'circle') return { ...circleFeature(points[0]!, cursor, circleSteps), properties };

  const coordinates = [...points, cursor];
  if (mode === 'polygon' && points.length >= 2) {
    return {
      type: 'Feature',
      properties,
      geometry: { type: 'Polygon', coordinates: [[...coordinates, points[0]!]] }
    };
  }
  return {
    type: 'Feature',
    properties,
    geometry: coordinates.length === 1
      ? { type: 'Point', coordinates: cursor }
      : { type: 'LineString', coordinates }
  };
}

export function measureDistance(feature: Feature<LineString> | Coordinates[]): number {
  const line = Array.isArray(feature) ? lineString(feature) : feature;
  return length(line, { units: 'kilometers' });
}

export function measureArea(feature: Feature<Polygon>): number {
  return area(feature);
}

export function serializeFeatures(features: Array<Feature<Geometry, GeoJsonProperties>>): FeatureCollection {
  return featureCollection(features);
}

export function isDrawFeature(feature: Feature<Geometry>): feature is DrawFeature {
  return ['Point', 'LineString', 'Polygon'].includes(feature.geometry.type);
}

export type PointFeatureCollection = FeatureCollection<Point>;
