import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_PUBLIC_KEY'),
    });
  }

  async validate(payload: any) {
    // TODO: Fix or delegate to the microservices
    console.log('JWT_PAYLOAD', payload);
    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
