const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. İstek başlığında (Header) 'Authorization' var mı ve 'Bearer' ile başlıyor mu kontrol et
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // 'Bearer <token>' formatında olduğu için boşluktan bölüp sadece token kısmını alıyoruz
        token = req.headers.authorization.split(' ')[1];
    }

    // Token yoksa içeri alma
    if (!token) {
        return res.status(401).json({ success: false, message: 'Bu işlem için giriş yapmalısınız.' });
    }

    try {
        // 2. Token'ı doğrula (Çözümle)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Token içindeki ID'den kullanıcıyı bul ve isteğe (req) ekle
        // Böylece sonraki aşamada (Controller) 'req.user' diyerek kullanıcının kim olduğunu bileceğiz.
        req.user = await User.findById(decoded.id);

        next(); // Her şey yolunda, sıradaki işleme geç
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Yetkisiz işlem, token geçersiz.' });
    }
};
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // req.user.role verisi protect middleware'inden geliyor
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Bu işlem için '${req.user.role}' rolü yetkili değil.` 
            });
        }
        next();
    };
};