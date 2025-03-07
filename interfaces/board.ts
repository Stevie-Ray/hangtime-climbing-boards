/**
 * Type definition for supported board applications
 */
export type BoardType = 
  | "auroraboardapp"
  | "decoyboardapp"
  | "grasshopperboardapp"
  | "kilterboardapp"
  | "soillboardapp"
  | "tensionboardapp2"
  | "touchstoneboardapp";

/**
 * Basic information about a climbing board
 */
export interface BoardInfo {
  /** Color code or name for the board */
  color: string;
  /** Display name of the board */
  name: string;
}

/**
 * Properties associated with a climbing board in GeoJSON format
 */
export interface BoardProperties {
  /** Type of the climbing board application */
  boardType: BoardType;
  /** Color code for the marker on the map */
  "marker-color": string;
  /** Title of the board */
  title: string;
  /** Description of the board */
  description: string;
  /** Additional properties */
  [key: string]: any;
} 