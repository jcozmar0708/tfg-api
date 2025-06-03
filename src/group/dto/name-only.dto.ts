import { IsNotEmpty, IsString } from 'class-validator';

export class NameOnlyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
