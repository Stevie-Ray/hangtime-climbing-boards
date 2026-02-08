import type { BoardType } from "../boards.ts";
import type { Login } from "../interfaces/login.ts";
import { AuroraClient } from "../models/aurora.client.ts";
import type { AxiosError } from "axios";

/**
 * Authenticates with the board app API and returns a session token
 * @param {BoardType} board - The name of the board app
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<string>} Session token
 */
export async function getLogins(
  board: BoardType,
  username: string,
  password: string,
): Promise<string> {
  const client = new AuroraClient(board);
  try {
    const response = await client.request<Login>({
      method: "POST",
      url: "/sessions",
      data: {
        username,
        password,
        tou: "accepted",
        pp: "accepted",
        ua: "app",
      },
    });
    // Return just the token string for use in authenticated requests
    return response.session.token;
  } catch (error: unknown) {
    if (
      (error as AxiosError).response &&
      (error as AxiosError).response!.status === 422
    ) {
      throw new Error(
        "Invalid username or password. Please check your credentials and try again.",
      );
    }
    throw error;
  }
}
