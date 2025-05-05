import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;
}
