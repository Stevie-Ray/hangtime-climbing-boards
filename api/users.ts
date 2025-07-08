import type { BoardType } from "../boards.ts";
import type { User } from "../interfaces/user.ts";
import { APIClient } from "../models/client.ts";
import type { AxiosError } from "axios";

/**
 * Fetches user details for a specific user
 * @param {BoardType} board - The name of the board app
 * @param {number} userId - The ID of the user
 * @param {string} token - Session token
 * @returns {Promise<{ users: User[] } | undefined>} User details or undefined if the user is not found
 */
export async function getUsers(
  board: BoardType,
  userId: number,
  token: string,
): Promise<{ users: User[] } | undefined> {
  const client = new APIClient(board);
  try {
    return await client.request<{ users: User[] }>({
      method: "GET",
      url: `/users/${userId}`,
      headers: {
        cookie: `token=${token}`,
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
