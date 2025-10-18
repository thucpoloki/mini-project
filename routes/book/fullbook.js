const express = require('express');
const Book = require('../../models/Book');
const connectToDatabase = require('../../lib/mongodb');

const router = express.Router();

// Initialize database connection
connectToDatabase().catch(console.error);

// GET /fullbook - Get all books (for search)
router.get('/', async (req, res) => {
  try {
    console.log('📚 Fetching all books from database...');
    const books = await Book.find({}).lean();
    console.log(`✅ Found ${books.length} books in database`);
    res.json(books);
  } catch (err) {
    console.error('❌ Error fetching all books:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sách' });
  }
});

// GET /fullbook/:id - Get full book details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ bookId: id }).lean();

    if (!book) {
        return res.status(404).json({ message: 'Không tìm thấy sách!' });
    }
    res.json(book);
    } catch (err) {
        console.error('Lỗi khi lấy sách theo ID:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router; 