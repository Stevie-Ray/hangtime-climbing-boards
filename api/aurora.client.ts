import type { BoardType } from "../boards.ts";
import type { AuroraPin } from "../interfaces/pin.ts";
import { AuroraClient } from "../models/aurora.client.ts";

/**
 * Downloads gym data for Aurora-based board apps from their API.
 * @param {BoardType} board - The name of the board app
 * @returns {Promise<{ gyms: AuroraPin[] }>} Gym data
 * @throws {Error} If the API request fails
 */
export async function getAuroraPins(
  board: BoardType,
): Promise<{ gyms: AuroraPin[] }> {
  const client = new AuroraClient(board);
  return await client.request<{ gyms: AuroraPin[] }>({
    method: "GET",
    url: "/pins",
    params: {
      gyms: 1,
    },
  });
}
