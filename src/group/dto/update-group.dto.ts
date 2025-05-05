import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name: string;
}
