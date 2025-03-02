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

const boardColors = {
  "auroraboardapp": "#B93655",
  "decoyboardapp": "#C256C8", 
  "grasshopperboardapp": "#6EC1E4",
  "kilterboardapp": "#ED1D24", 
  "soillboardapp": "#A4D3D3", 
  "tensionboardapp2": "#000000",
  "touchstoneboardapp": "#276EAE",
};

const readAndStyleGeoJSON = (boardType) => {
  try {
    const filePath = `./geojson/${boardType}.geojson`;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const geoJson = JSON.parse(fileContent);
    
    if (!geoJson || !geoJson.features || !Array.isArray(geoJson.features)) {
      console.warn(`Warning: ${filePath} does not contain valid GeoJSON features`);
      return [];
    }
    
    return geoJson.features.map(feature => {

      const newFeature = JSON.parse(JSON.stringify(feature));
      
      // Add board type and simplestyle-spec properties
      newFeature.properties = {
        ...newFeature.properties,
        boardType: boardType,
        "marker-color": boardColors[boardType],
        // Add title and description for popups
        "title": newFeature.properties.name || boardType,
        "description": `${boardType} at ${newFeature.properties.username || ""}`
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
  
  for (const board of boards) {
    const features = readAndStyleGeoJSON(board);
    allFeatures.push(...features);
  }
  
  const combinedGeoJSON = turf.featureCollection(allFeatures);
  
  fs.writeFileSync(
    "./geojson/combined.geojson",
    JSON.stringify(combinedGeoJSON, null, 2)
  );
};

combineGeoJSONFiles(); 