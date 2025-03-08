# Aurora Climbing Board Locations

A comprehensive GeoJSON dataset tracking the global locations of various
climbing training boards, including Kilter, Tension, Grasshopper, Decoy, So iLL,
Touchstone, and Aurora boards. This dataset is automatically updated daily
through GitHub Actions.

[View on GeoJSON.io](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/combined.geojson)

## Overview

This repository contains location data for climbing training boards worldwide,
presented in GeoJSON format for easy visualization and mapping. The data is
scraped daily from official sources to ensure accuracy and completeness.

## Data Sources

The repository collects data from multiple climbing board applications:

- [Kilter Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/kilterboardapp.geojson)
- [Tension Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/tensionboardapp2.geojson)
- [Grasshopper Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/grasshopperboardapp.geojson)
- [Decoy Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/decoyboardapp.geojson)
- [So iLL Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/soillboardapp.geojson)
- [Touchstone Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/touchstoneboardapp.geojson)
- [Aurora Board](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/geojson/auroraboardapp.geojson)

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

To get detailed wall information, you can provide your credentials when running
the scrape command. Each climbing board app (Kilter, Tension, etc.) requires its
own set of login credentials. The scraper will only fetch additional details for
the specific apps where you provide valid login details.

Example with authentication:

```bash
npm run scrape -- --username="APP_USERNAME" --password="APP_PASSWORD"
```

## Credits

Forked from
[Georift/climbing-board-locations](https://github.com/Georift/climbing-board-locations)

## License

Unlicense
