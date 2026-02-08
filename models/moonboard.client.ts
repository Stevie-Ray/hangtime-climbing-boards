import UserAgent from "user-agents";
import type { MoonboardPin } from "../interfaces/pin.ts";

/**
 * Moonboard-specific API client for handling Moonboard API interactions.
 * Based on the BoardLib Python implementation's get_map_markers function.
 * Uses Deno's built-in fetch instead of axios to avoid environment variable issues.
 * Requires authentication for the get_map_markers endpoint.
 */
export class MoonboardClient {
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second
  private readonly host = "https://moonboard.com";
  private isAuthenticated: boolean = false;
  private sessionCookies: string[] = [];

  constructor() {
    // No initialization needed for fetch-based client
  }

  /**
   * Get Set-Cookie value(s) from a Response. Uses getSetCookie() when available to capture all headers.
   */
  private getSetCookieValues(headers: Headers): string | string[] | null {
    const h = headers as Headers & { getSetCookie?: () => string[] };
    if (typeof h.getSetCookie === "function") {
      const all = h.getSetCookie();
      return all.length > 0 ? all : null;
    }
    return headers.get("set-cookie");
  }

  /**
   * Parse and store cookies from Set-Cookie header(s).
   * Accepts a single header string (comma-separated) or array from headers.getSetCookie().
   */
  private parseCookies(setCookieHeader: string | string[] | null): void {
    if (!setCookieHeader) return;

    const cookieStrings = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader.split(/,(?=\s*\w+\s*=)/);

    cookieStrings.forEach((cookieString) => {
      const trimmed = cookieString.trim();
      if (trimmed) {
        // Extract just the name=value part (before the first semicolon)
        const nameValue = trimmed.split(";")[0]?.trim();
        if (nameValue && nameValue.includes("=")) {
          const [name, ...valueParts] = nameValue.split("=");
          const value = valueParts.join("="); // Handle values that contain '='
          if (name && value) {
            const cookieName = name.trim();
            const cookieValue = value.trim();

            // Remove any existing cookie with the same name
            this.sessionCookies = this.sessionCookies.filter((cookie) =>
              !cookie.startsWith(`${cookieName}=`)
            );

            // Add the new cookie
            this.sessionCookies.push(`${cookieName}=${cookieValue}`);
          }
        }
      }
    });
  }

  /**
   * Get all cookies as a cookie string
   */
  private getCookieString(): string {
    return this.sessionCookies.join("; ");
  }

  /**
   * Authenticates with Moonboard using username and password.
   * Based on the BoardLib Python implementation's get_session function.
   * @param {string} username - Moonboard username
   * @param {string} password - Moonboard password
   */
  async authenticate(username: string, password: string): Promise<void> {
    try {
      // Step 1: Get the login page to extract CSRF tokens
      const loginPageResponse = await fetch(`${this.host}/account/login`, {
        credentials: "include",
      });

      if (loginPageResponse.status !== 200) {
        throw new Error(`Login page failed: ${loginPageResponse.status}`);
      }

      const loginPageText = await loginPageResponse.text();

      // Parse and store cookies from the login page response (getSetCookie() returns all headers)
      this.parseCookies(this.getSetCookieValues(loginPageResponse.headers));

      // Step 2: Extract CSRF tokens from the login form
      const formMatch = loginPageText.match(
        /<form[^>]*id="frmLogin"[^>]*>([\s\S]*?)<\/form>/,
      );
      if (!formMatch) {
        throw new Error("Could not find login form with id='frmLogin'");
      }

      const formContent = formMatch[1];
      const verificationTokenMatch = formContent?.match(
        /<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/,
      );
      const formKeyMatch = formContent?.match(
        /<input[^>]*name="form_key"[^>]*value="([^"]*)"[^>]*>/,
      );

      if (!verificationTokenMatch || !formKeyMatch) {
        throw new Error("Could not extract CSRF tokens from login form");
      }

      const verificationToken = verificationTokenMatch[1];
      const formKey = formKeyMatch[1];

      // Step 3: Perform login
      const loginHeaders: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": `${this.host}/account/login`,
      };

      const cookieString = this.getCookieString();
      if (cookieString) {
        loginHeaders["Cookie"] = cookieString;
      }

      const loginResponse = await fetch(`${this.host}/Account/login`, {
        method: "POST",
        headers: loginHeaders,
        body: new URLSearchParams({
          "Login.Username": username,
          "Login.Password": password,
          "__RequestVerificationToken": verificationToken || "",
          "form_key": formKey || "",
        }),
        redirect: "manual", // Handle redirects manually to capture cookies
        credentials: "include",
      });

      // Parse cookies from login response
      this.parseCookies(this.getSetCookieValues(loginResponse.headers));

      // Handle redirect manually to capture cookies
      if (loginResponse.status >= 300 && loginResponse.status < 400) {
        const redirectLocation = loginResponse.headers.get("location");
        if (redirectLocation) {
          // Handle relative URLs
          const redirectUrl = redirectLocation.startsWith("/")
            ? `${this.host}${redirectLocation}`
            : redirectLocation;

          const redirectResponse = await fetch(redirectUrl, {
            method: "GET",
            headers: {
              "Cookie": this.getCookieString(),
            },
            credentials: "include",
          });

          // Parse cookies from redirect response
          this.parseCookies(this.getSetCookieValues(redirectResponse.headers));

          // Check if redirect was successful
          if (!redirectResponse.ok) {
            throw new Error(
              `Redirect failed: ${redirectResponse.status} ${redirectResponse.statusText}`,
            );
          }
        }
      } else {
        // Check if login was successful
        const loginResponseText = await loginResponse.text();

        // Check for error messages in the response
        const errorSelectors = [
          ".validation-summary-errors",
          ".field-validation-error",
          ".text-danger",
          ".alert-danger",
        ];
        for (const selector of errorSelectors) {
          const regex = new RegExp(
            `<[^>]*class="[^"]*${
              selector.replace(".", "")
            }[^"]*"[^>]*>([^<]*)</[^>]*>`,
            "gi",
          );
          const matches = loginResponseText.match(regex);
          if (matches) {
            for (const match of matches) {
              const errorText = match.replace(/<[^>]*>/g, "").trim();
              if (
                errorText && errorText.toLowerCase().includes("username") &&
                errorText.toLowerCase().includes("password")
              ) {
                throw new Error(`Login failed: ${errorText}`);
              }
            }
          }
        }

        // Check for invalid token error
        if (loginResponse.url.includes("/Error/InvalidToken")) {
          throw new Error("Invalid CSRF token - authentication failed");
        }
      }

      this.isAuthenticated = true;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Moonboard authentication failed: ${errorMessage}`);
    }
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      if (!this.isAuthenticated) {
        throw new Error("Authentication required. Call authenticate() first.");
      }

      const userAgent = new UserAgent({ deviceCategory: "mobile" });

      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": userAgent.toString(),
        ...(options.headers as Record<string, string> || {}),
      };

      // Add all session cookies
      const cookieString = this.getCookieString();
      if (cookieString) {
        headers["Cookie"] = cookieString;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      // Check for 401 in x-responded-json header (ASP.NET MVC pattern)
      const respondedJson = response.headers.get("x-responded-json");
      if (respondedJson) {
        try {
          const jsonResponse = JSON.parse(respondedJson);
          if (jsonResponse.status === 401) {
            throw new Error(`Authentication failed: ${jsonResponse.status}`);
          }
        } catch (e) {
          throw new Error(`Failed to parse JSON response: ${e}`);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();

      // Handle empty response - might be valid for some endpoints
      if (!text.trim()) {
        // For GetMapMarkers, an empty response might mean no markers available
        if (url.includes("GetMapMarkers")) {
          return [] as T;
        }
        throw new Error("Empty response body");
      }

      this.retryCount = 0; // Reset retry count on successful request
      return JSON.parse(text);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetches raw Moonboard markers using the get_map_markers endpoint.
   * This is the direct equivalent of the Python get_map_markers function.
   * Requires authentication to be called first.
   * @returns {Promise<MoonboardPin[]>} Raw marker data from Moonboard API
   */
  async getMapMarkersRaw(): Promise<MoonboardPin[]> {
    try {
      // Make the API request exactly like the Python version
      const response = await this.request<MoonboardPin[]>(
        `${this.host}/MoonBoard/GetMapMarkers`,
        {
          method: "GET",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Failed to fetch Moonboard map markers: ${errorMessage}`);
    }
  }

  /**
   * Fetches Moonboard locations using the get_map_markers endpoint.
   * This is based on the BoardLib Python implementation.
   * Requires authentication to be called first.
   * @returns {Promise<{ gyms: MoonboardPin[] }>} Raw gym data from Moonboard API
   */
  async getMapMarkers(): Promise<{ gyms: MoonboardPin[] }> {
    try {
      const response = await this.getMapMarkersRaw();

      return { gyms: response };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      throw new Error(`Failed to fetch Moonboard map markers: ${errorMessage}`);
    }
  }
}
