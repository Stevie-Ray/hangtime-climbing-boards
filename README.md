# Aurora Climbing Board Locations

A comprehensive GeoJSON dataset tracking the global locations of various climbing training boards, including Aurora, Kilter, Tension, Grasshopper, Decoy, Soill, and Touchstone boards. This dataset is automatically updated daily through GitHub Actions.

[View on GeoJSON.io](https://geojson.io/#id=github:Stevie-Ray/hangtime-aurora-climbing-boards/blob/main/data/combined-boards.geojson)

## Overview

This repository contains location data for climbing training boards worldwide, presented in GeoJSON format for easy visualization and mapping. The data is scraped daily from official sources to ensure accuracy and completeness.

## Data Sources

The repository collects data from multiple climbing board applications:
- Aurora Board
- Kilter Board
- Tension Board
- Grasshopper Board
- Decoy Board
- Soill Board
- Touchstone Board

## Data Structure

The `/data` directory contains:
- Individual GeoJSON files for each climbing board type
- A combined GeoJSON file with all locations
- Raw JSON location data from each source

## Automation

This repository uses GitHub Actions to:
- Scrape the latest location data daily
- Convert the data to GeoJSON format
- Combine all sources into a single GeoJSON file
- Automatically commit and push updates

## Development

To work with this repository locally:

```bash
# Install dependencies
npm ci

# Convert scraped data to GeoJSON
npm run convert

# Combine all GeoJSON files
npm run combine
```

## Credits

Forked from [Georift/climbing-board-locations](https://github.com/Georift/climbing-board-locations)

## License

UNLICENSED