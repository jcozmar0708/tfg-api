import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './schemas/session.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
  ) {}

  async create(userId: string, expiresAt: Date): Promise<Session> {
    const session = new this.sessionModel({
      sessionId: uuidv4(),
      userId,
      expiresAt,
    });

    return session.save();
  }

  async findById(sessionId: string): Promise<Session | null> {
    return this.sessionModel.findOne({ sessionId });
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessionModel.updateOne({ sessionId }, { revoked: true });
  }

  async revokeAllForUser(uuid: string): Promise<void> {
    await this.sessionModel.updateMany({ userId: uuid }, { revoked: true });
  }
}
