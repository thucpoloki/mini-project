const express = require('express');
const Book = require('../../models/Book');
const connectToDatabase = require('../../lib/mongodb');

const router = express.Router();

// Khởi tạo kết nối cơ sở dữ liệu từ hàm connectToDatabase của lib/mongodb.js
connectToDatabase().catch(console.error());

// Lấy các cuốn sách có category: noibat ngẫu nhiên từ cơ sở dữ liệu
router.get('/', async (req, res) => {
    try {
        // Tìm các cuốn sách có category: noibat ngẫu nhiên
        // phương thức aggregate là phương thức nhận vào .aggregate(pipeline, options)
        // $match: là pipeline stage để lọc các tài liệu dựa trên điều kiện nhất định
        // $match giống như WHERE trong SQL dùng để lọc dữ liệu theo điều kiện nhất định
        // $sample: là pipeline stage để lấy ngẫu nhiên một số tài liệu từ kết quả
        // $sample nhận vào một đối tượng với thuộc tính size xác định số lượng tài liệu ngẫu nhiên cần lấy
        // Giống như ORDER BY NEWID() trong SQL Server để lấy dữ liệu ngẫu nhiên
        // .lean() để trả về dữ liệu thuần, không kèm theo các phương thức của Mongoose

        // {"message":"Book.aggregate(...).lean is not a function"}
        // Nguyên nhân: Có thể do phiên bản Mongoose không hỗ trợ phương thức .lean() sau .aggregate()
        // Cách khắc phục: Thay vì sử dụng .lean() sau .aggregate(), ta có thể sử dụng .exec() để thực thi truy vấn và trả về dữ liệu thuần
        // const featuredBooks = await Book.aggregate([{ $match: { category: 'noibat' } }, { $sample: { size: 5 } }]).exec();

        const featuredBooks = await Book.aggregate([{ $match: { category: 'noibat' } }, { $sample: { size: 12 } }]).exec();
        res.json(featuredBooks);
    } catch (err) {
    console.error('Get books error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});
module.exports = router;
