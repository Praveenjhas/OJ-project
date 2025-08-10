import { Schema, Types, model } from 'mongoose';

const voteSchema = new Schema(
  {
    blogId: { type: Types.ObjectId, ref: 'Blog', index: true, required: true },
    userId: { type: Types.ObjectId, index: true, required: true },
    value: { type: Number, enum: [-1, 1], required: true },
  },
  { timestamps: true }
);
voteSchema.index({ blogId: 1, userId: 1 }, { unique: true });

export default model('Vote', voteSchema);
