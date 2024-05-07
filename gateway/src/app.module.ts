import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AggregationModule } from './aggregation/aggregation.module';
import { ClassifiersModule } from './classifiers/classifiers.module';
import { ContentModule } from './content/content.module';
import configuration from './config/configuration';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UsersModule,
    AggregationModule,
    ClassifiersModule,
    ContentModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
