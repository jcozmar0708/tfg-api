import { IsNotEmpty, IsString } from 'class-validator';

export class CaptureExpenseDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  debtId: string;
}
