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

const boardsInfo = {
  auroraboardapp: { color: "#B93655", name: "Aurora Board" },
  decoyboardapp: { color: "#C256C8", name: "Decoy Board" },
  grasshopperboardapp: { color: "#00EAFF", name: "Grasshopper Board" },
  kilterboardapp: { color: "#ED1D24", name: "Kilter Board" },
  soillboardapp: { color: "#8BB297", name: "So iLL Board" },
  tensionboardapp2: { color: "#000000", name: "Tension Board" },
  touchstoneboardapp: { color: "#276EAE", name: "Touchstone Board" },
};

const readAndStyleGeoJSON = (boardType) => {
  const filePath = path.join(process.cwd(), "geojson", `${boardType}.geojson`);
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} does not exist.`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const geoJson = JSON.parse(fileContent);

    if (!geoJson || !Array.isArray(geoJson.features)) {
      console.warn(`Warning: ${filePath} does not contain valid GeoJSON features.`);
      return [];
    }

    return geoJson.features.map((feature) => {
      const newFeature = JSON.parse(JSON.stringify(feature));

      newFeature.properties = {
        ...newFeature.properties,
        boardType,
        "marker-color": boardsInfo[boardType].color,
        title: newFeature.properties.name || "",
        description: `${boardsInfo[boardType].name} at ${newFeature.properties.name || ""}`,
      };

      return newFeature;
    });
  } catch (err) {
    console.error(`Error processing ${boardType}: ${err.message}`);
    return [];
  }
};

const combineGeoJSONFiles = () => {
  const allFeatures = [];

  boards.forEach((board) => {
    const features = readAndStyleGeoJSON(board);
    allFeatures.push(...features);
  });

  const combinedGeoJSON = turf.featureCollection(allFeatures);
  const outputFilePath = path.join(process.cwd(), "geojson", "combined.geojson");

  try {
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedGeoJSON, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing combined GeoJSON: ${err.message}`);
  }
};

combineGeoJSONFiles();
