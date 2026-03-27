import os from "node:os";
import path from "node:path";
import axios from "axios";
import {
  column,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
  PowerSyncDatabase,
  Schema,
  Table,
} from "@powersync/node";
import type { AuroraPin } from "../interfaces/pin.ts";

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

interface KilterGymRow {
  id: string;
  gym_uuid: string;
  name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  instagramUsername: string | null;
  isListed: number | null;
}

interface KilterWallRow {
  wall_uuid: string;
  name: string | null;
  gym_uuid: string | null;
  product_name: string | null;
  is_adjustable: number | null;
  min_angle: number | null;
  max_angle: number | null;
  angle: number | null;
  serial_number: string | null;
  is_listed: number | null;
}

interface KilterWallSummary {
  wall_uuid: string;
  name: string;
  product_name: string;
  is_adjustable: boolean | null;
  min_angle: number | null;
  max_angle: number | null;
  angle: number | null;
  serial_number: string | null;
  is_listed: boolean | null;
}

type KilterPin = AuroraPin & {
  gym_uuid: string;
  address: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  postal_code: string | null;
  is_listed: boolean | null;
  walls: KilterWallSummary[];
};

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
    instagramUsername: column.text,
    isListed: column.integer,
  }),
  walls: new Table({
    wall_uuid: column.text,
    name: column.text,
    gym_uuid: column.text,
    product_name: column.text,
    is_adjustable: column.integer,
    min_angle: column.real,
    max_angle: column.real,
    angle: column.real,
    serial_number: column.text,
    is_listed: column.integer,
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

  const { data } = await axios.post<KilterTokenResponse>(
    KILTER_AUTH_URL,
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10_000,
    },
  );

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
  walls: KilterWallRow[],
): Map<string, KilterWallSummary[]> {
  const wallsByGym = new Map<string, KilterWallSummary[]>();

  for (const wall of walls) {
    if (!wall.gym_uuid) {
      continue;
    }

    const summary: KilterWallSummary = {
      wall_uuid: wall.wall_uuid,
      name: wall.name ?? "Kilter Board",
      product_name: wall.product_name ?? "Kilter Board",
      is_adjustable: wall.is_adjustable === 1
        ? true
        : wall.is_adjustable === 0
        ? false
        : null,
      min_angle: wall.min_angle,
      max_angle: wall.max_angle,
      angle: wall.angle,
      serial_number: wall.serial_number,
      is_listed: wall.is_listed === 1
        ? true
        : wall.is_listed === 0
        ? false
        : null,
    };

    const existingWalls = wallsByGym.get(wall.gym_uuid) ?? [];
    existingWalls.push(summary);
    wallsByGym.set(wall.gym_uuid, existingWalls);
  }

  for (const wallList of wallsByGym.values()) {
    wallList.sort((a, b) => a.product_name.localeCompare(b.product_name));
  }

  return wallsByGym;
}

function mapGymsToPins(
  gyms: KilterGymRow[],
  wallsByGym: Map<string, KilterWallSummary[]>,
): KilterPin[] {
  return gyms
    .filter((gym) =>
      gym.name &&
      typeof gym.latitude === "number" &&
      typeof gym.longitude === "number"
    )
    .map((gym) => ({
      id: gym.id,
      username: gym.instagramUsername ?? "",
      name: gym.name as string,
      latitude: gym.latitude as number,
      longitude: gym.longitude as number,
      gym_uuid: gym.gym_uuid,
      address: gym.address,
      city: gym.city,
      country: gym.country,
      countryCode: gym.countryCode,
      postal_code: gym.postal_code,
      is_listed: gym.isListed === 1 ? true : gym.isListed === 0 ? false : null,
      walls: wallsByGym.get(gym.gym_uuid) ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Downloads Kilter gym and wall data from the app's PowerSync backend.
 * The Kilter app no longer exposes the old Aurora `/pins` endpoint.
 */
export async function getKilterPins(
  username: string,
  password: string,
): Promise<{ gyms: AuroraPin[] }> {
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

    const gyms = await db.getAll<KilterGymRow>(
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
        instagramUsername,
        isListed
      FROM gyms`,
    );

    const walls = await db.getAll<KilterWallRow>(
      `SELECT
        wall_uuid,
        name,
        gym_uuid,
        product_name,
        is_adjustable,
        min_angle,
        max_angle,
        angle,
        serial_number,
        is_listed
      FROM walls`,
    );

    return {
      gyms: mapGymsToPins(gyms, mapWallsByGym(walls)),
    };
  } finally {
    await db.close();
  }
}
