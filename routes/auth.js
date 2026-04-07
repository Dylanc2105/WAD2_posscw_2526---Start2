import express from 'express';
import { loginPage, postLogin, logout } from '../controllers/authController.js';

const router = express.Router();

router.get('/login', loginPage);
router.post('/login', postLogin);
router.get('/logout', logout);

export default router;
