const express = require('express');
const router = express.Router();

// Controller fonksiyonlarını çağırıyoruz
const { register, login, getMe, forgotPassword, resetPassword, getAllUsers } = require('../controllers/authController');
// Middleware'i çağır
const { protect , authorize} = require('../middleware/authMiddleware');

// Yönlendirmeler
// POST /api/auth/register adresine istek gelince 'register' fonksiyonunu çalıştır
router.post('/register', register);

// POST /api/auth/login adresine istek gelince 'login' fonksiyonunu çalıştır
router.post('/login', login);
// DİKKAT: Araya 'protect' koyduk. Artık buraya token olmadan kimse giremez.
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;