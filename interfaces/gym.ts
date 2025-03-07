/**
 * Represents a climbing gym object from the Aurora Climbing API.
 * Database can be extracted with: {@link https://github.com/lemeryfertitta/BoardLib}
 */
export interface Gym {
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
