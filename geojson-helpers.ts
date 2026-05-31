import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Point,
  Position,
} from "geojson";

export const createPointFeature = <
  Properties extends GeoJsonProperties = GeoJsonProperties,
>(
  coordinates: Position,
  properties: Properties,
  id?: string | number,
): Feature<Point, Properties> => {
  const geometry: Point = {
    type: "Point",
    coordinates,
  };

  if (id !== undefined) {
    return {
      type: "Feature",
      id,
      properties,
      geometry,
    };
  }

  return {
    type: "Feature",
    properties,
    geometry,
  };
};

export const createFeatureCollection = <
  GeometryType extends Geometry | null = Geometry,
  Properties extends GeoJsonProperties = GeoJsonProperties,
>(
  features: Array<Feature<GeometryType, Properties>>,
): FeatureCollection<GeometryType, Properties> => ({
  type: "FeatureCollection",
  features,
});
