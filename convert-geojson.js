import fs from "node:fs";
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
    const locations = JSON.parse(fs.readFileSync(filename).toString());

    if (!Array.isArray(locations.gyms)) {
      throw new Error("expecting a 'gym' array inside the JSON");
    }

    const { gyms } = locations;

    return turf.featureCollection(
      gyms.map((gym) =>
        turf.point([gym.longitude, gym.latitude], gym, { id: gym.id }),
      ),
    );
  } catch (err) {
    console.error(`Unable to convert ${filename}: ${err}`);
    return false;
  }
};

const failures = boards
  .map((board) => {
    const geoJson = convertAuroraBoard(`./data/${board}.json`);

    if (!geoJson) {
      return board;
    }

    fs.mkdirSync('./geojson', { recursive: true });
    
    fs.writeFileSync(
      `./geojson/${board}.geojson`,
      JSON.stringify(geoJson, null, 2),
      { flag: 'w' }
    );
  })
  .filter((s) => !!s);

if (failures.length > 0) {
  console.error(`Failed to convert ${failures.join(", ")}`);
  process.exit(1);
}
