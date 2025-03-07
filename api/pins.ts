import axios from "axios";
import type { BoardType } from "../boards.ts";
import type { Pin } from "../interfaces/pin.ts";

/**
 * Downloads gym data for a specific board app from its API and saves it to a JSON file.
 * @param {BoardType} board - The name of the board app
 * @returns {Promise<{ gyms: Gym[] }>} Gym data
 */
export async function getPins(board: BoardType): Promise<{ gyms: Pin[] }> {
  const url = `https://api.${board}.com/v1/pins?types=gym`;

  try {
    const response = await axios.get(url);
    return response.data as { gyms: Pin[] };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching ${url}: ${error.message}`);
    }
    throw error;
  }
}
