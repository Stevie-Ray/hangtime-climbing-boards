import type { KilterGym, KilterWall } from "./user.ts";

/**
 * Represents a public climbing gym object (pin) from the Aurora Climbing APIs.
 */
export interface AuroraPin {
  /** Unique identifier for the gym */
  id: number;
  /** Username associated with the gym */
  username: string;
  /** Display name of the gym */
  name: string;
  /** Latitude coordinate of the gym's location */
  latitude: number;
  /** Longitude coordinate of the gym's location */
  longitude: number;
}

/**
 * Represents a public Kilter board location in the scraped dataset.
 */
export interface KilterPin extends KilterGym {
  /** Walls installed at this gym */
  walls: KilterWall[];
}

/**
 * Represents a Moonboard marker from the Moonboard API.
 * This is the original format used by Moonboard.
 */
export interface MoonboardPin {
  /** Display name of the gym */
  Name: string;
  /** Description of the gym */
  Description: string;
  /** Image path for the gym */
  Image: string;
  /** Latitude coordinate of the gym's location */
  Latitude: number;
  /** Longitude coordinate of the gym's location */
  Longitude: number;
  /** Whether this is a commercial gym */
  IsCommercial: boolean;
  /** Whether this gym has LED lighting */
  IsLed: boolean;
  /** Latitude and longitude as an array */
  LatLng: [number, number];
}

/**
 * Represents a 12Climb marker from the Google My Maps Service.
 */
export interface TwelveClimbPin {
  /** Display name of the gym */
  name: string;
  /** Description of the gym */
  description: string;
  /** Latitude coordinate of the gym's location */
  latitude: number;
  /** Longitude coordinate of the gym's location */
  longitude: number;
}
