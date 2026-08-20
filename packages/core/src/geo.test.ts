import { describe, expect, it } from 'vitest';
import { lineString, polygon } from '@turf/turf';
import { circleFeature, drawPreviewFeature, measureArea, measureDistance, normalizeGeoJSON, rectangleFeature } from './geo';

describe('GeoJSON helpers', () => {
  it('creates a normalized rectangle', () => {
    const result = rectangleFeature([2, 3], [1, 1]);
    expect(result.geometry.coordinates[0]?.[0]).toEqual([1, 1]);
    const ring = result.geometry.coordinates[0]!;
    expect(ring[ring.length - 1]).toEqual([1, 1]);
  });

  it('creates a closed circle polygon', () => {
    const result = circleFeature([116.397, 39.908], [116.407, 39.908], 32);
    expect(result.geometry.type).toBe('Polygon');
    expect(result.geometry.coordinates[0]).toHaveLength(33);
  });

  it('measures distance in kilometers and area in square meters', () => {
    const km = measureDistance(lineString([[116, 39], [116.01, 39]]));
    const squareMeters = measureArea(polygon([[[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01], [0, 0]]]));
    expect(km).toBeGreaterThan(0.8);
    expect(squareMeters).toBeGreaterThan(1_000_000);
  });

  it('normalizes a geometry to a FeatureCollection', () => {
    expect(normalizeGeoJSON({ type: 'Point', coordinates: [0, 0] }).features).toHaveLength(1);
  });

  it('creates a live polygon preview from committed vertices and the cursor', () => {
    const preview = drawPreviewFeature('polygon', [[0, 0], [1, 0]], [1, 1]);
    expect(preview.geometry.type).toBe('Polygon');
    if (preview.geometry.type === 'Polygon') {
      expect(preview.geometry.coordinates[0]).toEqual([[0, 0], [1, 0], [1, 1], [0, 0]]);
    }
    expect(preview.properties?.__openMapPreview).toBe(true);
  });
});
