const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const router = express.Router();

// JWT Secret (nên đặt trong .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Kiểm tra nếu người dùng đã tồn tại
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập hoặc email đã tồn tại'
            });
        }

        // Tạo user mới
        const newUser = new User({
            username,
            email,
            password  // Mật khẩu sẽ được băm bởi middleware trước khi lưu
        });

        await newUser.save();

        // Tạo token JWT
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đăng ký'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
        }

        // Find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Xác thực mật khẩu
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                fullName: user.fullName,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đăng nhập'
        });
    }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy token'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side should remove token)
 * @access  Private
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete user account permanently
 * @access  Private
 */
router.delete('/delete-account', async (req, res) => {
    try {
        const { password } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy token xác thực'
            });
        }

        // Check if password provided
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mật khẩu để xác nhận'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu không chính xác'
            });
        }

        // Store user info before deletion for logging
        const deletedUserInfo = {
            username: user.username,
            email: user.email,
            id: user._id
        };

        // Delete user account from MongoDB
        const deletionResult = await User.findByIdAndDelete(user._id);

        if (!deletionResult) {
            console.error('❌ Failed to delete user from MongoDB');
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa tài khoản từ database'
            });
        }

        // Verify deletion
        const checkUser = await User.findById(deletedUserInfo.id);
        if (checkUser) {
            console.error('⚠️ WARNING: User still exists in database after deletion!');
        } else {
            console.log(`✅ Account permanently deleted from MongoDB: ${deletedUserInfo.username} (${deletedUserInfo.email}) at ${new Date().toISOString()}`);
        }

        res.json({
            success: true,
            message: 'Tài khoản đã được xóa thành công'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa tài khoản'
        });
    }
});

/**
 * @route   GET /api/auth/check-user/:username
 * @desc    Check if user exists in database (for debugging)
 * @access  Public (should be protected in production)
 */
router.get('/check-user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');
        
        if (user) {
            res.json({
                exists: true,
                user: {
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    isActive: user.isActive
                }
            });
        } else {
            res.json({
                exists: false,
                message: 'User not found in database'
            });
        }
    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking user'
        });
    }
});

/**
 * @route   GET /api/auth/all-users
 * @desc    Get all users (for debugging - REMOVE IN PRODUCTION!)
 * @access  Public (should be admin only in production)
 */
router.get('/all-users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            count: users.length,
            users: users.map(u => ({
                username: u.username,
                email: u.email,
                createdAt: u.createdAt,
                isActive: u.isActive
            }))
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting users'
        });
    }
});

module.exports = router;

