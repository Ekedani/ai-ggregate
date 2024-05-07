import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.drDhO00ywU1JZtnkHkIkI0Dni1d3HZ1mtPTf3PLfyeY',
    description: 'The refresh token of the user',
  })
  refreshToken: string;
}
