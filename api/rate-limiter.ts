import type { BoardType } from "../boards.ts";

// Rate limits per board type (requests per minute)
const RATE_LIMITS: Record<BoardType, number> = {
  kilterboardapp: 30, // 1 request per 2 seconds
  tensionboardapp2: 30, // 1 request per 2 seconds
  grasshopperboardapp: 30,
  decoyboardapp: 30,
  soillboardapp: 30,
  touchstoneboardapp: 30,
  auroraboardapp: 30,
};

// Track request timestamps per board
const requestTimestamps: Record<BoardType, number[]> = {
  kilterboardapp: [],
  tensionboardapp2: [],
  grasshopperboardapp: [],
  decoyboardapp: [],
  soillboardapp: [],
  touchstoneboardapp: [],
  auroraboardapp: [],
};

// Clean up old timestamps (older than 1 minute)
function cleanupTimestamps(board: BoardType): void {
  const now = Date.now();
  requestTimestamps[board] = requestTimestamps[board].filter(
    (timestamp) => now - timestamp < 60000,
  );
}

// Check if we can make a request
function canMakeRequest(board: BoardType): boolean {
  cleanupTimestamps(board);
  return requestTimestamps[board].length < RATE_LIMITS[board];
}

// Add a timestamp for a new request
function addRequest(board: BoardType): void {
  requestTimestamps[board].push(Date.now());
}

// Wait until we can make a request
export async function waitForRateLimit(board: BoardType): Promise<void> {
  while (!canMakeRequest(board)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    cleanupTimestamps(board);
  }
  addRequest(board);
}

// Get current usage percentage
export function getCurrentUsage(board: BoardType): number {
  cleanupTimestamps(board);
  return (requestTimestamps[board].length / RATE_LIMITS[board]) * 100;
}

// Reset rate limiter for a board
export function resetRateLimiter(board: BoardType): void {
  requestTimestamps[board] = [];
}
