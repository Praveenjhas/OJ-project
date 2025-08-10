import { Schema, Types, model } from 'mongoose';

const commentSchema = new Schema(
  {
    blogId: { type: Types.ObjectId, ref: 'Blog', index: true, required: true },
    userId: { type: Types.ObjectId, required: true },
    body: { type: String, required: true },
    parentId: { type: Types.ObjectId, default: null, index: true },
    ancestors: { type: [Types.ObjectId], default: [], index: true },
  },
  { timestamps: true }
);
commentSchema.index({ blogId: 1, createdAt: -1 });

export default model('Comment', commentSchema);
