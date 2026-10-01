import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { ReadingStatus, Prisma } from '@prisma/client';

export class BookshelfService {
  /**
   * 1. Lấy danh sách sách trong tủ (Lọc theo tab + tính % tiến độ)
   */
  public static async getBookshelf(status?: ReadingStatus, search?: string) {
    const where: Prisma.BookWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { author: { contains: search } },
        ],
      }),
    };

    const books = await prisma.book.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return books.map((book) => ({
      ...book,
      progressPercent:
        book.totalPages > 0
          ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
          : 0,
    }));
  }

  /**
   * 2. Lấy thống kê nhanh tủ sách
   */
  public static async getStats() {
    const [totalBooks, readingCount, completedCount, wantToReadCount, pageAgg] =
      await Promise.all([
        prisma.book.count(),
        prisma.book.count({ where: { status: ReadingStatus.READING } }),
        prisma.book.count({ where: { status: ReadingStatus.COMPLETED } }),
        prisma.book.count({ where: { status: ReadingStatus.WANT_TO_READ } }),
        prisma.book.aggregate({
          _sum: { currentPage: true },
          _avg: { rating: true },
        }),
      ]);

    return {
      totalBooks,
      readingCount,
      completedCount,
      wantToReadCount,
      totalPagesRead: pageAgg._sum.currentPage || 0,
      avgRating: pageAgg._avg.rating ? Number(pageAgg._avg.rating.toFixed(1)) : 0,
    };
  }

  /**
   * 3. Thêm sách vào tủ cá nhân (Chặn trùng 409 & set ngày tự động)
   */
  public static async addBook(dto: any) {
    const workId = dto.workId.replace('/works/', '').trim();

    // 1. Chặn thêm trùng sách
    if (await prisma.book.findUnique({ where: { workId } })) {
      throw new AppError(409, 'Cuốn sách này đã có trong tủ sách của bạn (409 Conflict)');
    }

    const totalPages = Number(dto.totalPages) || 0;
    const currentPage = Number(dto.currentPage) || 0;

    if (totalPages > 0 && currentPage > totalPages) {
      throw new AppError(400, `Số trang đọc (${currentPage}) không được lớn hơn tổng số trang (${totalPages})`);
    }

    // Tự chuyển COMPLETED nếu số trang đang đọc bằng tổng số trang
    let status: ReadingStatus = dto.status || ReadingStatus.WANT_TO_READ;
    if (totalPages > 0 && currentPage === totalPages) {
      status = ReadingStatus.COMPLETED;
    }

    return await prisma.book.create({
      data: {
        workId,
        title: dto.title,
        author: dto.author || null,
        coverUrl: dto.coverUrl || null,
        publishYear: dto.publishYear ? Number(dto.publishYear) : null,
        totalPages,
        description: dto.description || null,
        subjects: Array.isArray(dto.subjects) ? JSON.stringify(dto.subjects) : dto.subjects || null,
        status,
        currentPage,
        rating: dto.rating ? Number(dto.rating) : null,
        notes: dto.notes || null,
        startDate: status === ReadingStatus.READING ? new Date() : (status === ReadingStatus.COMPLETED ? new Date() : null),
        finishDate: status === ReadingStatus.COMPLETED ? new Date() : null,
      },
    });
  }

  /**
   * 4. Cập nhật tiến độ / trạng thái / đánh giá (Tự auto COMPLETED & set ngày)
   */
  public static async updateBook(id: number, dto: any) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new AppError(404, 'Không tìm thấy sách trong tủ');

    const totalPages = dto.totalPages !== undefined ? Number(dto.totalPages) : book.totalPages;
    const currentPage = dto.currentPage !== undefined ? Number(dto.currentPage) : book.currentPage;

    if (totalPages > 0 && currentPage > totalPages) {
      throw new AppError(400, `Số trang đọc (${currentPage}) không được lớn hơn tổng số trang (${totalPages})`);
    }

    // Tự động chuyển COMPLETED nếu đọc hết trang
    let status: ReadingStatus = dto.status || book.status;
    if (totalPages > 0 && currentPage === totalPages) {
      status = ReadingStatus.COMPLETED;
    }

    // Xử lý ngày bắt đầu đọc (startDate)
    let startDate = book.startDate;
    if (status === ReadingStatus.READING && !startDate) {
      startDate = new Date();
    }

    // Xử lý ngày đọc xong (finishDate)
    let finishDate = book.finishDate;
    if (status === ReadingStatus.COMPLETED) {
      if (!finishDate) finishDate = new Date();
    } else if (book.status === ReadingStatus.COMPLETED) {
      finishDate = null; // Reset nếu chuyển ngược về READING hoặc WANT_TO_READ
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        currentPage,
        totalPages,
        status,
        rating: dto.rating !== undefined ? (dto.rating ? Number(dto.rating) : null) : book.rating,
        notes: dto.notes !== undefined ? dto.notes : book.notes,
        startDate,
        finishDate,
      },
    });

    return {
      ...updated,
      progressPercent:
        updated.totalPages > 0
          ? Math.min(100, Math.round((updated.currentPage / updated.totalPages) * 100))
          : 0,
    };
  }

  /**
   * 5. Xóa sách khỏi tủ cá nhân
   */
  public static async deleteBook(id: number) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new AppError(404, 'Không tìm thấy sách cần xóa');

    await prisma.book.delete({ where: { id } });
    return { message: 'Đã xóa sách khỏi tủ thành công' };
  }
}
