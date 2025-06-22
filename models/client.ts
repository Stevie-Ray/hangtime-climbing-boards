import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import UserAgent from 'user-agents';
import type { BoardType } from "../boards.ts";
import { getCurrentUsage, waitForRateLimit } from "../api/rate-limiter.ts";

export class APIClient {
  private readonly board: BoardType;
  private readonly client: AxiosInstance;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor(board: BoardType) {
    this.board = board;
    const userAgent = new UserAgent({ deviceCategory: 'mobile' });
    
    this.client = axios.create({
      baseURL: `https://${board}.com`,
      timeout: 10000,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": userAgent.toString(),
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await waitForRateLimit(this.board);
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          const status = error.response.status;

          // Handle rate limit exceeded
          if (status === 429) {
            if (this.retryCount < this.maxRetries) {
              this.retryCount++;
              const delay = this.retryDelay * this.retryCount;
              await new Promise((resolve) => setTimeout(resolve, delay));
              return this.client.request(error.config);
            }
          }

          // Handle authentication errors
          if (status === 401 || status === 403) {
            console.error(
              `Authentication error for ${this.board}: ${error.response.data.message}`,
            );
            throw new Error(`Authentication failed for ${this.board}`);
          }
        }

        throw error;
      },
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const usage = getCurrentUsage(this.board);
      if (usage > 80) {
        console.warn(`High API usage (${usage.toFixed(1)}%) for ${this.board}`);
      }

      const response = await this.client.request<T>(config);
      this.retryCount = 0; // Reset retry count on successful request
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API request failed for ${this.board}: ${error.message}`);
      }
      throw error;
    }
  }
}
