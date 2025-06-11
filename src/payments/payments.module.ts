import { Module } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { ExpensesModule } from './expense/expense.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Debt, DebtSchema } from './schemas/debt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
    ConfigModule,
    ExpensesModule,
  ],
  providers: [PayPalService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
