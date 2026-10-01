import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export const validateRequest = (schema: ZodSchema, source: RequestSource = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedData = await schema.parseAsync(req[source]);
      if (source === 'body') {
        req.body = parsedData;
      } else if (req[source] && typeof req[source] === 'object') {
        Object.assign(req[source], parsedData);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(422).json({
          success: false,
          message: 'Dữ liệu đầu vào không hợp lệ',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validateRequest(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validateRequest(schema, 'query');
export const validateParams = (schema: ZodSchema) => validateRequest(schema, 'params');
