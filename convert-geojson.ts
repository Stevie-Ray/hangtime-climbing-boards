import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { featureCollection, point } from "@turf/helpers";

// Boards
import { boards } from "./boards.ts";

// Interfaces
import type { FeatureCollection } from "geojson";
import type { Pin } from "./interfaces/pin.ts";

/**
 * Converts a JSON file containing gym locations into a GeoJSON FeatureCollection.
 * @param {string} filename - Path to the input JSON file containing gym data
 * @returns {FeatureCollection | false} A GeoJSON FeatureCollection if successful, false if conversion fails
 * @throws {Error} If the file structure is invalid or gym coordinates are missing
 */
const convertAuroraBoard = (filename: string): FeatureCollection | false => {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));

    if (!Array.isArray(data.gyms)) {
      throw new Error(
        `Invalid file structure: expecting a 'gyms' array in ${filename}`,
      );
    }

    return featureCollection(
      data.gyms.map((pin: Pin) => {
        if (
          typeof pin.longitude !== "number" || typeof pin.latitude !== "number"
        ) {
          throw new Error(
            `Invalid gym coordinates in ${filename} for gym id ${pin.id}`,
          );
        }
        return point([pin.longitude, pin.latitude], pin, { id: pin.id });
      }),
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Unable to convert ${filename}: ${err.message}`);
    }
    return false;
  }
};

const geoJsonDir = path.join(process.cwd(), "geojson");
if (!fs.existsSync(geoJsonDir)) {
  fs.mkdirSync(geoJsonDir, { recursive: true });
}

const failedBoards: string[] = [];

boards.forEach((board) => {
  const inputFilePath = path.join(process.cwd(), "data", `${board}.json`);
  const geoJson = convertAuroraBoard(inputFilePath);

  if (!geoJson) {
    failedBoards.push(board);
    return;
  }

  const outputFile = path.join(geoJsonDir, `${board}.geojson`);
  fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), "utf8");
});

if (failedBoards.length > 0) {
  console.error(`Failed to convert: ${failedBoards.join(", ")}`);
  process.exit(1);
}
