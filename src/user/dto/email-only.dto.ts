import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailOnlyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
