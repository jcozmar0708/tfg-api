import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;
}
