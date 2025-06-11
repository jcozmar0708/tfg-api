import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../schemas/expense.schema';
import { Debt } from '../schemas/debt.schema';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { Group } from '../../group/schemas/group.schema';
import Decimal from 'decimal.js';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    @InjectModel(Debt.name) private readonly debtModel: Model<Debt>,
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
  ) {}

  async getDebtsForUser(email: string, groupUUID: string): Promise<Debt[]> {
    return this.debtModel
      .find({ fromEmail: email, groupUUID: groupUUID })
      .exec();
  }

  async createExpense(
    payerEmail: string,
    dto: CreateExpenseDto,
  ): Promise<Expense> {
    const group = await this.groupModel.findById(dto.groupUUID).exec();
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const filteredParticipants = dto.participants.filter(
      (email) => email !== payerEmail,
    );

    if (filteredParticipants.length === 0)
      throw new BadRequestException(
        'Debe haber al menos un participante distinto al usuario que ha pagado',
      );

    for (const participant of filteredParticipants) {
      if (!group.users.includes(participant))
        throw new BadRequestException(
          `El usuario ${participant} no pertenece al grupo`,
        );
    }

    const totalPeople = new Decimal(filteredParticipants.length + 1);
    const totalAmount = new Decimal(dto.amount);
    const amountPerPerson = totalAmount.dividedBy(totalPeople);

    for (const participant of filteredParticipants) {
      await this.debtModel.create({
        groupUUID: dto.groupUUID,
        title: dto.title,
        fromEmail: participant,
        toEmail: payerEmail,
        amount: +amountPerPerson.toFixed(2),
      });
    }

    const expense = await this.expenseModel.create({
      ...dto,
      payerEmail,
    });

    return expense;
  }

  async payDebtInCash(
    userEmail: string,
    debtId: string,
  ): Promise<{ success: boolean }> {
    const debt = await this.debtModel.findById(debtId);

    if (!debt) {
      throw new NotFoundException('Deuda no encontrada');
    }

    if (debt.fromEmail !== userEmail) {
      throw new BadRequestException(
        'No puedes eliminar deudas que no te pertenecen',
      );
    }

    await this.debtModel.findByIdAndDelete(debtId);

    return { success: true };
  }
}
