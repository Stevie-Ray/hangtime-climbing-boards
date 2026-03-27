import type { BoardType } from "../boards.ts";
import type {
  AuroraPin,
  KilterPin,
  MoonboardPin,
  TwelveClimbPin,
} from "../interfaces/pin.ts";
import { getAuroraPins } from "./aurora.client.ts";
import { getKilterPins } from "./kilter.client.ts";
import { getMoonboardPins } from "./moonboard.client.ts";
import { getTwelveClimbPins } from "./12climb.client.ts";

/**
 * Downloads gym data for a specific board app from its API.
 * @param {BoardType} board - The name of the board app
 * @param {string} username - Username for authentication (required for Moonboard and Kilter)
 * @param {string} password - Password for authentication (required for Moonboard and Kilter)
 * @returns {Promise<{ gyms: AuroraPin[] | KilterPin[] }>} Gym data
 * @throws {Error} If the API request fails
 */
export async function getPins(
  board: BoardType,
  username?: string,
  password?: string,
): Promise<
  { gyms: AuroraPin[] | KilterPin[] | MoonboardPin[] | TwelveClimbPin[] }
> {
  // Handle Moonboard
  if (board === "moonboard") {
    return await getMoonboardPins(username, password);
  }
  // Handle Kilter via the new PowerSync backend
  if (board === "kilterboardapp") {
    if (!username || !password) {
      throw new Error("Kilter scraping requires credentials");
    }
    return await getKilterPins(username, password);
  }
  // Handle 12Climb
  if (board === "12climb") {
    return await getTwelveClimbPins();
  }
  // Handle all other Aurora-based boards
  return await getAuroraPins(board);
}
