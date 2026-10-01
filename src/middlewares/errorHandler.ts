import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Xử lý lỗi do AppError ném ra (Lỗi nghiệp vụ chủ động)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined,
    });
    return;
  }

  // 2. Xử lý lỗi validate từ Zod
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: formattedErrors,
    });
    return;
  }

  // 3. Xử lý lỗi từ Prisma ORM
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Lỗi trùng trường Unique (ví dụ trùng workId sách)
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Cuốn sách này đã tồn tại trong tủ sách của bạn (409 Conflict)',
      });
      return;
    }

    // P2025: Bản ghi không tồn tại
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu yêu cầu (404 Not Found)',
      });
      return;
    }
  }

  // 4. Lỗi JSON cú pháp hoặc các lỗi chưa xác định
  console.error('🔥 Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Đã có lỗi xảy ra từ phía máy chủ',
  });
};
