import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import apiRoute from './routes/api';
import webRoute from './routes/web';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware cơ bản
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

// Cấu hình CORS mở toàn diện cho Frontend (Vercel, Localhost, VPS, Render)
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Gắn các đường dẫn Routes
app.use('/', webRoute);
app.use('/api', apiRoute);

// Middleware xử lý lỗi tập trung toàn hệ thống (BẮT BUỘC ĐẶT Ở CUỐI)
app.use(errorHandler);

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server Mini Reading Tracker đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 API Endpoints sẵn sàng tại: http://localhost:${PORT}/api`);
});

export default app;