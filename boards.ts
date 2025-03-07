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
 * Array of supported board types used throughout the application.
 * Each board type corresponds to a specific climbing board manufacturer's app.
 * @type {BoardType[]}
 */
export const boards: BoardType[] = [
  "auroraboardapp",
  "decoyboardapp",
  "grasshopperboardapp",
  "kilterboardapp",
  "soillboardapp",
  "tensionboardapp2",
  "touchstoneboardapp",
];
