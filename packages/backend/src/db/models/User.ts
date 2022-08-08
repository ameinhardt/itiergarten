import { Schema, model } from 'mongoose';
import { User as UserModel } from '../../models/User';

const UserSchema = new Schema<UserModel>(
  {
    provider: {
      type: Map,
      of: {
        sub: { type: String, required: true },
        refreshToken: { type: String, required: true }
      }
    },
    email: { type: String, required: true },
    givenName: { type: String, required: false },
    name: { type: String, required: true },
    roles: {
      type: [String]
    }
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transform: (_, { _id, provider, ...user }) => ({ id: _id, ...user })
    }
  }
),
  User = model<UserModel>('User', UserSchema);

export default User;
