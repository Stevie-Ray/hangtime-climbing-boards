import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// Boards
import { boards, type BoardType } from "./boards.ts";

// Interfaces
import type { Pin } from "./interfaces/pin.ts";
import type { Wall } from "./interfaces/user.ts";

// API
import { getLogins } from "./api/logins.ts";
import { getUsers } from "./api/users.ts";
import { getPins } from "./api/pins.ts";

interface PinWithOptionalWalls extends Pin {
  walls?: Wall[];
}

/**
 * Fetches wall details for all gyms
 * @param {Pin[]} pins - Array of gyms to fetch walls for
 * @param {BoardType} board - The name of the board app
 * @param {Object} credentials - Username and password for authentication
 * @returns {Promise<PinWithOptionalWalls[]>} Array of gyms with wall details
 */
async function scrapeWalls(
  pins: Pin[],
  board: BoardType,
  credentials: {
    username: string;
    password: string;
  },
): Promise<PinWithOptionalWalls[]> {
  try {
    const data = await getLogins(
      board,
      credentials.username,
      credentials.password,
    );

    const pinsWithWalls = await Promise.all(
      pins.map(async (pin: Pin) => {
        try {
          const login = await getUsers(board, pin.id, data.token);

          if (login?.user?.walls) {
            return {
              ...pin,
              walls: login.user.walls,
            };
          } else {
            return pin;
          }
        } catch (error) {
          console.error(
            `Failed to fetch walls for gym ${pin.name} (${pin.id}): ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return pin;
        }
      }),
    );

    return pinsWithWalls;
  } catch (error) {
    console.error(
      `Authentication failed for ${board}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return pins;
  }
}

/**
 * Scrapes location data for all configured board apps.
 * @param {Object} credentials - Optional username and password for authentication
 * @returns {Promise<void>}
 * @example
 * npm run scrape -- --username=YOUR_USERNAME --password=YOUR_PASSWORD
 */
async function scrapeLocations(credentials?: {
  username: string;
  password: string;
}): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const board of boards) {
    try {
      // Get public gym info
      const pins = await getPins(board);

      // If credentials are provided, fetch gym details (walls, info)
      const gymsOptionallyWithWalls = credentials && pins.gyms.length > 0
        ? await scrapeWalls(pins.gyms, board, credentials)
        : pins.gyms;

      const jsonData = { gyms: gymsOptionallyWithWalls };

      const filePath = path.join(dataDir, `${board}.json`);
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
    } catch (error) {
      console.error(`Failed to process ${board}: ${error}`);
    }
  }
}

// Check if credentials are provided as command line arguments
const args = process.argv.slice(2);
const usernameIndex = args.indexOf("--username");
const passwordIndex = args.indexOf("--password");

const credentials = usernameIndex !== -1 && passwordIndex !== -1
  ? {
    username: args[usernameIndex + 1],
    password: args[passwordIndex + 1],
  }
  : undefined;

scrapeLocations(credentials);
