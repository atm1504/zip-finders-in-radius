import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

@Injectable()
export class SpatialIndexService implements OnModuleInit {
  private zipCodes: Array<{
    zip_code: string;
    geo_point_2d: { lat: number; lon: number };
  }> = [];
  private index: any;

  async onModuleInit() {
    // Load JSON file
    // Derive the __dirname equivalent for ES Modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const filePath = join(__dirname, '..', 'data', 'zipcodes.json');
    this.zipCodes = JSON.parse(readFileSync(filePath, 'utf8'));

    // Dynamically import Flatbush (ESM)
    const { default: Flatbush } = await import('flatbush');

    // Initialize Flatbush index
    this.index = new Flatbush(this.zipCodes.length);

    this.zipCodes.forEach((entry) => {
      const { lon, lat } = entry.geo_point_2d;
      // Insert bounding boxes (using a small buffer to simulate points)
      this.index.add(lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01);
    });

    this.index.finish();
  }

  getZipCodesInRadius(lat: number, lon: number, radiusKm: number): string[] {
    console.log('You are called');
    const radius = radiusKm / 111.32; // Approx conversion: 1° latitude ≈ 111.32 km
    const matchingIndices = this.index.search(
      lon - radius,
      lat - radius,
      lon + radius,
      lat + radius,
    );

    console.log('Hi i am here', lat, lon, radius);

    console.log('matching indexes: ', matchingIndices);

    // Filter results further by precise distance
    return matchingIndices
      .filter((i) => {
        const entry = this.zipCodes[i];
        const distance = this.haversineDistance(
          lat,
          lon,
          entry.geo_point_2d.lat,
          entry.geo_point_2d.lon,
        );
        return distance <= radiusKm;
      })
      .map((i) => this.zipCodes[i].zip_code);
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in kilometers
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
