import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Using `async` function to bootstrap the application
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Listen on the port defined in `process.env.PORT` or default to 3000
  await app.listen(Number(process.env.PORT) || 3000); // Ensuring that `PORT` is converted to a number
}

// Call the bootstrap function to start the application
bootstrap();
