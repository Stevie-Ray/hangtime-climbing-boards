import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import axios from "axios";
import { boards } from "./boards.ts";

/**
 * Downloads location data for a specific board app from its API and saves it to a JSON file.
 * @param {string} appName - The name of the board app (e.g., 'auroraboardapp', 'kilterboardapp')
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails or file writing fails
 */
async function downloadLocations(appName: string): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");

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
    if (error instanceof Error) {
      console.error(`Error fetching ${url}: ${error.message}`);
    }
  }
}

/**
 * Scrapes location data for all configured board apps.
 * Iterates through the boards array and downloads location data for each board.
 * @returns {Promise<void>}
 * @throws {Error} If any of the download operations fail
 */
async function scrapeLocations(): Promise<void> {
  for (const board of boards) {
    await downloadLocations(board);
  }
}

scrapeLocations();
