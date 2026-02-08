import type mapboxgl from 'mapbox-gl';

const COLORS = {
  // Midnight purple base (not pitch black)
  background: '#150E24',
  land: '#19112A',
  landcover: '#14231B',
  park: '#10301E',
  water: '#0B2440',
  building: '#221734',
  // Roads: dark grey (no bright purple)
  roadMinor: '#2E2A33',
  roadMajor: '#3D3742',
  roadHighway: '#524A5A',
  roadCasing: '#15121B',
  boundary: '#2B2234',
  // Labels: muted, readable on purple
  label: '#D8D3E1',
  labelMuted: '#B1AABD',
  labelRoad: '#C3BDD0',
  labelWater: '#8FB2E6',
  labelHalo: '#0A0812'
};

type AnyLayer = mapboxgl.Layer & {
  'source-layer'?: string;
};

function safeSetPaint(map: mapboxgl.Map, layerId: string, prop: string, value: unknown) {
  try {
    map.setPaintProperty(layerId, prop, value as any);
  } catch {
    // Ignore unsupported properties for a given layer/style.
  }
}

export function applyEvasionMapTheme(map: mapboxgl.Map) {
  const style = map.getStyle();
  const layers = style?.layers ?? [];

  for (const layer of layers as AnyLayer[]) {
    const id = layer.id.toLowerCase();
    const sourceLayer = (layer['source-layer'] ?? '').toLowerCase();

    if (layer.type === 'background') {
      safeSetPaint(map, layer.id, 'background-color', COLORS.background);
      continue;
    }

    if (layer.type === 'fill') {
      if (id.includes('water') || sourceLayer.includes('water')) {
        safeSetPaint(map, layer.id, 'fill-color', COLORS.water);
        continue;
      }
      if (id.includes('park') || sourceLayer.includes('park') || id.includes('landuse') || sourceLayer.includes('landuse')) {
        safeSetPaint(map, layer.id, 'fill-color', COLORS.park);
        continue;
      }
      if (id.includes('building') || sourceLayer.includes('building')) {
        safeSetPaint(map, layer.id, 'fill-color', COLORS.building);
        // Avoid bright/jagged outlines on buildings
        safeSetPaint(map, layer.id, 'fill-outline-color', COLORS.building);
        continue;
      }
      if (id.includes('landcover') || sourceLayer.includes('landcover')) {
        safeSetPaint(map, layer.id, 'fill-color', COLORS.landcover);
        continue;
      }
      if (id.includes('land') || sourceLayer.includes('land')) {
        safeSetPaint(map, layer.id, 'fill-color', COLORS.land);
        continue;
      }
    }

    if (layer.type === 'line') {
      if (id.includes('building') || sourceLayer.includes('building')) {
        // Nuke building outlines entirely
        safeSetPaint(map, layer.id, 'line-color', COLORS.building);
        safeSetPaint(map, layer.id, 'line-opacity', 0);
        continue;
      }
      if (id.includes('road') || sourceLayer.includes('road')) {
        let color = COLORS.roadMinor;
        if (id.includes('motorway') || id.includes('trunk') || id.includes('primary')) {
          color = COLORS.roadHighway;
        } else if (id.includes('secondary') || id.includes('tertiary')) {
          color = COLORS.roadMajor;
        }
        safeSetPaint(map, layer.id, 'line-color', color);
        if (id.includes('casing')) {
          safeSetPaint(map, layer.id, 'line-color', COLORS.roadCasing);
        }
        continue;
      }
      if (id.includes('boundary') || sourceLayer.includes('boundary')) {
        safeSetPaint(map, layer.id, 'line-color', COLORS.boundary);
        continue;
      }
    }

    if (layer.type === 'symbol') {
      const hasText = !!(layer.layout as any)?.['text-field'];
      if (!hasText) continue;

      let textColor = COLORS.label;
      if (id.includes('road')) {
        textColor = COLORS.labelRoad;
      } else if (id.includes('water')) {
        textColor = COLORS.labelWater;
      } else if (id.includes('poi') || id.includes('transit')) {
        textColor = COLORS.labelMuted;
      }

      safeSetPaint(map, layer.id, 'text-color', textColor);
      safeSetPaint(map, layer.id, 'text-halo-color', COLORS.labelHalo);
      safeSetPaint(map, layer.id, 'text-halo-width', 1.25);
    }

    if (layer.type === 'fill-extrusion') {
      safeSetPaint(map, layer.id, 'fill-extrusion-color', COLORS.building);
      safeSetPaint(map, layer.id, 'fill-extrusion-vertical-gradient', true);
      safeSetPaint(map, layer.id, 'fill-extrusion-ambient-occlusion-intensity', 0);
    }
  }
}
