import { Module } from '@nestjs/common';
import { AggregationModule } from './aggregation/aggregation.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataFetchersModule } from './data-fetchers/data-fetchers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagesModule } from './images/images.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    AggregationModule,
    DataFetchersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('STAGING_DB_URI'),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ImagesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
