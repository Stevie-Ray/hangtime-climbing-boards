/**
 * Simplestyle-spec 1.1.0 properties.
 * All properties are optional.
 * {@link https://github.com/mapbox/simplestyle-spec/}
 */
export interface SimplestyleSpec {
  /**
   * A title to show when this item is clicked or hovered over.
   * OPTIONAL: default ""
   */
  title?: string;

  /**
   * A description to show when this item is clicked or hovered over.
   * OPTIONAL: default ""
   */
  description?: string;

  /**
   * Specify the size of the marker.
   * Allowed values: "small", "medium", "large".
   * OPTIONAL: default "medium"
   */
  "marker-size"?: "small" | "medium" | "large";

  /**
   * A symbol to position in the center of this icon.
   * Allowed values:
   * - Icon ID (string)
   * - An integer 0 through 9
   * - A lowercase character "a" through "z"
   * OPTIONAL: default ""
   */
  "marker-symbol"?: string | number;

  /**
   * The marker's color.
   * Value must follow COLOR RULES (CSS hex colors in #RRGGBB or #RGB form, with or without the '#' prefix).
   * OPTIONAL: default "7e7e7e"
   */
  "marker-color"?: string;

  /**
   * The color of a line as part of a polygon, polyline, or multigeometry.
   * Value must follow COLOR RULES.
   * OPTIONAL: default "555555"
   */
  stroke?: string;

  /**
   * The opacity of the line component of a polygon, polyline, or multigeometry.
   * Must be a number between 0 and 1.
   * OPTIONAL: default 1.0
   */
  "stroke-opacity"?: number;

  /**
   * The width of the line component of a polygon, polyline, or multigeometry.
   * Must be a number greater than or equal to 0.
   * OPTIONAL: default 2
   */
  "stroke-width"?: number;

  /**
   * The color of the interior of a polygon.
   * Value must follow COLOR RULES.
   * OPTIONAL: default "555555"
   */
  fill?: string;

  /**
   * The opacity of the interior of a polygon.
   * Must be a number between 0 and 1.
   * OPTIONAL: default 0.6
   */
  "fill-opacity"?: number;
}
