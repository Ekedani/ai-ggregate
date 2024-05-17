import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'supersecretpassword',
    description: 'The password of the user',
    minLength: 8,
  })
  password: string;

  @ApiProperty({
    example: 'myusername',
    description: 'The username of the user',
    minLength: 2,
    maxLength: 30,
  })
  username: string;

  @ApiProperty({
    example: 'Vladlen',
    description: 'The first name of the user',
    minLength: 2,
    maxLength: 30,
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    example: 'Iliushchenko',
    description: 'The last name of the user',
    minLength: 2,
    maxLength: 30,
    required: false,
  })
  lastName?: string;
}
