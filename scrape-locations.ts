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
import type { Gym, Wall } from "./interfaces/user.ts";

// API
import { getLogins } from "./api/logins.ts";
import { getUsers } from "./api/users.ts";
import { getPins } from "./api/pins.ts";

interface PinWithOptionalUser extends Pin {
  walls?: Wall[];
  gym?: Gym;
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
 * Fetches user (gym: name, address, walls: angle, rotatable, etc.) details for all pins
 * @param {Pin[]} pins - Array of gyms to fetch walls for
 * @param {BoardType} board - The name of the board app
 * @param {Object} credentials - Username and password for authentication
 * @returns {Promise<PinWithOptionalUser[]>} Array of gyms with wall details
 */
async function scrapeUser(
  pins: Pin[],
  board: BoardType,
  credentials: {
    username: string;
    password: string;
  },
): Promise<PinWithOptionalUser[]> {
  try {
    const data = await getLogins(
      board,
      credentials.username,
      credentials.password,
    );

    const PinWithOptionalUser = await Promise.all(
      pins.map(async (pin: Pin) => {
        try {
          const login = await getUsers(board, pin.id, data.token);

          if (login?.user?.walls) {
            return {
              ...pin,
              walls: login.user.walls,
              gym: login.user.gym,
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

    return PinWithOptionalUser;
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
 * Scrapes gym location (pins) for all configured board apps.
 * @returns {Promise<void>}
 */
async function scrapePins(): Promise<void> {
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
      const gymsOptionallyWithUser = credentials && pins.gyms.length > 0
        ? await scrapeUser(pins.gyms, board, credentials)
        : pins.gyms;

      const jsonData = { gyms: gymsOptionallyWithUser };

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

scrapePins();
