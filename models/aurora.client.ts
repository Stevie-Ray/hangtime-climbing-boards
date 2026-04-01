import UserAgent from "user-agents";
import type { BoardType } from "../boards.ts";
import { getCurrentUsage, waitForRateLimit } from "../api/rate-limiter.ts";

export interface AuroraRequestConfig {
  method?: string;
  url: string;
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | null | undefined>;
  data?: unknown;
}

export class AuroraClient {
  private readonly board: BoardType;
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor(board: BoardType) {
    this.board = board;
    const userAgent = new UserAgent({ deviceCategory: "mobile" });

    this.baseUrl = `https://${board}.com`;
    this.defaultHeaders = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent.toString(),
    };
  }

  private buildUrl(
    url: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): string {
    const requestUrl = new URL(url, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          requestUrl.searchParams.set(key, String(value));
        }
      }
    }

    return requestUrl.toString();
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return undefined;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();
    return text.length > 0 ? text : undefined;
  }

  private async executeRequest<T>(
    config: AuroraRequestConfig,
    attempt = 0,
  ): Promise<T> {
    await waitForRateLimit(this.board);

    const headers = new Headers(this.defaultHeaders);
    if (config.headers) {
      new Headers(config.headers).forEach((value, key) =>
        headers.set(key, value)
      );
    }

    const requestInit: RequestInit = {
      method: config.method ?? "GET",
      headers,
      signal: AbortSignal.timeout(10_000),
    };

    if (config.data !== undefined) {
      requestInit.body = JSON.stringify(config.data);
    }

    const response = await fetch(
      this.buildUrl(config.url, config.params),
      requestInit,
    );

    const responseBody = await this.parseResponseBody(response);

    if (response.status === 429 && attempt < this.maxRetries) {
      this.retryCount = attempt + 1;
      const delay = this.retryDelay * this.retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await this.executeRequest<T>(config, attempt + 1);
    }

    if (response.status === 401 || response.status === 403) {
      const message = typeof responseBody === "object" &&
          responseBody !== null &&
          "message" in responseBody &&
          typeof responseBody.message === "string"
        ? responseBody.message
        : `Authentication failed for ${this.board}`;

      console.error(`Authentication error for ${this.board}: ${message}`);
      throw new Error(`Authentication failed for ${this.board}`, {
        cause: {
          status: response.status,
          body: responseBody,
        },
      });
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`, {
        cause: {
          status: response.status,
          body: responseBody,
        },
      });
    }

    return responseBody as T;
  }

  async request<T>(config: AuroraRequestConfig): Promise<T> {
    try {
      const usage = getCurrentUsage(this.board);
      if (usage > 80) {
        console.warn(`High API usage (${usage.toFixed(1)}%) for ${this.board}`);
      }

      const response = await this.executeRequest<T>(config);
      this.retryCount = 0; // Reset retry count on successful request
      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API request failed for ${this.board}: ${error.message}`);
      }
      throw error;
    }
  }
}
