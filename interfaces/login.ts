/**
 * Represents a login response from the Aurora Climbing API.
 */
export interface Login {
  /** Authentication token */
  token: string;
  /** User ID */
  user_id: number;
  /** Username */
  username: string;
  /** Login details */
  login: {
    /** Authentication token */
    token: string;
    /** User ID */
    user_id: number;
    /** Creation date */
    created_at: string;
  };
  /** User details */
  user: {
    /** User ID */
    id: number;
    /** Username */
    username: string;
    /** Email address */
    email_address: string;
    /** City */
    city: string | null;
    /** Country */
    country: string | null;
    /** Avatar image */
    avatar_image: string;
    /** Banner image */
    banner_image: string | null;
    /** Height */
    height: number | null;
    /** Wingspan */
    wingspan: number | null;
    /** Weight */
    weight: number | null;
    /** Public */
    is_public: boolean;
    /** Listed */
    is_listed: boolean;
    /** Creation date */
    created_at: string;
    /** Update date */
    updated_at: string;
  };
}
