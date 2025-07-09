const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
  console.log("📦 Received body:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json("All fields are required");

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json("User registered successfully");
  } catch (err) {
    res.status(500).json("Server error: " + err.message);
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json("Email and password required");

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("Invalid email");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json("Server error: " + err.message);
  }
});

module.exports = router;
