import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('AI Content Aggregator')
    .setDescription(
      'This web service simplifies the process of finding and identifying AI-generated content by aggregating it from open sources and utilizing user-generated AI content.',
    )
    .setVersion('1.0')
    .addTag('AI Content')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Access Token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
