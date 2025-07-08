/**
 * Represents a login response from the Aurora Climbing API.
 */
export interface Login {
  /** Session token */
  session: {
    token: string;
    user_id: number;
  };
}
