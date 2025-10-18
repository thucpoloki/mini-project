const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../../models/User');
const connectToDatabase = require('../../lib/mongodb');

const router = express.Router();

// Initialize database connection
connectToDatabase().catch(console.error);

// POST /register
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save to MongoDB
    const user = await User.create({ username, email, password: hashed });

    // Save to JSON file (optional - for testing)
    const filePath = path.join(process.cwd(), "data/users.json");
    let users = [];

    try {
      const data = fs.readFileSync(filePath, "utf8");
      users = JSON.parse(data);
    } catch (err) {
      users = [];
    }

    users.push({ username, email, password }); // plain password for reference
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });

  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

module.exports = router;
