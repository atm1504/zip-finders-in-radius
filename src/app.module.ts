import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SpatialIndexService } from './spatial_index.service.js';
import { HaversineDistanceService } from './haversine.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SpatialIndexService, HaversineDistanceService],
})
export class AppModule {}
