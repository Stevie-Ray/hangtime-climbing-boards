import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Boards
import { boards, type BoardType } from "./boards.ts";

// Interfaces
import type { AuroraPin, MoonboardPin } from "./interfaces/pin.ts";
import type { Gym, User, Wall } from "./interfaces/user.ts";

// API
import { getLogins } from "./api/logins.ts";
import { getUsers } from "./api/users.ts";
import { getPins } from "./api/pins.ts";

interface AuroraPinWithOptionalUser extends AuroraPin {
  walls?: Wall[];
  gym?: Gym;
}

type PinWithOptionalUser = AuroraPinWithOptionalUser | MoonboardPin;

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
 * Helper function to get the identifier and name from a pin
 * @param {AuroraPin | MoonboardPin} pin - The pin to extract info from
 * @returns {Object} Object with id and name properties
 */
function getPinInfo(
  pin: AuroraPin | MoonboardPin,
): { id: string | number; name: string } {
  if ("id" in pin && "name" in pin) {
    // AuroraPin format
    return { id: pin.id, name: pin.name };
  } else {
    // MoonboardPin format
    return { id: pin.Name, name: pin.Name };
  }
}

/**
 * Fetches user (gym: name, address, walls: angle, rotatable, etc.) details for all pins
 * @param {AuroraPin[] | MoonboardPin[]} pins - Array of gyms to fetch walls for
 * @param {BoardType} board - The name of the board app
 * @param {Object} credentials - Username and password for authentication
 * @returns {Promise<PinWithOptionalUser[]>} Array of gyms with wall details
 */
async function scrapeUser(
  pins: AuroraPin[] | MoonboardPin[],
  board: BoardType,
  credentials: {
    username: string;
    password: string;
  },
): Promise<PinWithOptionalUser[]> {
  try {
    const token = await getLogins(
      board,
      credentials.username,
      credentials.password,
    );

    const PinWithOptionalUser = await Promise.all(
      pins.map(async (pin: AuroraPin | MoonboardPin) => {
        try {
          const pinInfo = getPinInfo(pin);

          // Only fetch user details for Aurora-based boards (which have numeric IDs)
          if (typeof pinInfo.id === "number") {
            const login = await getUsers(board, pinInfo.id, token);

            if (
              login?.users && Array.isArray(login.users) &&
              login.users.length > 0
            ) {
              // Return an array of pins, one for each user
              return login.users.map((user: User) => ({
                ...pin,
                walls: user.walls,
                gym: user.gym,
              }));
            }
          }

          // For Moonboard pins or when no user data is found, return the pin as-is
          return pin;
        } catch (error) {
          const pinInfo = getPinInfo(pin);
          console.error(
            `Failed to fetch walls for gym ${pinInfo.name} (${pinInfo.id}): ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return pin;
        }
      }),
    );

    // Flatten the array in case some pins returned arrays
    return PinWithOptionalUser.flat();
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
      // Get board-specific credentials from environment variables
      const credentials = getBoardCredentials(board);

      // Skip Moonboard if no credentials are provided
      if (board === "moonboard" && !credentials) {
        continue;
      }

      // Get public gym info (pass credentials for Moonboard)
      const pins = await getPins(
        board,
        credentials?.username,
        credentials?.password,
      );

      // Aurora Climbing: If credentials are provided, fetch gym details (walls, info)
      const gymsOptionallyWithUser: PinWithOptionalUser[] =
        credentials && pins.gyms.length > 0 && board !== "moonboard"
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
