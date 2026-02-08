import type { TwelveClimbPin } from "../interfaces/pin.ts";
import { TwelveClimbClient } from "../models/12climb.client.ts";

/**
 * Downloads gym data for 12Climb from Google Maps KML.
 * @returns {Promise<{ gyms: TwelveClimbPin[] }>} Gym data
 * @throws {Error} If the KML request fails
 */
export async function getTwelveClimbPins(): Promise<
  { gyms: TwelveClimbPin[] }
> {
  const client = new TwelveClimbClient();
  return await client.getPins();
}
