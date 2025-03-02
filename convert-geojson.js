import fs from "node:fs";
import path from "node:path";
import * as turf from "@turf/helpers";

const boards = [
  "auroraboardapp",
  "decoyboardapp",
  "grasshopperboardapp",
  "kilterboardapp",
  "soillboardapp",
  "tensionboardapp2",
  "touchstoneboardapp",
];

const convertAuroraBoard = (filename) => {
  try {
    // {
    //   "gyms": [
    //     {
    //       "id": 1575,
    //       "username": "duisburg.einstein.boulder",
    //       "name": "Einstein Boulderhalle Duisburg",
    //       "latitude": 51.43236,
    //       "longitude": 6.7432
    //     },
    //     ...
    //   ]
    // }
    const locations = JSON.parse(fs.readFileSync(filename, 'utf8'));

    if (!Array.isArray(locations.gyms)) {
      throw new Error(`Invalid file structure: expecting a 'gyms' array in ${filename}`);
    }

    return turf.featureCollection(
      locations.gyms.map((gym) => {
        if (typeof gym.longitude !== 'number' || typeof gym.latitude !== 'number') {
          throw new Error(`Invalid gym coordinates in ${filename} for gym id ${gym.id}`);
        }
        return turf.point([gym.longitude, gym.latitude], gym, { id: gym.id });
      })
    );
  } catch (err) {
    console.error(`Unable to convert ${filename}: ${err.message}`);
    return false;
  }
};

const geoJsonDir = path.join(process.cwd(), 'geojson');
if (!fs.existsSync(geoJsonDir)) {
  fs.mkdirSync(geoJsonDir, { recursive: true });
}

const failedBoards = [];

boards.forEach((board) => {
  const inputFilePath = path.join(process.cwd(), 'data', `${board}.json`);
  const geoJson = convertAuroraBoard(inputFilePath);

  if (!geoJson) {
    failedBoards.push(board);
    return;
  }

  const outputFile = path.join(geoJsonDir, `${board}.geojson`);
  fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), 'utf8');
});

if (failedBoards.length > 0) {
  console.error(`Failed to convert: ${failedBoards.join(", ")}`);
  process.exit(1);
}
