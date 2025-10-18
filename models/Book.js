const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  bookId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  supplier: { type: String, required: true },
  genre: { type: String, required: true },
  cover: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  pages: { type: Number, required: true },
  discount: { type: Number },
  category: { type: String, enum: ['noibat', 'moinhap', 'khuyenmai', ''], default: '' }
});

module.exports = mongoose.models.Book || mongoose.model("Book", BookSchema, "Books");
