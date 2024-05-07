import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
}
