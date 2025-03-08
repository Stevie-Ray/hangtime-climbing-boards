import type { BoardType } from "../boards.ts";
import type { User } from "../interfaces/user.ts";
import { APIClient } from "../models/client.ts";
import type { AxiosError } from "axios";

/**
 * Fetches user details for a specific gym
 * @param {BoardType} board - The name of the board app
 * @param {number} gymId - The ID of the gym
 * @param {string} token - Authentication token
 * @returns {Promise<{ user: User } | undefined>} User details or undefined if the gym is not found
 */
export async function getUsers(
  board: BoardType,
  gymId: number,
  token: string,
): Promise<{ user: User } | undefined> {
  const client = new APIClient(board);
  try {
    return await client.request<{ user: User }>({
      method: "GET",
      url: `/v2/users/${gymId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // Handle 404 gracefully by returning undefined
    if ((error as AxiosError).response?.status === 404) {
      return undefined;
    }
    throw error; // Let other errors be handled by the APIClient
  }
}
