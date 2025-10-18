// server.js
// Điểm vào chính cho máy chủ Express.

// Load environment variables first
require('dotenv').config();

const express = require('express');

// Middleware để xử lý CORS
const cors = require('cors');

// Middleware để ghi log các request HTTP
const morgan = require('morgan');



const path = require('path');

// Import MongoDB connection
const connectToDatabase = require('./lib/mongodb');

// Thêm các routes
const bookRoutes = require('./routes/book/route');
const noibatRoutes = require('./routes/book/noibat');
const fullbookRoutes = require('./routes/book/fullbook');
const authRoutes = require('./routes/auth/route');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging
const debug = require('debug')('myapp:server');

// Initialize MongoDB connection
connectToDatabase().catch(console.error);

// Middleware cơ bản
// app.use(); để sử dụng middleware.
/*
* Lưu ý: Thứ tự của các middleware quan trọng.
* Ví dụ: CORS nên được đặt trước các route để đảm bảo tất cả các route đều hỗ trợ CORS.
* Morgan nên được đặt trước các route để ghi log tất cả các request.
* express.json() và express.urlencoded() nên được đặt trước các route để phân tích body của request.
* Middleware tùy chỉnh như requestLogger nên được đặt sau các middleware cơ bản nhưng trước các route để ghi log chi tiết.
* errorHandler nên được đặt cuối cùng để xử lý tất cả các lỗi phát sinh từ các middleware và route trước đó.
*/
app.use(cors());
app.use(morgan('dev')); // HTTP request logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(requestLogger);

// file tĩnh
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));

// Favicon route
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/t-logo.png'));
});

// API routes
app.use('/api/books', bookRoutes);
app.use('/api/noibat', noibatRoutes);
app.use('/api/fullbook', fullbookRoutes);
app.use('/api/auth', authRoutes);

// Routes cho các trang HTML tĩnh
app.get('/trangchu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Trangchu.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Login.html'));
});

app.get('/sachkinhte', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/theloai.html'));
});

app.get('/tieuthuyet', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/theloai.html'));
});

app.get('/truyentranh', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/theloai.html'));
});

app.get('/theloai', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/theloai.html'));
});

app.get('/vanhoc', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/theloai.html'));
});

app.get('/tamly-kynangsong', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/theloai.html'));
});

app.get('/khuyenmai', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Khuyenmai.html'));
});

app.get('/tintuc', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Tintuc.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Account.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/Checkout.html'));
});

app.get('/order-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/OrderSuccess.html'));
});

// Thông tin sản phẩm, tin tức (dynamic id)
app.get('/sanpham/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/product-detail.html'));
});

app.get('/tintuc/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/CTTinTuc1.html'));
});

app.get('/purgescript', (req, res) => {
    res.sendFile(path.join(__dirname, 'purge-script.js'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Search endpoint
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/search-results.html'));
});

// Root endpoint
app.get('/', (req, res) => {
    // res.json({
    //     message: 'Welcome to Project Nhom7 API',
    //     version: '1.0.0',
    //     endpoints: {
    //         health: '/api/health',
    //         auth: '/api/auth',
    //         books: '/api/books',
    //         users: '/api/users'
    //     },
    //     homepage: '/trangchu' 
    // });
    res.redirect('/trangchu');
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Start server
const server = app.listen(PORT, () => {
    debug(`Server running on port ${PORT}`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Debug mode: Use --inspect flag for debugging`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        debug('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;


