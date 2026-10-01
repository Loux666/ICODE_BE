import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import {
  validateQuery,
  validateBody,
  validateParams,
} from '../middlewares/validateMiddleware';
import {
  searchBooksQuerySchema,
  workDetailsParamsSchema,
  getBookshelfQuerySchema,
  addBookSchema,
  updateBookSchema,
  bookIdParamsSchema,
} from '../validations/bookshelf.validation';

const router = Router();

// ==========================================
// 1. NHÓM API OPEN LIBRARY PROXY (Tìm kiếm & Chi tiết)
// ==========================================

// GET /api/books/search?q={keyword}&page={n}&limit={limit}
router.get(
  '/books/search',
  validateQuery(searchBooksQuerySchema),
  BookController.searchBooks
);

// GET /api/books/works/:workId
router.get(
  '/books/works/:workId',
  validateParams(workDetailsParamsSchema),
  BookController.getWorkDetails
);

// ==========================================
// 2. NHÓM API QUẢN LÝ TỦ SÁCH CÁ NHÂN (MySQL)
// ==========================================

// GET /api/bookshelf/stats (Thống kê nhanh)
router.get(
  '/bookshelf/stats',
  BookController.getStats
);

// GET /api/bookshelf (Danh sách tủ sách - có lọc theo tab status)
router.get(
  '/bookshelf',
  validateQuery(getBookshelfQuerySchema),
  BookController.getBookshelf
);

// POST /api/bookshelf (Thêm sách vào tủ cá nhân)
router.post(
  '/bookshelf',
  validateBody(addBookSchema),
  BookController.addBook
);

// PUT /api/bookshelf/:id (Cập nhật tiến độ, trạng thái, đánh giá, ghi chú)
router.put(
  '/bookshelf/:id',
  validateParams(bookIdParamsSchema),
  validateBody(updateBookSchema),
  BookController.updateBook
);

// DELETE /api/bookshelf/:id (Xóa sách khỏi tủ)
router.delete(
  '/bookshelf/:id',
  validateParams(bookIdParamsSchema),
  BookController.deleteBook
);

export default router;
