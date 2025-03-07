import axios from "axios";
import type { BoardType } from "../boards.ts";
import type { User } from "../interfaces/user.ts";

/**
 * Fetches user details for a specific gym
 * @param {BoardType} board - The name of the board app
 * @param {number} gymId - The ID of the gym
 * @param {string} token - Authentication token
 * @returns {Promise<User | undefined>} User details or undefined if the gym is not found
 */
export async function getUsers(
  board: BoardType,
  gymId: number,
  token: string,
): Promise<{ user: User } | undefined> {
  const url = `https://api.${board}.com/v2/users/${gymId}`;
  try {
    const response = await axios.get(url, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.data as { user: User };
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Failed to fetch wall details for gym ${gymId}: ${error.message}`,
      );
    }
  }
}
