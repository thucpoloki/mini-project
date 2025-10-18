const express = require('express');
const Book = require('../../models/Book');
const connectToDatabase = require('../../lib/mongodb');

const router = express.Router();

// Initialize database connection
connectToDatabase().catch(console.error);

// GET /books - Get latest books and discount books
router.get('/', async (req, res) => {
  try {
    const latestBooks = await Book.find()
      .sort({ bookId: -1 })
      .limit(12)
      .lean(); // lean() method to get plain data without Mongoose methods

    const discountBooks = await Book.aggregate([
      { $match: { discount: { $gt: 0 } } },
      { $sample: { size: 6 } },
    ]);

    res.json({
      latestBooks,
      discountBooks
    });

  } catch (err) {
    console.error('Get books error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// GET /books/genre/:genre - Get books by genre
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const books = await Book.find({ genre: genre }).lean();

    if (books.length === 0) {
      return res.status(404).json({
        message: 'No books found for this genre',
        genre: genre
      });
    }

    res.json(books);

  } catch (err) {
    console.error('Get books by genre error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// GET /books/:id - Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const book = await Book.findOne({ bookId: bookId }).lean();

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);

  } catch (err) {
    console.error('Get book by ID error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// POST /books - Create new book
router.post('/', async (req, res) => {
  try {
    const { bookId, title, author, supplier, genre, cover, price, image, pages, discount, category } = req.body;

    const newBook = new Book({
      bookId,
      title,
      author,
      supplier,
      genre,
      cover,
      price,
      image,
      pages,
      discount,
      category
    });

    const savedBook = await newBook.save();

    res.status(201).json({
      message: 'Book created successfully',
      book: savedBook
    });

  } catch (err) {
    console.error('Create book error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// PUT /books/:id - Update book
router.put('/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const { title, author, supplier, genre, cover, price, image, pages, discount, category } = req.body;

    const updatedBook = await Book.findOneAndUpdate(
      { bookId: bookId },
      { title, author, supplier, genre, cover, price, image, pages, discount, category },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });

  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// DELETE /books/:id - Delete book
router.delete('/:id', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const deletedBook = await Book.findOneAndDelete({ bookId: bookId });

    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      message: 'Book deleted successfully',
      book: deletedBook
    });

  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

// POST /books/details - Get multiple books by IDs for cart
router.post('/details', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        message: 'IDs array is required'
      });
    }

    // Convert string IDs to numbers for bookId lookup
    const bookIds = ids.map(id => {
      // Try to parse as number, fallback to string
      const num = parseInt(id);
      return isNaN(num) ? id : num;
    });

    const books = await Book.find({ 
      $or: [
        { bookId: { $in: bookIds } },
        { _id: { $in: ids } }
      ]
    }).lean();

    console.log(`📚 Found ${books.length} books for IDs:`, ids);

    res.json({
      books: books
    });

  } catch (err) {
    console.error('Get book details error:', err);
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
