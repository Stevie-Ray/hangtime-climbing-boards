import os from "node:os";
import path from "node:path";
import {
  column,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
  PowerSyncDatabase,
  Schema,
  Table,
} from "@powersync/node";
import type { KilterPin } from "../interfaces/pin.ts";
import type { KilterGym, KilterWall } from "../interfaces/user.ts";

const KILTER_AUTH_URL =
  "https://idp.kiltergrips.com/realms/kilter/protocol/openid-connect/token";
const KILTER_SYNC_ENDPOINT = "https://sync1.kiltergrips.com";
const KILTER_CLIENT_ID = "kilter";
const KILTER_SCOPE = "openid offline_access";
const KILTER_SYNC_TIMEOUT_MS = 120_000;
const KILTER_DB_PATH = path.join(
  os.tmpdir(),
  "hangtime-kilterboard-powersync.db",
);

interface KilterTokenResponse {
  access_token: string;
  expires_in: number;
}

const KILTER_SCHEMA = new Schema({
  gyms: new Table({
    gym_uuid: column.text,
    name: column.text,
    address: column.text,
    city: column.text,
    country: column.text,
    countryCode: column.text,
    postal_code: column.text,
    latitude: column.real,
    longitude: column.real,
    gymLogo: column.text,
    bannerLogo: column.text,
    instagramUsername: column.text,
    isListed: column.integer,
  }),
  walls: new Table({
    wall_uuid: column.text,
    name: column.text,
    gym_uuid: column.text,
    product_name: column.text,
    product_layout_uuid: column.text,
    is_adjustable: column.integer,
    min_angle: column.real,
    max_angle: column.real,
    angle_increments: column.real,
    angle: column.real,
    serial_number: column.text,
    accumulated_hold_set_value: column.real,
    is_listed: column.integer,
    created_at: column.text,
  }),
});

async function getKilterAccessToken(
  username: string,
  password: string,
): Promise<PowerSyncCredentials> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: KILTER_CLIENT_ID,
    username,
    password,
    scope: KILTER_SCOPE,
  });

  const response = await fetch(KILTER_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Kilter access token: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json() as KilterTokenResponse;

  return {
    endpoint: KILTER_SYNC_ENDPOINT,
    token: data.access_token,
    expiresAt: new Date(
      Date.now() + Math.max(data.expires_in - 60, 1) * 1000,
    ),
  };
}

function createKilterConnector(
  username: string,
  password: string,
): PowerSyncBackendConnector {
  let credentials: PowerSyncCredentials | null = null;

  return {
    fetchCredentials: async () => {
      if (
        credentials?.expiresAt &&
        credentials.expiresAt.getTime() > Date.now() + 30_000
      ) {
        return credentials;
      }

      credentials = await getKilterAccessToken(username, password);
      return credentials;
    },
    uploadData: async () => {
      // This scraper is read-only.
    },
  };
}

function mapWallsByGym(
  walls: KilterWall[],
): Map<string, KilterWall[]> {
  const wallsByGym = new Map<string, KilterWall[]>();

  for (const wall of walls) {
    if (!wall.gym_uuid) {
      continue;
    }

    const existingWalls = wallsByGym.get(wall.gym_uuid) ?? [];
    existingWalls.push(wall);
    wallsByGym.set(wall.gym_uuid, existingWalls);
  }

  return wallsByGym;
}

/**
 * Downloads Kilter gym and wall data from the app's PowerSync backend.
 */
export async function getKilterPins(
  username: string,
  password: string,
): Promise<{ gyms: KilterPin[] }> {
  const db = new PowerSyncDatabase({
    schema: KILTER_SCHEMA,
    database: {
      dbFilename: KILTER_DB_PATH,
      implementation: {
        type: "node:sqlite",
      },
    },
  });

  try {
    await db.connect(createKilterConnector(username, password));
    await db.waitForFirstSync({
      signal: AbortSignal.timeout(KILTER_SYNC_TIMEOUT_MS),
    });

    const gyms = await db.getAll<KilterGym>(
      `SELECT
        id,
        gym_uuid,
        name,
        address,
        city,
        country,
        countryCode,
        postal_code,
        latitude,
        longitude,
        gymLogo AS gym_logo,
        bannerLogo AS banner_logo,
        instagramUsername AS instagram_username,
        isListed AS is_listed
      FROM gyms
      ORDER BY name, id`,
    );

    const walls = await db.getAll<KilterWall>(
      `SELECT
        id,
        wall_uuid,
        gym_uuid,
        name,
        product_name,
        product_layout_uuid,
        is_adjustable,
        min_angle,
        max_angle,
        angle_increments,
        angle,
        serial_number,
        accumulated_hold_set_value,
        is_listed,
        created_at
      FROM walls
      ORDER BY gym_uuid, product_name, wall_uuid, id`,
    );

    const wallsByGym = mapWallsByGym(walls);
    const pins: KilterPin[] = [];

    for (const gym of gyms) {
      pins.push({
        ...gym,
        walls: wallsByGym.get(gym.gym_uuid) ?? [],
      });
    }

    return {
      gyms: pins,
    };
  } finally {
    await db.close();
  }
}
