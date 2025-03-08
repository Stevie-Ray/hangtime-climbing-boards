import type { BoardType } from "../boards.ts";
import type { Login } from "../interfaces/login.ts";
import { APIClient } from "../models/client.ts";

/**
 * Authenticates with the board app API and returns a token
 * @param {BoardType} board - The name of the board app
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Login>} Authentication token
 */
export function getLogins(
  board: BoardType,
  username: string,
  password: string,
): Promise<Login> {
  const client = new APIClient(board);
  return client.request<Login>({
    method: "POST",
    url: "/v1/logins",
    data: {
      username,
      password,
    },
  });
}
