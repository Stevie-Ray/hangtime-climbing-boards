import axios from "axios";
import type { AxiosInstance } from "axios";
import UserAgent from "user-agents";
import type { TwelveClimbPin } from "../interfaces/pin.ts";

export class TwelveClimbClient {
  private readonly client: AxiosInstance;

  constructor() {
    const userAgent = new UserAgent({ deviceCategory: "mobile" });

    this.client = axios.create({
      timeout: 30000,
      headers: {
        "User-Agent": userAgent.toString(),
        "Accept": "application/xml, text/xml, */*",
      },
    });
  }

  /**
   * Cleans HTML tags from description text while preserving content
   */
  private cleanHtmlFromDescription(description: string): string {
    return description
      .replace(/<img[^>]*>/gi, "") // Remove img tags
      .replace(/<br\s*\/?>/gi, " ") // Replace br tags with spaces
      .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
  }

  /**
   * Downloads KML data from Google Maps and converts it to 12Climb pin format
   */
  async getPins(): Promise<{ gyms: TwelveClimbPin[] }> {
    try {
      const url =
        "https://www.google.com/maps/d/kml?mid=193vm5XWh8uVnqQS71aVd130TNV2JkDnA&forcekml=1";

      const response = await this.client.get(url, {
        responseType: "text",
      });

      const kmlData = response.data;
      const pins = this.parseKMLToPins(kmlData);

      return { gyms: pins };
    } catch (error) {
      console.error("Failed to fetch 12Climb pins:", error);
      throw error;
    }
  }

  /**
   * Parses KML XML data and extracts pin information
   */
  private parseKMLToPins(kmlData: string): TwelveClimbPin[] {
    const pins: TwelveClimbPin[] = [];

    // Simple regex-based parsing for KML data
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let match;

    while ((match = placemarkRegex.exec(kmlData)) !== null) {
      const placemarkContent = match[1];

      if (!placemarkContent) continue;

      // Extract name
      const nameMatch = placemarkContent.match(
        /<name><!\[CDATA\[(.*?)\]\]><\/name>/,
      );
      const name = nameMatch?.[1]?.trim() || "";

      // Extract description
      const descMatch = placemarkContent.match(
        /<description><!\[CDATA\[(.*?)\]\]><\/description>/,
      );
      const description = descMatch?.[1]?.trim() || "";

      // Extract coordinates
      const coordMatch = placemarkContent.match(
        /<coordinates>\s*([0-9.-]+),([0-9.-]+),0\s*<\/coordinates>/,
      );

      if (coordMatch && coordMatch[1] && coordMatch[2]) {
        const longitude = parseFloat(coordMatch[1]);
        const latitude = parseFloat(coordMatch[2]);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const pin: TwelveClimbPin = {
            name: name,
            description: this.cleanHtmlFromDescription(description),
            latitude: latitude,
            longitude: longitude,
          };

          pins.push(pin);
        }
      }
    }

    return pins;
  }
}
