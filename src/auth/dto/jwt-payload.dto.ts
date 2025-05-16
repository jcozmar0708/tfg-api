import { IsNotEmpty, IsString } from 'class-validator';

export class JwtPayloadDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
