import fs from "node:fs";
import path from "node:path";
import axios from "axios";

async function downloadLocations(appName) {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const url = `https://api.${appName}.com/v1/pins?types=gym`;

  try {
    const response = await axios.get(url);
    const jsonData = response.data;
    const filePath = path.join(dataDir, `${appName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
  }
}

async function scrapeLocations() {
  const boards = [
    "auroraboardapp",
    "decoyboardapp",
    "grasshopperboardapp",
    "kilterboardapp",
    "soillboardapp",
    "tensionboardapp2",
    "touchstoneboardapp"
  ];

  for (const board of boards) {
    await downloadLocations(board);
  }
}

scrapeLocations();