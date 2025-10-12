# 🎵 Ứng Dụng Phát Nhạc Trực Tuyến

Một hệ thống phát nhạc trực tuyến toàn diện với nhiều backend và frontend, hỗ trợ quản lý người dùng, quản trị viên, thanh toán và phát nhạc thời gian thực.

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)


## 🌟 Tổng quan

Ứng dụng phát nhạc trực tuyến này cung cấp trải nghiệm nghe nhạc đầy đủ với các tính năng như phát nhạc, quản lý danh sách yêu thích, bình luận, thanh toán VIP, và giao diện quản trị viên. Hệ thống được xây dựng với kiến trúc microservices, sử dụng nhiều công nghệ hiện đại để đảm bảo hiệu suất và khả năng mở rộng.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (Express.js)  │◄──►│   (MySQL)      │
│                 │    │   Port: 6969    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Redis Cache   │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│                 │
│                 │    │   Port: 3001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Tính năng chính

### 👤 Người dùng
- Đăng ký/Đăng nhập tài khoản
- Phát nhạc trực tuyến với player tùy chỉnh
- Quản lý danh sách yêu thích
- Lịch sử nghe nhạc
- Bình luận trên bài hát
- Thanh toán gói VIP
- Hệ thống giới thiệu (Referral)
- Quên mật khẩu với OTP

### 👨‍💼 Quản trị viên
- Quản lý người dùng (thêm, sửa, xóa, khóa)
- Quản lý bài hát (thêm, sửa, xóa)
- Quản lý nghệ sĩ (thêm, sửa, xóa)
- Thống kê doanh thu và người dùng
- Quản lý gói VIP
- Giám sát hệ thống

### 🎵 Phát nhạc
- Phát nhạc thời gian thực
- WebSocket cho đồng bộ hóa
- Hỗ trợ nhiều định dạng
- Player responsive
- Tìm kiếm bài hát và nghệ sĩ

## 🛠️ Công nghệ sử dụng

### Backend
- **Express.js**: Framework Node.js chính
- **NestJS**: Framework TypeScript cho backend phụ
- **MySQL**: Cơ sở dữ liệu chính
- **Redis**: Cache và session storage
- **WebSocket**: Phát nhạc thời gian thực
- **JWT**: Xác thực người dùng
- **bcrypt**: Mã hóa mật khẩu

### Frontend
- **React**: Library JavaScript chính
- **Next.js**: Framework React với SSR
- **Vite**: Build tool nhanh
- **Redux Toolkit**: Quản lý state
- **Tailwind CSS**: Framework CSS
- **Chart.js**: Thống kê và biểu đồ

### DevOps & Tools
- **Docker**: Container hóa (tùy chọn)
- **ESLint**: Lint code
- **Prettier**: Format code
- **TypeScript**: Type safety

## 💻 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **MySQL**: >= 8.0
- **Redis**: >= 6.0
- **npm** hoặc **yarn**

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd music_project
```

### 2. Cài đặt dependencies cho tất cả modules

#### Backend Express.js
```bash
cd music-backend
npm install
```

#### Backend NestJS
```bash
cd ../music-backend-nestjs
npm install
```

#### Frontend React
```bash
cd ../music-frontend/music-frontend
npm install
```

#### Frontend Next.js
```bash
cd ../../music-frontend-nextjs
npm install
```

### 3. Cấu hình cơ sở dữ liệu

Tạo database MySQL và chạy script tạo bảng:
```sql
-- Chạy file SQL để tạo cấu trúc database
-- (Các file SQL sẽ được cung cấp riêng)
```

### 4. Cấu hình environment variables

Tạo file `.env` trong mỗi thư mục backend:

```env
# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=music_db

# JWT
JWT_SECRET=your_jwt_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (cho quên mật khẩu)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment (nếu có tích hợp thanh toán)
PAYMENT_API_KEY=your_payment_key
```

### 5. Chạy ứng dụng

#### Terminal 1: Backend Express.js
```bash
cd music-backend
npm start
# Server chạy trên http://localhost:6969
```

#### Terminal 2: Backend NestJS
```bash
cd music-backend-nestjs
npm run start:dev
# Server chạy trên http://localhost:3001
```

#### Terminal 3: Frontend React
```bash
cd music-frontend/music-frontend
npm run dev
# Frontend chạy trên http://localhost:5173
```

#### Terminal 4: Frontend Next.js
```bash
cd music-frontend-nextjs
npm run dev
# Frontend chạy trên http://localhost:3000
```

### 6. Truy cập ứng dụng

- **Frontend chính**: http://localhost:5173
- **Frontend Next.js**: http://localhost:3000
- **Admin panel**: /admin (sau khi đăng nhập admin)

## 📁 Cấu trúc dự án

```
music_project/
├── music-backend/                 # Backend Express.js
│   ├── src/
│   │   ├── controllers/          # Logic xử lý
│   │   ├── models/              # Models Sequelize
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Middleware
│   │   ├── services/            # Business logic
│   │   ├── config/              # Database config
│   │   └── websocket.js         # WebSocket server
│   └── package.json
├── music-backend-nestjs/         # Backend NestJS
│   ├── src/
│   │   ├── entities/            # TypeORM entities
│   │   ├── auth/                # Authentication module
│   │   ├── admin/               # Admin module
│   │   ├── websocket/           # WebSocket gateway
│   │   └── app.module.ts
│   └── package.json
├── music-frontend/               # Frontend React + Vite
│   └── music-frontend/
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── pages/           # Page components
│       │   ├── redux/           # State management
│       │   └── App.jsx
│       └── package.json
├── music-frontend-nextjs/        # Frontend Next.js
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # React components
│   │   └── redux/               # State management
│   └── package.json
├── alter-db.sql                 # Database alterations
├── TODO.md                      # Development tasks
└── README.md                    # This file
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Music Endpoints
- `GET /api/songs` - Lấy danh sách bài hát
- `GET /api/songs/:id` - Chi tiết bài hát
- `GET /api/artists` - Danh sách nghệ sĩ
- `GET /api/artists/search` - Tìm kiếm nghệ sĩ

### User Endpoints
- `GET /api/favorites` - Danh sách yêu thích
- `POST /api/favorites` - Thêm vào yêu thích
- `GET /api/profile` - Thông tin cá nhân

### Admin Endpoints
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/songs` - Quản lý bài hát
- `GET /api/admin/dashboard` - Thống kê dashboard








*Được phát triển với ❤️ bởi [Tên của bạn]*
