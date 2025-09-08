import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken.js';
import transporter from '../config/email.js';

// @desc     Auth user & get token
// @method   POST
// @endpoint /api/users/login
// @access   Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`); 

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide both email and password.');
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404);
      throw new Error('Invalid email address. Please check your email and try again.');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(401);
      throw new Error('Invalid password. Please check your password and try again.');
    }

    const token = generateToken(req, res, user.id);

    res.status(200).json({
      message: 'Login successful.',
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token, // Include token in response for frontend
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc     Register user
// @method   POST
// @endpoint /api/users
// @access   Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    console.log(`Register attempt for email: ${email}`);

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password.');
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      res.status(409);
      throw new Error('User already exists. Please choose a different email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(req, res, user.id);

    res.status(201).json({
      message: 'Registration successful. Welcome!',
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

// @desc     Logout user / clear cookie
// @method   POST
// @endpoint /api/users/logout
// @access   Private
const logoutUser = (req, res, next) => {
  try {
    res.clearCookie('jwt', { httpOnly: true });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// @desc     Get user profile
// @method   GET
// @endpoint /api/users/profile
// @access   Private
const getUserProfile = async (req, res, next) => {
  try {
    console.log(`Fetching profile for user ID: ${req.user.id}`);
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }

    res.status(200).json({
      message: 'User profile retrieved successfully',
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// @desc     Get admins
// @method   GET
// @endpoint /api/users/admins
// @access   Private/Admin
const admins = async (req, res, next) => {
  try {
    const admins = await User.findAll({ where: { isAdmin: true } });

    if (!admins || admins.length === 0) {
      res.status(404);
      throw new Error('No admins found!');
    }
    res.status(200).json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    next(error);
  }
};

// @desc     Get users
// @method   GET
// @endpoint /api/users
// @access   Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ where: { isAdmin: false } });

    if (!users || users.length === 0) {
      res.status(404);
      throw new Error('No users found!');
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
};

// @desc     Get user
// @method   GET
// @endpoint /api/users/:id
// @access   Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

// @desc     Update user
// @method   PUT
// @endpoint /api/users/:id
// @access   Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, isAdmin } = req.body;
    const { id: userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.isAdmin = isAdmin !== undefined ? Boolean(isAdmin) : user.isAdmin;

    const updatedUser = await user.save();

    res.status(200).json({ message: 'User updated', updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

// @desc     Update user profile
// @method   PUT
// @endpoint /api/users/profile
// @access   Private
const updateUserProfile = async (req, res, next) => {
  try {
    console.log('Update profile request:', req.body, 'User ID:', req.user.id);
    const { name, email, password } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found. Unable to update profile.');
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User profile updated successfully.',
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// @desc     Delete user
// @method   DELETE
// @endpoint /api/users/:id
// @access   Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }
    await User.destroy({ where: { id: user.id } });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

// @desc     Send reset password email
// @method   POST
// @endpoint /api/users/reset-password/request
// @access   Public
const resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(`Password reset request for email: ${email}`);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const passwordResetLink = `http://localhost:3000/reset-password/${user.id}/${token}`;
    console.log('Password reset link:', passwordResetLink);
    await transporter.sendMail({
      from: `"MERN Shop" ${process.env.EMAIL_FROM}`,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Hi ${user.name},</p>
            <p>We received a password reset request for your account. Click the link below to set a new password:</p>
            <p><a href="${passwordResetLink}" target="_blank">${passwordResetLink}</a></p>
            <p>If you didn't request this, you can ignore this email.</p>
            <p>Thanks,<br>MERN Shop Team</p>`,
    });

    res.status(200).json({ message: 'Password reset email sent, please check your email.' });
  } catch (error) {
    console.error('Reset password request error:', error);
    next(error);
  }
};

// @desc     Reset password
// @method   POST
// @endpoint /api/users/reset-password/reset/:id/:token
// @access   Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id: userId, token } = req.params;
    console.log(`Reset password attempt for user ID: ${userId}`);
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken || decodedToken.userId !== user.id.toString()) {
      res.status(401);
      throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUsers,
  getUserById,
  updateUser,
  updateUserProfile,
  deleteUser,
  admins,
  resetPasswordRequest,
  resetPassword,
};