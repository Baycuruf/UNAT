const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// GÜVENLİK PAKETLERİ (YENİ)
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

// Rota dosyasını içe aktar (YENİ EKLENDİ)
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
// --- GÜVENLİK KATMANI BAŞLANGICI ---

// 2. Veritabanı Enjeksiyon Koruması (NoSQL Injection)
// Gelen verideki '$' ve '.' gibi MongoDB operatörlerini temizler.
//app.use(mongoSanitize());

// 3. Güvenlik Başlıkları (Helmet)
// DNS Prefetch, Clickjacking, XSS vb. saldırılara karşı header ekler.
app.use(helmet());

// 4. XSS Koruması
// Kullanıcı girdisindeki HTML etiketlerini (<script>...) temizler.
//app.use(xss());

// 5. Hız Sınırlaması (Rate Limiting)
// 10 dakika içinde aynı IP'den en fazla 100 istek atılabilsin.
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 dakika
    max: 100,
    message: 'Çok fazla istek gönderdiniz, lütfen 10 dakika sonra tekrar deneyin.'
});
app.use('/api', limiter); // Sadece /api ile başlayan rotalara uygula

// 6. HTTP Parametre Kirliliği Koruması (HPP)
// Örn: ?sort=asc&sort=desc gibi tekrarlı parametreleri engeller.
app.use(hpp());

// 7. CORS (Cross-Origin Resource Sharing)
// Şu an herkese açık, Production'da sadece kendi sitene izin verecek şekilde ayarlanmalı.
app.use(cors());

// --- GÜVENLİK KATMANI BİTİŞİ ---

// Rotaları Tanımla (YENİ EKLENDİ)
// Artık localhost:5000/api/auth/register ve /login çalışır
app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
});