import { Schema, Document, Types } from 'mongoose';

export interface IInvitation extends Document {
  shopSlug: string;
  tenantId: Types.ObjectId;
  email: string;
  token: string;
  invitedBy: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

export const InvitationSchema = new Schema<IInvitation>({
  shopSlug: { type: String, required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  token: { type: String, required: true, unique: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true
});
