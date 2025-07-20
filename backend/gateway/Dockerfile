# --- 1. Aşama: Bağımlılıkları Yükleme (Builder) ---
# Node.js'in 20. versiyonunu temel alan hafif bir imaj kullanıyoruz.
FROM node:20-alpine AS builder

# Çalışma dizinini /app olarak ayarlıyoruz.
WORKDIR /app

# Sadece package.json ve package-lock.json dosyalarını kopyalıyoruz.
# Bu sayede, kodda değişiklik yapsak bile npm install tekrar çalışmaz, cache'ten kullanılır.
COPY package*.json ./

# Bağımlılıkları yüklüyoruz.
RUN npm install

# --- 2. Aşama: Çalıştırma (Runner) ---
# Daha küçük ve güvenli bir imajla yeniden başlıyoruz.
FROM node:20-alpine

WORKDIR /app

# Bir önceki aşamadan (builder) sadece gerekli olan node_modules klasörünü kopyalıyoruz.
COPY --from=builder /app/node_modules ./node_modules

# Tüm proje kodunu kopyalıyoruz.
COPY . .

# Bu konteynerin 8000 portunu dış dünyaya açacağını belirtiyoruz.
EXPOSE 8000

# Konteyner çalıştığında yürütülecek olan komut.
CMD [ "npm", "start" ]