import { z } from 'zod';

// 1. Validate Query tìm kiếm sách từ Open Library
export const searchBooksQuerySchema = z.object({
  q: z.string().trim().min(1, 'Từ khóa tìm kiếm không được để trống'),
  page: z.coerce.number().int().min(1, 'Số trang phải lớn hơn hoặc bằng 1').default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// 2. Validate Param lấy chi tiết tác phẩm
export const workDetailsParamsSchema = z.object({
  workId: z.string().trim().min(1, 'workId không được để trống'),
});

// 3. Validate Query danh sách tủ sách (lọc theo tab)
export const getBookshelfQuerySchema = z.object({
  status: z.enum(['WANT_TO_READ', 'READING', 'COMPLETED']).optional(),
});

// 4. Validate Body thêm sách vào tủ
export const addBookSchema = z.object({
  workId: z.string().trim().min(1, 'Mã định danh tác phẩm (workId) là bắt buộc'),
  title: z.string().trim().min(1, 'Tên sách (title) là bắt buộc'),
  author: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  publishYear: z.coerce.number().int().optional().nullable(),
  totalPages: z.coerce.number().int().min(0, 'Tổng số trang phải lớn hơn hoặc bằng 0').default(0),
  description: z.string().optional().nullable(),
  subjects: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  status: z.enum(['WANT_TO_READ', 'READING', 'COMPLETED']).default('WANT_TO_READ'),
  currentPage: z.coerce.number().int().min(0, 'Số trang đang đọc phải lớn hơn hoặc bằng 0').default(0),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Điểm đánh giá từ 1 đến 5 sao')
    .max(5, 'Điểm đánh giá từ 1 đến 5 sao')
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

// 5. Validate Body cập nhật tiến độ / trạng thái sách trong tủ
export const updateBookSchema = z.object({
  currentPage: z.coerce.number().int().min(0, 'Số trang đang đọc phải >= 0').optional(),
  totalPages: z.coerce.number().int().min(0, 'Tổng số trang phải >= 0').optional(),
  status: z.enum(['WANT_TO_READ', 'READING', 'COMPLETED']).optional(),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Điểm đánh giá từ 1 đến 5 sao')
    .max(5, 'Điểm đánh giá từ 1 đến 5 sao')
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

// 6. Validate Param ID sách trong tủ
export const bookIdParamsSchema = z.object({
  id: z.coerce.number().int().min(1, 'ID sách không hợp lệ'),
});
