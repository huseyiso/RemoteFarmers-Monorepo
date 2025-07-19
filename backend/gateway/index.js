// gateway/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Gateway'in ayakta olup olmadığını kontrol etmek için bir test yolu
app.get('/', (req, res) => {
    res.send('API Gateway çalışıyor.');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`API Gateway http://localhost:${PORT} adresinde başlatıldı.`);
});