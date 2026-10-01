import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';

export class OpenLibraryService {
  private static readonly BASE_URL = 'https://openlibrary.org';
  private static readonly COVER_URL = 'https://covers.openlibrary.org/b/id';

  /**
   * 1. Tìm kiếm sách từ Open Library & gắn cờ sách đã có trong tủ
   */
  public static async searchBooks(keyword: string, page = 1, limit = 20) {
    try {
      const url = `${this.BASE_URL}/search.json?q=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new AppError(res.status, 'Không thể tải dữ liệu từ Open Library');
      }

      const data: any = await res.json();
      const docs: any[] = data.docs || [];

      // 1. Lấy danh sách ID sách vừa tìm được
      const workIds = docs.map((d) => d.key.replace('/works/', ''));

      // 2. Tìm trong MySQL xem những cuốn nào đã được lưu
      const savedBooks = await prisma.book.findMany({
        where: { workId: { in: workIds } },
        select: { id: true, workId: true, status: true },
      });
      const savedMap = new Map(savedBooks.map((b) => [b.workId, b]));

      // 3. Format dữ liệu trả về cho Frontend
      const books = docs.map((d) => {
        const workId = d.key.replace('/works/', '');
        const saved = savedMap.get(workId);

        return {
          workId,
          title: d.title || 'Chưa có tiêu đề',
          author: d.author_name ? d.author_name.join(', ') : 'Chưa rõ tác giả',
          coverUrl: d.cover_i ? `${this.COVER_URL}/${d.cover_i}-M.jpg` : null,
          publishYear: d.first_publish_year || null,
          totalPages: d.number_of_pages_median || d.number_of_pages || 0,
          isInBookshelf: Boolean(saved),
          bookshelfStatus: saved?.status || null,
          bookshelfId: saved?.id || null,
        };
      });

      return {
        books,
        total: data.numFound || 0,
        page,
        limit,
        totalPages: Math.ceil((data.numFound || 0) / limit) || 1,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Lỗi tìm kiếm sách: ${error.message}`);
    }
  }

  /**
   * 2. Lấy chi tiết một cuốn sách
   * - Fallback về MySQL nếu Open Library lỗi
   * - Auto-Sync (Đồng bộ ngầm) dữ liệu mới nhất từ Open Library vào MySQL nếu sách đã có trong tủ
   */
  public static async getWorkDetails(workIdParam: string) {
    const workId = workIdParam.replace('/works/', '').trim();

    // Tra cứu trong database của hệ thống
    let savedBook = await prisma.book.findUnique({
      where: { workId },
    });

    try {
      const res = await fetch(`${this.BASE_URL}/works/${workId}.json`);

      // Nếu Open Library lỗi -> Dùng Fallback từ MySQL
      if (!res.ok) {
        if (savedBook) {
          let parsedSubjects: string[] = [];
          if (savedBook.subjects) {
            try {
              parsedSubjects = JSON.parse(savedBook.subjects);
            } catch {
              parsedSubjects = [savedBook.subjects];
            }
          }

          return {
            workId,
            title: savedBook.title,
            description: savedBook.description || 'Không có mô tả chi tiết',
            coverUrl: savedBook.coverUrl,
            subjects: parsedSubjects,
            isInBookshelf: true,
            bookshelfBook: savedBook,
          };
        }

        if (res.status === 404) throw new AppError(404, 'Không tìm thấy sách này trên Open Library');
        throw new AppError(res.status, 'Lỗi kết nối Open Library');
      }

      const data: any = await res.json();

      // Rút trích mô tả mới nhất
      const description =
        typeof data.description === 'string'
          ? data.description
          : data.description?.value || savedBook?.description || '';

      // Rút trích ảnh bìa mới nhất
      const coverUrl =
        data.covers && data.covers.length > 0 && data.covers[0] > 0
          ? `${this.COVER_URL}/${data.covers[0]}-L.jpg`
          : savedBook?.coverUrl || null;

      const subjects = Array.isArray(data.subjects) ? data.subjects.slice(0, 10) : [];

      // Rút trích tác giả
      let author = savedBook?.author || null;
      if (!author && data.authors && data.authors.length > 0) {
        try {
          const authorKey = data.authors[0].author?.key || data.authors[0].key;
          if (authorKey) {
            const authorRes = await fetch(`${this.BASE_URL}${authorKey}.json`);
            if (authorRes.ok) {
              const authorData: any = await authorRes.json();
              author = authorData.name || null;
            }
          }
        } catch {
          // ignore author fetch error
        }
      }

      // Rút trích năm xuất bản
      let publishYear = savedBook?.publishYear || null;
      if (!publishYear && data.first_publish_date) {
        const match = String(data.first_publish_date).match(/\b(18|19|20)\d{2}\b/);
        if (match) {
          publishYear = parseInt(match[0], 10);
        }
      }

      const totalPages = savedBook?.totalPages || 0;

      // 👉 TỰ ĐỘNG ĐỒNG BỘ (AUTO-SYNC): Nếu sách đã có trong DB, cập nhật ngầm metadata mới nhất
      if (savedBook) {
        savedBook = await prisma.book.update({
          where: { workId },
          data: {
            title: data.title || savedBook.title,
            author: author || savedBook.author,
            coverUrl: coverUrl || savedBook.coverUrl,
            description: description || savedBook.description,
            subjects: subjects.length > 0 ? JSON.stringify(subjects) : savedBook.subjects,
          },
        });
      }

      return {
        workId,
        title: data.title || savedBook?.title || 'Chưa có tiêu đề',
        author,
        publishYear,
        totalPages,
        description,
        coverUrl,
        subjects,
        isInBookshelf: Boolean(savedBook),
        bookshelfBook: savedBook,
      };
    } catch (error: any) {
      if (savedBook) {
        return {
          workId,
          title: savedBook.title,
          author: savedBook.author,
          publishYear: savedBook.publishYear,
          totalPages: savedBook.totalPages,
          description: savedBook.description || 'Không có mô tả chi tiết',
          coverUrl: savedBook.coverUrl,
          subjects: [],
          isInBookshelf: true,
          bookshelfBook: savedBook,
        };
      }
      if (error instanceof AppError) throw error;
      throw new AppError(500, `Lỗi lấy chi tiết sách: ${error.message}`);
    }
  }
}
