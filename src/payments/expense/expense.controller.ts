import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { PayDebtDto } from '../schemas/pay-debt.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('debts')
  async getUserDebts(@Req() req, @Query('groupUUID') groupUUID: string) {
    return this.expenseService.getDebtsForUser(req.user.email, groupUUID);
  }

  @Post()
  async createExpense(@Req() req, @Body() dto: CreateExpenseDto) {
    return this.expenseService.createExpense(req.user.email, dto);
  }

  @Post('pay-in-cash')
  async payInCash(@Req() req, @Body() dto: PayDebtDto) {
    return this.expenseService.payDebtInCash(req.user.email, dto.debtId);
  }
}
