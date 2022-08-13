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

      transform: (_, { _id, provider, ...user }) => ({
        id: _id,
        provider: Object.keys(provider),
        ...user
      })
    }
  }
),
  User = model<UserModel>('User', UserSchema);

export default User;
