import { Request, Response, NextFunction } from 'express';
import { OpenLibraryService } from '../services/openLibrary.service';
import { BookshelfService } from '../services/bookshelf.service';
import { ReadingStatus } from '@prisma/client';

export class BookController {
  // ==========================================
  // 1. NHÓM API TÌM KIẾM & CHI TIẾT (OPEN LIBRARY PROXY)
  // ==========================================

  /**
   * GET /api/books/search?q={keyword}&page={n}&limit={20}
   * Tìm kiếm sách từ Open Library và đối chiếu trạng thái trong Tủ sách
   */
  public static async searchBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const keyword = String(req.query.q || '').trim();
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await OpenLibraryService.searchBooks(keyword, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/books/works/:workId
   * Lấy chi tiết tác phẩm (mô tả, ảnh bìa HD, subjects, trạng thái cá nhân)
   */
  public static async getWorkDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workId = String(req.params.workId);
      const result = await OpenLibraryService.getWorkDetails(workId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 2. NHÓM API QUẢN LÝ TỦ SÁCH CÁ NHÂN (MYSQL / PRISMA)
  // ==========================================

  /**
   * GET /api/bookshelf?status=READING&search=gatsby
   * Lấy danh sách sách trong tủ cá nhân (lọc theo tab trạng thái hoặc từ khóa)
   */
  public static async getBookshelf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as ReadingStatus | undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const books = await BookshelfService.getBookshelf(status, search);

      res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookshelf/stats
   * Thống kê nhanh: tổng số sách, số đang đọc, số đã đọc xong, tổng trang đã đọc
   */
  public static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await BookshelfService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bookshelf
   * Thêm sách mới vào tủ cá nhân (chống trùng 409, tự động set startDate/finishDate)
   */
  public static async addBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newBook = await BookshelfService.addBook(req.body);

      res.status(201).json({
        success: true,
        message: 'Đã thêm sách vào tủ thành công',
        data: newBook,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/bookshelf/:id
   * Cập nhật tiến độ đọc (trang hiện tại), đổi trạng thái, chấm điểm 1-5 sao, ghi chú
   */
  public static async updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = Number(req.params.id);
      const updatedBook = await BookshelfService.updateBook(bookId, req.body);

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin sách thành công',
        data: updatedBook,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/bookshelf/:id
   * Xóa sách khỏi tủ cá nhân
   */
  public static async deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = Number(req.params.id);
      const result = await BookshelfService.deleteBook(bookId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
