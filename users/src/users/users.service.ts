import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserAuthData } from '../shared/entities/user-auth-data.entity';
import { RegisterDto } from '../shared/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UserAuthData)
    private userAuthDataRepository: Repository<UserAuthData>,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<User> {
    const { email, password, username, firstName, lastName } = registerDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = queryRunner.manager.create(User, {
        username,
        firstName,
        lastName,
      });
      const savedUser = await queryRunner.manager.save(user);
      const userAuthData = queryRunner.manager.create(UserAuthData, {
        id: savedUser.id,
        email,
        password,
      });
      await queryRunner.manager.save(userAuthData);
      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
