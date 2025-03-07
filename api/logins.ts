import axios from "axios";
import type { BoardType } from "../boards.ts";
import type { Login } from "../interfaces/login.ts";

/**
 * Authenticates with the board app API and returns a token
 * @param {string} board - The name of the board app
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Login>} Authentication token
 */
export async function getLogins(
  board: BoardType,
  username: string,
  password: string,
): Promise<Login> {
  const url = `https://api.${board}.com/v1/logins`;
  try {
    const response = await axios.post<Login>(url, {
      username,
      password,
    });
    return response.data as Login;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Authentication failed for ${board}: ${error.message}`);
    }
    throw error;
  }
}
