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

  /**
   * Registers a new web service user.
   * @param registerDto - The registration data transfer object containing user information.
   * @returns The created user.
   * @throws An error if the transaction fails.
   */
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

  /**
   * Retrieves all web service users
   * @returns An object containing an array of sanitized user data.
   */
  async findAllUsers() {
    const users = await this.usersRepository.find();
    return {
      users: users.map((user) => this.sanitizeUser(user)),
    };
  }

  /**
   * Retrieves a web service user by its ID.
   * @param id - The ID of the user to retrieve.
   * @returns The sanitized user data.
   * @throws An error if the user is not found.
   */
  async findUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Sanitizes a user object by removing null or undefined properties.
   * @param user - The user object to sanitize.
   * @returns The sanitized user object.
   */
  private sanitizeUser(user: User): User {
    Object.keys(user).forEach((key) => {
      if (user[key] === null || user[key] === undefined) {
        delete user[key];
      }
    });
    return user;
  }
}
