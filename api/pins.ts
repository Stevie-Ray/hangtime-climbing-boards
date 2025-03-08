import type { BoardType } from "../boards.ts";
import type { Pin } from "../interfaces/pin.ts";
import { APIClient } from "../models/client.ts";

/**
 * Downloads gym data for a specific board app from its API.
 * @param {BoardType} board - The name of the board app
 * @returns {Promise<{ gyms: Pin[] }>} Gym data
 * @throws {Error} If the API request fails
 */
export function getPins(board: BoardType): Promise<{ gyms: Pin[] }> {
  const client = new APIClient(board);
  return client.request<{ gyms: Pin[] }>({
    method: "GET",
    url: "/v1/pins",
    params: {
      types: "gym",
    },
  });
}
