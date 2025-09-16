import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { featureCollection, point } from "@turf/helpers";

// Boards
import { boards } from "./boards.ts";

// Interfaces
import type { FeatureCollection } from "geojson";
import type { AuroraPin, MoonboardPin } from "./interfaces/pin.ts";

/**
 * Converts a JSON file containing gym locations into a GeoJSON FeatureCollection.
 * Handles both AuroraPin format (for Aurora, Kilter, Tension, etc.) and MoonboardPin format (for Moonboard).
 * @param {string} filename - Path to the input JSON file containing gym data
 * @returns {FeatureCollection | false} A GeoJSON FeatureCollection if successful, false if conversion fails
 * @throws {Error} If the file structure is invalid or gym coordinates are missing
 */
const convertBoardData = (filename: string): FeatureCollection | false => {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));

    if (!Array.isArray(data.gyms)) {
      throw new Error(
        `Invalid file structure: expecting a 'gyms' array in ${filename}`,
      );
    }

    // Check if this is a Moonboard file (has MoonboardPin format)
    const isMoonboard = data.gyms.length > 0 &&
      typeof data.gyms[0] === "object" &&
      "Name" in data.gyms[0] &&
      "IsCommercial" in data.gyms[0];

    return featureCollection(
      data.gyms.map((item: AuroraPin | MoonboardPin) => {
        if (isMoonboard) {
          // Handle MoonboardPin format
          const moonboardPin = item as MoonboardPin;

          if (
            typeof moonboardPin.Longitude !== "number" ||
            typeof moonboardPin.Latitude !== "number"
          ) {
            throw new Error(
              `Invalid gym coordinates in ${filename} for gym ${moonboardPin.Name}`,
            );
          }

          return point(
            [moonboardPin.Longitude, moonboardPin.Latitude],
            moonboardPin,
            {},
          );
        } else {
          // Handle AuroraPin format
          const auroraPin = item as AuroraPin;

          if (
            typeof auroraPin.longitude !== "number" ||
            typeof auroraPin.latitude !== "number"
          ) {
            throw new Error(
              `Invalid gym coordinates in ${filename} for gym id ${auroraPin.id}`,
            );
          }

          return point(
            [auroraPin.longitude, auroraPin.latitude],
            auroraPin,
            { id: auroraPin.id },
          );
        }
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

  if (!fs.existsSync(inputFilePath)) {
    return;
  }

  const geoJson = convertBoardData(inputFilePath);

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
