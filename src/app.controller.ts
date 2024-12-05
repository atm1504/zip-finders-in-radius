import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service.js';
import { SpatialIndexService } from './spatial_index.service.js';
import { HaversineDistanceService } from './haversine.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly spatialService: SpatialIndexService,
    private readonly haversineDistanceService: HaversineDistanceService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('zipcodes/flatbush')
  async getZipCodesFlatbush(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    const zipCodes = this.spatialService.getZipCodesInRadius(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
    );
    return { zipCodes };
  }

  @Get('zipcodes/haversine')
  getZipCodesHaversine(
    @Query('lat') lat: string,
    @Query('lng') lon: string,
    @Query('radius') radius: string,
  ) {
    const zipCodes = this.haversineDistanceService.getZipCodesInRadius(
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(radius),
    );
    return { zipCodes };
  }
}
