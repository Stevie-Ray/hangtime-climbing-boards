import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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
 * Gets credentials for a specific board from environment variables
 * @param {BoardType} board - The name of the board app
 * @returns {Object|undefined} Credentials object or undefined if not configured
 */
function getBoardCredentials(
  board: BoardType,
): { username: string; password: string } | undefined {
  const uppercaseBoardType = board.toUpperCase();
  const username = process.env[`${uppercaseBoardType}_USERNAME`];
  const password = process.env[`${uppercaseBoardType}_PASSWORD`];

  if (username && password) {
    return { username, password };
  }
  return undefined;
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

    const PinWithOptionalWalls = await Promise.all(
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

    return PinWithOptionalWalls;
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
 * @returns {Promise<void>}
 */
async function scrapeLocations(): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const board of boards) {
    try {
      // Get public gym info
      const pins = await getPins(board);

      // Get board-specific credentials from environment variables
      const credentials = getBoardCredentials(board);

      // If credentials are provided, fetch gym details (walls, info)
      const gymsOptionallyWithWalls = credentials && pins.gyms.length > 0
        ? await scrapeWalls(pins.gyms, board, credentials)
        : pins.gyms;

      const jsonData = { gyms: gymsOptionallyWithWalls };

      const filePath = path.join(dataDir, `${board}.json`);
      fs.writeFileSync(
        filePath,
        JSON.stringify(jsonData, null, 2) + "\n",
        "utf8",
      );
    } catch (error) {
      console.error(`Failed to process ${board}: ${error}`);
    }
  }
}

scrapeLocations();
