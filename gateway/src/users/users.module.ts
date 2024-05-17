import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';

@Module({
  providers: [],
  imports: [],
  exports: [],
  controllers: [UsersController],
})
export class UsersModule {}
