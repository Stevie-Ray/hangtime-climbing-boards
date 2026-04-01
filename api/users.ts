import type { BoardType } from "../boards.ts";
import type { AuroraUser } from "../interfaces/user.ts";
import { AuroraClient } from "../models/aurora.client.ts";

/**
 * Fetches user details for a specific user
 * @param {BoardType} board - The name of the board app
 * @param {number} userId - The ID of the user
 * @param {string} token - Session token
 * @returns {Promise<{ users: AuroraUser[] } | undefined>} User details or undefined if the user is not found
 */
export async function getUsers(
  board: BoardType,
  userId: number,
  token: string,
): Promise<{ users: AuroraUser[] } | undefined> {
  const client = new AuroraClient(board);
  try {
    return await client.request<{ users: AuroraUser[] }>({
      method: "GET",
      url: `/users/${userId}`,
      headers: {
        cookie: `token=${token}`,
      },
    });
  } catch (error) {
    // Handle 404 gracefully by returning undefined
    if (
      error instanceof Error &&
      typeof error.cause === "object" &&
      error.cause !== null &&
      "status" in error.cause &&
      error.cause.status === 404
    ) {
      return undefined;
    }
    throw error; // Let other errors be handled by the AuroraClient
  }
}
