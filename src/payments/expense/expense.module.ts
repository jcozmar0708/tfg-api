import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { Module } from '@nestjs/common';
import { Expense, ExpenseSchema } from '../schemas/expense.schema';
import { Debt, DebtSchema } from '../schemas/debt.schema';
import { Group, GroupSchema } from 'src/group/schemas/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  providers: [ExpenseService],
  controllers: [ExpenseController],
  exports: [ExpenseService],
})
export class ExpensesModule {}
