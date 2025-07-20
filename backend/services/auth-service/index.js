// services/auth-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Veritabanı bağlantımızı import ediyoruz
const bcrypt = require('bcryptjs'); // Şifre hash'lemek için
const jwt = require('jsonwebtoken');

const app = express();

// Middleware'ler
app.use(cors()); // CORS'u tüm istekler için etkinleştirelim
// Body-parser'ı daha büyük bir limitle ve daha esnek bir şekilde yapılandırıyoruz
// Bu, proxy'den gelen isteklerdeki olası gövde boyutu sorunlarını çözer.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- API Rotaları ---

// Servisin ayakta olup olmadığını test etmek için
app.get('/status', (req, res) => {
    res.send('Auth Service çalışıyor ve Gateway üzerinden erişildi!');
});

// POST /register - Yeni kullanıcı kaydı
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, role, farmName, location } = req.body;

    // Gerekli alanların kontrolü
    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: 'Temel alanlar (isim, soyisim, e-posta, şifre, rol) zorunludur.' });
    }
    if (role === 'farmer' && (!farmName || !location || !location.latitude || !location.longitude)) {
        return res.status(400).json({ message: 'Çiftçi kaydı için çiftlik adı ve konum bilgileri zorunludur.' });
    }

    const client = await db.getClient(); // Transaction için bir veritabanı istemcisi alıyoruz

    try {
        // --- TRANSACTION BAŞLANGICI ---
        await client.query('BEGIN');

        // 1. 'users' tablosuna ana kullanıcı kaydını at
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userQuery = `
            INSERT INTO users (first_name, last_name, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, first_name, last_name;
        `;
        const userValues = [firstName, lastName, email, passwordHash];
        const newUserResult = await client.query(userQuery, userValues);
        const newUser = newUserResult.rows[0];

        // 2. 'roles' tablosundan gelen rolün ID'sini bul
        const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [role]);
        if (roleResult.rows.length === 0) {
            throw new Error(`Geçersiz rol belirtildi: ${role}`);
        }
        const roleId = roleResult.rows[0].id;

        // 3. 'user_roles' tablosuna kullanıcı-rol ilişkisini kaydet
        const userRoleQuery = 'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)';
        await client.query(userRoleQuery, [newUser.id, roleId]);

        // 4. EĞER rol 'farmer' ise, 'farmer_profiles' tablosuna da kayıt at
        if (role === 'farmer') {
            const farmerProfileQuery = `
                INSERT INTO farmer_profiles (user_id, farm_name, location)
                VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326));
            `;
            const farmerValues = [newUser.id, farmName, location.longitude, location.latitude];
            await client.query(farmerProfileQuery, farmerValues);
        }

        // Tüm işlemler başarılıysa, transaction'ı onayla (commit)
        await client.query('COMMIT');

        res.status(201).json({
            message: `Kullanıcı '${role}' rolüyle başarıyla oluşturuldu.`,
            user: newUser
        });

    } catch (error) {
        // Herhangi bir adımda hata olursa, tüm işlemleri geri al (rollback)
        await client.query('ROLLBACK');
        console.error('Kayıt sırasında transaction hatası:', error);
        if (error.code === '23505') { // unique constraint hatası (e-posta)
            return res.status(409).json({ message: 'Bu e-posta adresi zaten kullanılıyor.' });
        }
        res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
    } finally {
        // Her durumda (başarılı veya başarısız) istemciyi havuza geri bırak
        client.release();
    }
});

// services/auth-service/index.js

// POST /login - Kullanıcı girişi (Daha Sağlam Hali)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-posta ve şifre zorunludur.' });
    }

    try {
        // 1. Kullanıcıyı bul
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(userQuery, [email]);

        // Kullanıcı bulunamadıysa, özel bir hata mesajı ile 401 Unauthorized dön.
        // Bu, en olası hata noktası.
        if (rows.length === 0) {
            console.log(`[Auth Service] Giriş denemesi başarısız: E-posta bulunamadı (${email})`);
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }
        
        const user = rows[0];

        // 2. Şifreleri karşılaştır
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        // Şifre yanlışsa, yine aynı genel hata mesajını dön.
        // (Güvenlik için "şifre yanlış" veya "e-posta yok" diye belirtmiyoruz)
        if (!isPasswordCorrect) {
            console.log(`[Auth Service] Giriş denemesi başarısız: Şifre yanlış (${email})`);
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        // 3. JWT Oluştur
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("[Auth Service] HATA: JWT_SECRET tanımlanmamış!");
            return res.status(500).json({ message: 'Sunucu yapılandırma hatası.' });
        }
        
        const token = jwt.sign(
            { userId: user.id },
            jwtSecret,
            { expiresIn: '1h' }
        );

        console.log(`[Auth Service] Giriş başarılı: ${email}`);
        // Başarılı yanıtı dön
        return res.status(200).json({
            message: 'Giriş başarılı.',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name
            }
        });

    } catch (error) {
        // Veritabanı bağlantısı gibi beklenmedik bir hata olursa burası çalışır.
        console.error('[Auth Service] Giriş sırasında beklenmedik hata:', error);
        return res.status(500).json({ message: 'Sunucuda bir hata oluştu.' });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Auth Service http://localhost:${PORT} adresinde başlatıldı.`);
});