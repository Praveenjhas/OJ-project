import { Schema, Types, model } from 'mongoose';

const blogSchema = new Schema(
  {
    authorId: { type: Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true },
    likesCount: { type: Number, default: 0, index: true },
    dislikesCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
blogSchema.index({ likesCount: -1, createdAt: -1 });
blogSchema.index({ createdAt: -1 });

export default model('Blog', blogSchema);
