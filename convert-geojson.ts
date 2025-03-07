import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as turf from "@turf/helpers";
import type { Gym } from "./interfaces/gym.ts";
import { boards } from "./boards.ts";

/**
 * Converts a JSON file containing gym locations into a GeoJSON FeatureCollection.
 * @param {string} filename - Path to the input JSON file containing gym data
 * @returns {FeatureCollection | false} A GeoJSON FeatureCollection if successful, false if conversion fails
 * @throws {Error} If the file structure is invalid or gym coordinates are missing
 */
const convertAuroraBoard = (filename: string) => {
  try {
    const locations = JSON.parse(fs.readFileSync(filename, "utf8"));

    if (!Array.isArray(locations.gyms)) {
      throw new Error(
        `Invalid file structure: expecting a 'gyms' array in ${filename}`,
      );
    }

    return turf.featureCollection(
      locations.gyms.map((gym: Gym) => {
        if (
          typeof gym.longitude !== "number" || typeof gym.latitude !== "number"
        ) {
          throw new Error(
            `Invalid gym coordinates in ${filename} for gym id ${gym.id}`,
          );
        }
        return turf.point([gym.longitude, gym.latitude], gym, { id: gym.id });
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
