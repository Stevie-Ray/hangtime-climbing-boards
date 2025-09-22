/**
 * Type definition for supported board applications
 */
export type BoardType =
  | "auroraboardapp"
  | "decoyboardapp"
  | "grasshopperboardapp"
  | "kilterboardapp"
  | "moonboard"
  | "soillboardapp"
  | "tensionboardapp2"
  | "touchstoneboardapp"
  | "12climb";

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
  "moonboard",
  "soillboardapp",
  "tensionboardapp2",
  "touchstoneboardapp",
  "12climb",
];
