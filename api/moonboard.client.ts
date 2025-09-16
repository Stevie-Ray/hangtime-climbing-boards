import type { MoonboardPin } from "../interfaces/pin.ts";
import { MoonboardClient } from "../models/moonboard.client.ts";

/**
 * Downloads gym data for Moonboard from its API using the get_map_markers endpoint.
 * This is based on the BoardLib Python implementation's get_map_markers function.
 * Requires authentication credentials.
 * @param {string} username - Moonboard username
 * @param {string} password - Moonboard password
 * @returns {Promise<{ gyms: MoonboardPin[] }>} Gym data
 * @throws {Error} If the API request fails
 */
export async function getMoonboardPins(
  username?: string,
  password?: string,
): Promise<{ gyms: MoonboardPin[] }> {
  const client = new MoonboardClient();

  try {
    // Check if credentials are provided
    if (!username || !password) {
      return { gyms: [] };
    }

    // Authenticate with Moonboard
    await client.authenticate(username, password);

    // Use the get_map_markers endpoint to fetch Moonboard locations
    const locations = await client.getMapMarkers();

    if (locations.gyms.length > 0) {
      return locations;
    } else {
      return { gyms: [] };
    }
  } catch (error) {
    console.error("Failed to fetch Moonboard pins:", error);
    // Return empty result instead of throwing to allow the scraper to continue
    return { gyms: [] };
  }
}
