# Climbing Board Locations

A comprehensive GeoJSON dataset tracking the global locations of various
climbing training boards, including Kilter, Tension, Grasshopper, Decoy, So iLL,
Touchstone, Aurora and Moon -boards. This dataset is automatically updated daily
through GitHub Actions.

[View on GeoJSON.io](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/combined.geojson)

## Overview

This repository contains location data for climbing training boards worldwide,
presented in GeoJSON format for easy visualization and mapping. The data is
scraped daily from official sources to ensure accuracy and completeness.

## Data Sources

The repository collects data from multiple climbing board applications:

- [Moon Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/moonboard.geojson)
- [Kilter Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/kilterboardapp.geojson)
- [Tension Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/tensionboardapp2.geojson)
- [Grasshopper Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/grasshopperboardapp.geojson)
- [Decoy Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/decoyboardapp.geojson)
- [So iLL Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/soillboardapp.geojson)
- [Touchstone Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/touchstoneboardapp.geojson)
- [Aurora Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-climbing-boards/blob/main/geojson/auroraboardapp.geojson)

## Data Structure

The `/data` directory contains:

- Raw JSON location data from each source
- Scraped data from various Aurora Climbing API endpoints

The `/geojson` directory contains:

- Individual GeoJSON files for each climbing board type
- A combined GeoJSON file with all locations

The `/api` directory contains:

- API client implementations for each climbing board service
- Authentication and data fetching logic

The `/interfaces` directory contains:

- TypeScript type definitions and interfaces
- Data model specifications for the application

The `/models` directory contains:

- Client models for API interactions and data handling
- Data transformation and validation models

## Automation

This repository uses GitHub Actions to:

- Scrape the latest location data daily
- Convert the data to GeoJSON format
- Combine all sources into a single GeoJSON file
- Automatically commit and push updates

## Development

### Prerequisites

- Node.js 22 / Deno / Bun

### Available Scripts

```bash
# Install dependencies
npm ci

# Scrape data from Aurora API
npm run scrape

# Convert scraped data to GeoJSON
npm run convert

# Combine all GeoJSON files
npm run combine

# Run the complete build process
npm run build

# Watch for TypeScript changes during development
npm run dev
```

### Authentication

To get detailed information such as the gym's address, board angle, or
rotatability status, you need to provide your credentials through environment
variables. Each climbing board app (Kilter, Tension, etc.) requires its own set
of login credentials. The scraper will only fetch additional details for the
specific apps where you provide valid login details.

**Important Legal Notice**: Before using this scraper with credentials, you
must:

1. Have a valid account and have explicitly accepted the Terms of Use for each
   platform.
2. Ensure your use of this tool complies with the platform's terms of service
3. Be aware that this tool makes authenticated API requests to these services

**Setup Instructions**:

1. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

2. Fill in your credentials in the `.env` file:

```bash
# Aurora Climbing Boards (Kilter, Tension, etc.)
KILTERBOARDAPP_USERNAME=your_username
KILTERBOARDAPP_PASSWORD=your_password

TENSIONBOARDAPP_USERNAME=your_username
TENSIONBOARDAPP_PASSWORD=your_password

# Moonboard (requires authentication for location data)
MOONBOARD_USERNAME=your_username
MOONBOARD_PASSWORD=your_password

# Add credentials for other boards as needed
```

**API Usage Safeguards**: The scraper includes built-in protections:

- Rate limiting (30 requests per minute per board)
- Automatic request throttling
- Retry mechanism with exponential backoff for rate limit errors
- High usage warnings (triggers at 80% of rate limit)
- Error handling for authentication and API issues

**Note**: While the scraper implements rate limiting and other safeguards, you
are still responsible for ensuring your usage complies with each service's terms
of use.

## Credits

Forked from
[Georift/climbing-board-locations](https://github.com/Georift/climbing-board-locations)

## License

Unlicense
