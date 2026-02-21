import { Schema, Document } from 'mongoose';

export interface IConfiguration extends Document {
    key: string;
    value: any;
    description?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const ConfigurationSchema = new Schema<IConfiguration>({
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false }
}, {
    timestamps: true
});
