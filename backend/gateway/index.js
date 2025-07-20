// gateway/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

// --- YÖNLENDİRME KURALLARI ---

// Auth Service Yönlendirmesi
app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:5001', 
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '',
    },
}));

// User Service Yönlendirmesi (gelecekte eklenecek)
// app.use('/api/users', createProxyMiddleware({ target: 'http://localhost:5002', ... }));


// --- GLOBAL MIDDLEWARE'LER (PROXY'DEN SONRA) ---

// express.json()'ı, proxy kurallarından SONRA ve sadece proxy'lenmeyen
// Gateway'in kendi yolları için kullanıyoruz.
app.use(express.json());

// Gateway'in ayakta olup olmadığını kontrol etmek için bir test yolu
app.get('/', (req, res) => {
    res.send('API Gateway çalışıyor.');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`API Gateway http://localhost:${PORT} adresinde başlatıldı.`);
});