import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [JwtStrategy],
  controllers: [AuthController],
  imports: [HttpModule],
})
export class AuthModule {}
