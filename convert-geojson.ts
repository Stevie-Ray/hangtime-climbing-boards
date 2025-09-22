import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { featureCollection, point } from "@turf/helpers";

// Boards
import { boards } from "./boards.ts";

// Interfaces
import type { FeatureCollection } from "geojson";
import type {
  AuroraPin,
  MoonboardPin,
  TwelveClimbPin,
} from "./interfaces/pin.ts";

// Type guards for format detection
const isMoonboardPin = (item: unknown): item is MoonboardPin =>
  typeof item === "object" && item !== null && "Name" in item &&
  "IsCommercial" in item;

const isTwelveClimbPin = (item: unknown): item is TwelveClimbPin =>
  typeof item === "object" && item !== null && "name" in item &&
  "description" in item &&
  "latitude" in item && "longitude" in item;

// Coordinate validation helpers
const validateCoordinates = (
  lng: unknown,
  lat: unknown,
  gymName: string,
  filename: string,
): void => {
  if (typeof lng !== "number" || typeof lat !== "number") {
    throw new Error(
      `Invalid gym coordinates in ${filename} for gym ${gymName}`,
    );
  }
};

// Pin conversion functions
const convertAuroraPin = (pin: AuroraPin, filename: string) => {
  validateCoordinates(pin.longitude, pin.latitude, `id ${pin.id}`, filename);
  return point([pin.longitude, pin.latitude], pin, { id: pin.id });
};

const convertMoonboardPin = (pin: MoonboardPin, filename: string) => {
  validateCoordinates(pin.Longitude, pin.Latitude, pin.Name, filename);
  return point([pin.Longitude, pin.Latitude], pin, {});
};

const convertTwelveClimbPin = (pin: TwelveClimbPin, filename: string) => {
  validateCoordinates(pin.longitude, pin.latitude, pin.name, filename);
  return point([pin.longitude, pin.latitude], pin, {});
};

// Main conversion function
const convertBoardData = (filename: string): FeatureCollection | false => {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));

    if (!Array.isArray(data.gyms)) {
      throw new Error(
        `Invalid file structure: expecting a 'gyms' array in ${filename}`,
      );
    }

    const features = data.gyms.map(
      (item: AuroraPin | MoonboardPin | TwelveClimbPin) => {
        if (isTwelveClimbPin(item)) {
          return convertTwelveClimbPin(item, filename);
        } else if (isMoonboardPin(item)) {
          return convertMoonboardPin(item, filename);
        } else {
          return convertAuroraPin(item as AuroraPin, filename);
        }
      },
    );

    return featureCollection(features);
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
