const crypto = require('crypto'); // En tepeye ekle
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lütfen bir isim giriniz']
    },
    email: {
        type: String,
        required: [true, 'Lütfen bir email adresi giriniz'],
        unique: true, // Aynı mail ile iki kayıt olamaz
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir email adresi giriniz'
        ]
    },
    password: {
        type: String,
        required: [true, 'Lütfen bir şifre giriniz'],
        minlength: 6,
        select: false // ÖNEMLİ: Kullanıcı verisini çektiğimizde şifre gitmesin diye gizliyoruz.
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Sadece bu iki rolü kabul eder
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Şifre Sıfırlama için gerekli alanlar
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// 1. MİDDLEWARE: Kayıt olmadan hemen önce şifreyi şifrele (Hash)
// Kullanıcı 'save' edilmeden önce bu kod çalışır.
UserSchema.pre('save', async function(next) {
    // Eğer şifre alanı değişmediyse (sadece isim güncellendiyse) tekrar hashleme yapma
    if (!this.isModified('password')) {
        next();
    }

    // Şifreyi tuzla (Salt) ve Hashle
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 2. METHOD: Girilen şifre ile veritabanındaki hashlenmiş şifreyi kıyasla
// Bunu giriş yaparken (Login) kullanacağız.
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
// Şifre Sıfırlama Token'ı Oluştur
UserSchema.methods.getResetPasswordToken = function() {
    // 1. Rastgele 20 byte'lık bir token oluştur
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Token'ı hashle ve veritabanına kaydet (Güvenlik için hashliyoruz)
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Token süresini ayarla (10 dakika)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Hashlenmemiş ham token'ı geri döndür (Kullanıcıya maille bunu atacağız)
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);