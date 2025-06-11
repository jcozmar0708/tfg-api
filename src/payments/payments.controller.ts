import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CaptureExpenseDto } from './dto/capture-expense.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payPalService: PayPalService) {}

  @Post('order')
  async createOrder(@Body() body: CreateOrderDto) {
    return await this.payPalService.createOrder(body);
  }

  @Post('capture')
  async captureOrder(@Req() req, @Body() body: CaptureExpenseDto) {
    await this.payPalService.captureOrder(req.user.email, body);
  }
}
