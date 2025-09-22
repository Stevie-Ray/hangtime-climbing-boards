import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { featureCollection } from "@turf/helpers";

// Boards
import { boards, type BoardType } from "./boards.ts";

// Interfaces
import type { SimplestyleSpec } from "./interfaces/simplestyle-spec.ts";
import type { Feature, FeatureCollection } from "geojson";

const boardsInfo: Record<BoardType, {
  color: string;
  name: string;
}> = {
  auroraboardapp: { color: "#B93655", name: "Aurora Board" },
  decoyboardapp: { color: "#C256C8", name: "Decoy Board" },
  grasshopperboardapp: { color: "#00EAFF", name: "Grasshopper Board" },
  kilterboardapp: { color: "#ED1D24", name: "Kilter Board" },
  moonboard: { color: "#FEB91E", name: "Moon Board" },
  soillboardapp: { color: "#8BB297", name: "So iLL Board" },
  tensionboardapp2: { color: "#000000", name: "Tension Board" },
  touchstoneboardapp: { color: "#276EAE", name: "Touchstone Board" },
  "12climb": { color: "#ED1667", name: "12Climb Board" },
};

/**
 * Reads and styles a GeoJSON file for a specific board type.
 * @param {BoardType} boardType - The type of board to process (e.g., 'auroraboardapp', 'kilterboardapp')
 * @returns {Feature[]} An array of GeoJSON features with added styling and board information
 * @throws {Error} If there's an error reading or parsing the GeoJSON file
 */
const readAndStyleGeoJSON = (boardType: BoardType): Feature[] => {
  const filePath = path.join(process.cwd(), "geojson", `${boardType}.geojson`);
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const geoJson = JSON.parse(fileContent) as FeatureCollection;

    if (!geoJson || !Array.isArray(geoJson.features)) {
      console.warn(
        `Warning: ${filePath} does not contain valid GeoJSON features.`,
      );
      return [];
    }

    return geoJson.features.map((feature) => {
      const newFeature = JSON.parse(JSON.stringify(feature)) as Feature;

      // Handle both lowercase (Aurora) and uppercase (Moonboard) name properties
      const name = newFeature.properties?.name || newFeature.properties?.Name ||
        "";
      const { name: _, Name: __, Description: ___, ...otherProperties } =
        newFeature.properties ||
        {};

      // Use board name as fallback when no specific name is provided
      const title = name || boardsInfo[boardType]?.name || "Unknown Board";

      newFeature.properties = {
        ...otherProperties,
        title: title,
        description: newFeature.properties?.Description ||
          newFeature.properties?.description ||
          `${boardsInfo[boardType]?.name}${name ? ` at ${name}` : ""}`,
        ...(boardsInfo[boardType] &&
          { "marker-color": boardsInfo[boardType].color }),
      } as SimplestyleSpec;

      return newFeature;
    });
  } catch (err) {
    console.error(
      `Error processing ${boardType}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return [];
  }
};

/**
 * Combines multiple GeoJSON files into a single GeoJSON file.
 * Reads all board GeoJSON files, applies styling, and writes the combined result
 * to a new file named 'combined.geojson' in the geojson directory.
 * @returns {void}
 * @throws {Error} If there's an error writing the combined GeoJSON file
 */
const combineGeoJSONFiles = (): void => {
  const allFeatures: Feature[] = [];

  boards.forEach((board) => {
    const features = readAndStyleGeoJSON(board);
    allFeatures.push(...features);
  });

  const combinedGeoJSON = featureCollection(allFeatures);
  const outputFilePath = path.join(
    process.cwd(),
    "geojson",
    "combined.geojson",
  );

  try {
    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(combinedGeoJSON, null, 2),
      "utf8",
    );
  } catch (err) {
    console.error(
      `Error writing combined GeoJSON: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
};

combineGeoJSONFiles();
