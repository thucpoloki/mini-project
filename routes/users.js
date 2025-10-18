const express = require('express');
const router = express.Router();

// Debug logger
const debug = require('debug')('myapp:users');

// Import User model
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
    try {
        debug('Getting all users');
        const users = await User.find();
        res.json({
            message: 'Users retrieved successfully',
            count: users.length,
            users: users
        });
    } catch (error) {
        debug('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        debug('Getting user by ID:', userId);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        debug('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        debug('Creating new user:', { name, email });

        const newUser = new User({
            name,
            email,
            password,
            role: role || 'user'
        });

        const savedUser = await newUser.save();

        debug('User created successfully:', savedUser._id);
        res.status(201).json({
            message: 'User created successfully',
            user: savedUser
        });

    } catch (error) {
        debug('Create user error:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, password, role } = req.body;

        debug('Updating user:', userId);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, password, role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        debug('User updated successfully:', userId);
        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        debug('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        debug('Deleting user:', userId);

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        debug('User deleted successfully:', userId);
        res.json({
            message: 'User deleted successfully',
            user: deletedUser
        });

    } catch (error) {
        debug('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
