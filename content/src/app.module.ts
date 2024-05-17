import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { ImagesModule } from './images/images.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ClassifiersModule } from './classifiers/classifiers.module';
import { PostprocessingModule } from './postprocessing/postprocessing.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('CONTENT_DB_URI'),
      }),
    }),
    StorageModule,
    ImagesModule,
    AuthModule,
    ClassifiersModule,
    PostprocessingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
