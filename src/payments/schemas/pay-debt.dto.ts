import { IsNotEmpty, IsString } from 'class-validator';

export class PayDebtDto {
  @IsString()
  @IsNotEmpty()
  debtId: string;
}
