import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
  admins,
  resetPasswordRequest,
  resetPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validator.js';
import { body, param } from 'express-validator';

const router = express.Router();

const validator = {
  checkLogin: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .bail()
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .trim()
      .isString()
      .notEmpty()
      .withMessage('Password is required'),
  ],
  checkNewUser: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .bail()
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .trim()
      .isString()
      .notEmpty()
      .withMessage('Password is required')
      .bail()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .escape(),
  ],
  checkGetUserById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ID: Must be a positive integer'),
  ],
  checkUpdateUser: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .bail()
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .escape(),
    body('isAdmin')
      .isBoolean()
      .withMessage('isAdmin value should be true/false'),
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ID: Must be a positive integer'),
  ],
  resetPasswordRequest: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .bail()
      .isEmail()
      .withMessage('Please enter a valid email address'),
  ],
  resetPassword: [
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .bail()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ID: Must be a positive integer'),
    param('token')
      .trim()
      .notEmpty()
      .withMessage('Token is required'),
  ],
};

router
  .route('/')
  .post(validator.checkNewUser, validateRequest, registerUser)
  .get(protect, admin, getUsers);

router.route('/admins').get(protect, admin, admins);

router
  .route('/reset-password/request')
  .post(validator.resetPasswordRequest, validateRequest, resetPasswordRequest);

router
  .route('/reset-password/reset/:id/:token')
  .post(validator.resetPassword, validateRequest, resetPassword);

router
  .route('/login')
  .post(validator.checkLogin, validateRequest, loginUser);

router
  .route('/logout')
  .post(protect, logoutUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(validator.checkNewUser, validateRequest, protect, updateUserProfile);

router
  .route('/:id')
  .get(validator.checkGetUserById, validateRequest, protect, admin, getUserById)
  .put(validator.checkUpdateUser, validateRequest, protect, admin, updateUser)
  .delete(validator.checkGetUserById, validateRequest, protect, admin, deleteUser);

export default router;