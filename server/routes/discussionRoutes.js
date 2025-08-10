import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPublicBlogs,
  getBlogById,
  createBlog,
  deleteBlog,
  getMyBlogs,
  voteBlog,
  listComments,
  createComment,
  getThread
} from '../controllers/blogController.js';
const router = Router();

router.get('/public', getPublicBlogs);
router.get('/me', protect, getMyBlogs);
router.post('/', protect, createBlog);
router.post('/:id/vote', protect, voteBlog);

router.get('/:id/comments', listComments);
router.post('/:id/comments', protect, createComment);
router.get('/comments/:id/thread', getThread);

router.get('/:id', getBlogById);
router.delete('/:id', protect, deleteBlog);

export default router;
