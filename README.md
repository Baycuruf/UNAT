# 🚀 UNAT (Ultimate Node.js Auth Template)

**UNAT** is a production-ready, secure, and scalable **Authentication Boilerplate** built with Node.js, Express, and MongoDB. It includes JWT-based authentication, role-based access control, password reset flows, and advanced security measures.

---

## 🇬🇧 English Documentation

### Features
* **Authentication:** User Registration, Login, and Logout using **JWT** (JSON Web Tokens).
* **Authorization:** Role-Based Access Control (**Admin** / **User**).
* **Security:**
    * **Helmet:** Secure HTTP headers.
    * **Rate Limiting:** Brute-force protection.
    * **Mongo Sanitize:** Prevention of NoSQL injection.
    * **HPP:** HTTP Parameter Pollution protection.
* **Password Management:** Secure password hashing with **Bcrypt** and Email-based Password Reset flow.
* **Email Service:** Integrated Nodemailer (SMTP) support.

### Tech Stack
* Node.js & Express.js
* MongoDB & Mongoose
* JWT & Bcrypt.js
* Nodemailer

### Installation & Setup

**1. Clone the Repository**
```bash
git clone [https://github.com/Baycuruf/UNAT.git](https://github.com/Baycuruf/UNAT.git)
cd UNAT

2. Install Dependencies

npm install

3. Environment Variables Rename the .env.example file to .env and update the values with your own configuration.

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password

4. Run the Server

# Development mode (with Nodemon)
npm run dev

# Production mode
npm start

Method,    Endpoint,                       Description,                 Access
POST,      /api/auth/register,             Register a new user,         Public
POST,      /api/auth/login,                Login user & get token,      Public
POST,      /api/auth/forgotpassword,       Send reset password email,   Public
PUT,       /api/auth/resetpassword/:token, Reset password,              Public
GET,       /api/auth/me,                   Get current user profile,    Private
GET,       /api/auth/users,                Get all users,               Private (Admin)

🇹🇷 Türkçe Dokümantasyon

UNAT, Node.js, Express ve MongoDB ile geliştirilmiş; üretime hazır, güvenli ve ölçeklenebilir bir Kimlik Doğrulama Şablonudur. JWT tabanlı giriş, rol yönetimi, şifre sıfırlama akışları ve gelişmiş güvenlik önlemlerini içerir.

Özellikler
Kimlik Doğrulama: JWT kullanarak Kayıt Olma, Giriş Yapma ve Çıkış işlemleri.

Yetkilendirme: Rol tabanlı erişim kontrolü (Admin / User).

Güvenlik:

Helmet: Güvenli HTTP başlıkları.

Rate Limiting: Brute-force (kaba kuvvet) saldırı koruması.

Mongo Sanitize: NoSQL enjeksiyonlarını engelleme.

Şifre Yönetimi: Bcrypt ile güvenli şifreleme ve Email ile Şifre Sıfırlama.

Email Servisi: Entegre Nodemailer (SMTP) desteği.

Kurulum
1. Projeyi İndirin (Klonlayın)

git clone [https://github.com/Baycuruf/UNAT.git](https://github.com/Baycuruf/UNAT.git)
cd UNAT

2. Paketleri Yükleyin

npm install

3. Çevre Değişkenleri (.env) .env.example dosyasının ismini .env olarak değiştirin ve içindeki ayarları kendi bilgilerinizle güncelleyin.

PORT=5000
MONGO_URI=mongodb_baglanti_adresiniz
JWT_SECRET=cok_gizli_anahtariniz
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=mailtrap_kullanici_adiniz
SMTP_PASSWORD=mailtrap_sifreniz

4. Sunucuyu Başlatın

# Geliştirici modunda başlat (Nodemon ile)
npm run dev

Developed by Baycuruf