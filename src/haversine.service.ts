import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

@Injectable()
export class HaversineDistanceService implements OnModuleInit {
  private zipCodes: Array<{
    zip_code: string;
    geo_point_2d: { lat: number; lon: number };
  }> = [];

  async onModuleInit() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const filePath = join(__dirname, '..', 'data', 'zipcodes.json'); // Adjust path based on your directory structure
    console.log('Loading zipcodes data from:', filePath);

    try {
      const jsonData = readFileSync(filePath, 'utf8');
      this.zipCodes = JSON.parse(jsonData);
    } catch (error) {
      console.error('Error loading zipcodes data:', error);
    }
  }

  getZipCodesInRadius(
    lat: number,
    lon: number,
    radiusKm: number,
  ): Array<{
    zip_code: string;
    distance: number;
  }> {
    const results: Array<{ zip_code: string; distance: number }> = [];

    for (const entry of this.zipCodes) {
      const { lat: entryLat, lon: entryLon } = entry.geo_point_2d;

      // Calculate the distance using Haversine formula
      const distance = this.haversineDistance(lat, lon, entryLat, entryLon);

      if (distance <= radiusKm) {
        results.push({ zip_code: entry.zip_code, distance });
      }
    }

    // Return results sorted by distance
    return results.sort((a, b) => a.distance - b.distance);
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
