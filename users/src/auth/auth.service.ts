import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from '../shared/dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { UserAuthData } from '../shared/entities/user-auth-data.entity';
import { compare, genSalt, hash } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(UserAuthData)
    private userAuthDataRepository: Repository<UserAuthData>,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password } = registerDto;

    const salt = await genSalt();
    registerDto.password = await hash(password, salt);

    await this.usersService.registerUser(registerDto);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const userAuthData = await this.userAuthDataRepository.findOne({
      where: { email },
    });

    if (!userAuthData) {
      throw new UnauthorizedException();
    }

    const isPasswordMatching = await compare(password, userAuthData.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findUserById(userAuthData.id);
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const user = await this.retrieveUserByRefreshToken(refreshToken);

      const accessToken = await this.generateAccessToken(user);
      const updatedRefreshToken = await this.generateRefreshToken(user);

      return { accessToken, refreshToken: updatedRefreshToken };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userAuthDataRepository.update(userId, { refreshToken: null });
  }

  getPublicKey() {
    return this.configService.get('JWT_PUBLIC_KEY');
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      roles: [user.role],
    };
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id };
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '10d',
    });

    const salt = await genSalt();
    const refreshTokenHash = await hash(refreshToken, salt);

    await this.userAuthDataRepository.update(user.id, {
      refreshToken: refreshTokenHash,
    });

    return refreshToken;
  }

  private async retrieveUserByRefreshToken(token: string): Promise<User> {
    const decoded = this.jwtService.verify(token);
    const userAuthData = await this.userAuthDataRepository.findOne({
      where: { id: decoded.sub },
    });
    if (!userAuthData || !userAuthData.refreshToken) {
      throw new UnauthorizedException();
    }
    const isRefreshTokenMatching = await compare(token, userAuthData.refreshToken);
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException();
    }
    return this.usersService.findUserById(decoded.sub);
  }
}
