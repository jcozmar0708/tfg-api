import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConstants } from 'src/common/constants';
import Decimal from 'decimal.js';
import { CreateOrderDto } from './dto/create-order.dto';
import { CaptureExpenseDto } from './dto/capture-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Debt } from './schemas/debt.schema';
import { Model } from 'mongoose';

@Injectable()
export class PayPalService {
  private readonly constants: any;

  constructor(
    @InjectModel(Debt.name) private readonly debtModel: Model<Debt>,
    private readonly configService: ConfigService,
  ) {
    this.constants = getConstants(configService);
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.constants.PAYPAL_CLIENT_ID}:${this.constants.PAYPAL_SECRET}`,
    ).toString('base64');

    const response = await fetch(
      `${this.constants.PAYPAL_API}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials',
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Error fetching access token: ${response.status} ${error}`,
      );
    }

    const data = await response.json();
    return data.access_token;
  }

  async createOrder(
    body: CreateOrderDto,
    payeeEmail: string = 'usuario.acreedor@email.com', // * Default sandbox user
  ): Promise<{ id: string; approveLink: string }> {
    const token = await this.getAccessToken();

    const grossAmount = this.calculateGrossAmount(body.amount);

    const response = await fetch(
      `${this.constants.PAYPAL_API}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'EUR',
                value: grossAmount,
              },
              payee: {
                email_address: payeeEmail,
              },
            },
          ],
          application_context: {
            return_url: `${this.constants.FRONT_URL}/paypal/success`,
            cancel_url: `${this.constants.FRONT_URL}/paypal/cancel`,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creating order: ${response.status} ${error}`);
    }

    const data = await response.json();

    const approveLink = data.links.find(
      (link: any) => link.rel === 'approve',
    )?.href;

    return {
      id: data.id,
      approveLink,
    };
  }

  async captureOrder(userEmail: string, body: CaptureExpenseDto): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.constants.PAYPAL_API}/v2/checkout/orders/${body.orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error capturing order: ${response.status} ${error}`);
    }

    const debt = await this.debtModel.findById(body.debtId);

    if (!debt) {
      throw new NotFoundException('Deuda no encontrada');
    }

    if (debt.fromEmail !== userEmail) {
      throw new BadRequestException(
        'No puedes eliminar deudas que no te pertenecen',
      );
    }

    await this.debtModel.findByIdAndDelete(body.debtId);

    return await response.json();
  }

  private calculateGrossAmount(netAmount: string): string {
    const net = new Decimal(netAmount);
    const fixedFee = new Decimal(0.35); // fixed fee

    let percentFee: Decimal;

    if (net.lessThan(75)) {
      percentFee = new Decimal(0.022); // 2.20%
    } else if (net.lessThanOrEqualTo(200)) {
      percentFee = new Decimal(0.02); // 2.00%
    } else if (net.lessThanOrEqualTo(1000)) {
      percentFee = new Decimal(0.018); // 1.80%
    } else {
      percentFee = new Decimal(0.015); // 1.50%
    }

    const gross = net
      .plus(fixedFee)
      .dividedBy(new Decimal(1).minus(percentFee));
    return gross.toDecimalPlaces(2, Decimal.ROUND_UP).toString();
  }
}
