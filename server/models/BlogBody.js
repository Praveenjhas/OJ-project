import { Schema, Types, model } from 'mongoose';

const blogBodySchema = new Schema({
  blogId: { type: Types.ObjectId, ref: 'Blog', required: true, unique: true, index: true },
  content: { type: String, required: true },
});

export default model('BlogBody', blogBodySchema);
