import { Request, Response } from 'express';

export const getHomePage = (req: Request, res: Response) => {
  res.status(200).json({
    name: 'Mini Reading Tracker API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      searchBooks: 'GET /api/books/search?q={keyword}&page={n}&limit={20}',
      getWorkDetails: 'GET /api/books/works/{workId}',
      getBookshelf: 'GET /api/bookshelf?status={WANT_TO_READ|READING|COMPLETED}&search={keyword}',
      getStats: 'GET /api/bookshelf/stats',
      addBook: 'POST /api/bookshelf',
      updateBook: 'PUT /api/bookshelf/:id',
      deleteBook: 'DELETE /api/bookshelf/:id',
    },
  });
};
