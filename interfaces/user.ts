/**
 * Represents a wall object from the private API of the Aurora Climbing.
 * A username and password is required to access this API.
 */
export interface Wall {
  /** UUID of the wall */
  uuid: string;
  /** Name of the wall */
  name: string;
  /** User ID associated with the wall */
  user_id: number;
  /** Product ID associated with the wall */
  product_id: number;
  /** Whether the wall is adjustable */
  is_adjustable: boolean;
  /** Angle of the wall */
  angle: number;
  /** Layout ID associated with the wall */
  layout_id: number;
  /** Product size ID associated with the wall */
  product_size_id: number;
  /** HSM of the wall */
  hsm: number;
  /** Serial number of the wall */
  serial_number: string;
  /** Whether the wall is listed */
  is_listed: boolean;
  /** Set IDs associated with the wall */
  set_ids: number[];
}

/**
 * Represents a gym object from the private API of the Aurora Climbing.
 * A username and password is required to access this API.
 */
export interface Gym {
  /** Unique identifier for the gym */
  user_id: number;
  /** Address line 1 of the gym */
  address1: string;
  /** City of the gym */
  city: string;
  /** Country of the gym */
  country: string;
  /** Postal code of the gym */
  postal_code: string;
  /** Email address of the gym */
  email_address: string;
  /** Homepage URL of the gym */
  homepage_url: string;
  /** Latitude of the gym */
  latitude: number;
  /** Longitude of the gym */
  longitude: number;
}

/**
 * Represents a user object from the private API of the Aurora Climbing.
 * A username and password is required to access this API.
 */
export interface User {
  /** Unique identifier for the user */
  id: number;
  /** Username associated with the user */
  username: string;
  /** Display name of the user */
  name: string;
  /** URL of the user's avatar image */
  avatar_image: string;
  /** Instagram username associated with the user */
  instagram_username: string;
  /** Whether the user's account is public */
  is_public: boolean;
  /** Whether the user's account is verified */
  is_verified: boolean;
  /** Date and time the user was created */
  created_at: string;
  /** Date and time the user was last updated */
  updated_at: string;
  /** State of the user's followee relationship */
  followee_state: string;
  /** Gym associated with the user */
  gym: Gym;
  /** Walls associated with the user */
  walls: Wall[];
  /** Social media statistics */
  social: { followees_accepted: number; followers_accepted: number };
  /** Circuits associated with the user */
  circuits: unknown[];
}
