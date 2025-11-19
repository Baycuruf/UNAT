const crypto = require('crypto'); // Bunu ekle
const sendEmail = require('../utils/sendEmail'); // Bunu ekle
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Yardımcı Fonksiyon: Token oluşturup cevap dönme
// Bunu hem Register hem Login işleminde kullanacağız, kod tekrarını önler.
const sendTokenResponse = (user, statusCode, res) => {
    // Token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE // .env dosyasında 15m veya 30d gibi ayarlı
    });

    // İstersen Cookie olarak da gönderebilirsin ama şimdilik JSON olarak dönüyoruz.
    res.status(statusCode).json({
        success: true,
        token, 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

// @desc    Yeni kullanıcı kaydı (Register)
// @route   POST /api/auth/register
// @access  Public (Herkes erişebilir)
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Email zaten kayıtlı mı kontrol et
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanımda.'
            });
        }

        // 2. Kullanıcıyı oluştur (Şifre hashleme User modelinde otomatik yapılacak)
        const user = await User.create({
            name,
            email,
            password,
            role // Dikkat: Normalde role dışarıdan alınmaz, güvenlik açığı olabilir. Şablon olduğu için bıraktım.
        });

        // 3. Token oluştur ve cevap dön
        sendTokenResponse(user, 201, res);

    } catch (error) {
        // Hata olursa (Örn: Veritabanı hatası)
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Kullanıcı Girişi (Login)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Email ve şifre girilmiş mi?
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Lütfen email ve şifre giriniz' });
        }

        // 2. Kullanıcıyı bul (+password ile şifreyi de getir diyoruz çünkü modelde select: false yapmıştık)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri' });
        }

        // 3. Şifre eşleşiyor mu? (Modeldeki metodu kullanıyoruz)
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Geçersiz kimlik bilgileri' });
        }

        // 4. Her şey tamamsa Token ver
        sendTokenResponse(user, 200, res);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
};
exports.getMe = async (req, res, next) => {
    // Middleware sayesinde req.user dolu geliyor!
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
    };
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ success: false, message: 'Bu email ile kayıtlı kullanıcı bulunamadı.' });
    }

    // Token al (Modelde yazdığımız metod)
    const resetToken = user.getResetPasswordToken();

    // Veritabanına kaydet (hashlenmiş token ve süre)
    await user.save({ validateBeforeSave: false });

    // Reset URL oluştur
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayın:\n\n${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Şifre Sıfırlama Talebi',
            message
        });

        res.status(200).json({ success: true, data: 'Email gönderildi.' });
    } catch (error) {
        console.log(error); // <--- BU SATIRI EKLE, hatayı terminalde görelim.

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ success: false, message: 'Email gönderilemedi.' });
    }
};

// @desc    Şifre Sıfırlama (Yeni şifreyi kaydeder)
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
    // 1. URL'den gelen token'ı hashle (çünkü veritabanında hashli duruyor)
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    // 2. Bu token'a sahip ve süresi geçmemiş kullanıcıyı bul
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() } // Süresi şu andan büyük olmalı
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
    }

    // 3. Yeni şifreyi ayarla
    user.password = req.body.password;
    
    // 4. Token alanlarını temizle
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // 5. Kaydet (Middleware otomatik olarak yeni şifreyi hashleyecek)
    await user.save();

    // 6. Otomatik giriş yaptır (Yeni token ver)
    sendTokenResponse(user, 200, res);
};
exports.getAllUsers = async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
};