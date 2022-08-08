import { Schema, model } from 'mongoose';
import { Session } from '../../models/Session';

const SessionSchema = new Schema<Session>({
  sess: Object,
  updatedAt: {
    default: new Date(),
    expires: 2 * 60, // 2min for login only
    type: Date
  }
}),
  SessionModel = model<Session>('Session', SessionSchema);

export default SessionModel;
