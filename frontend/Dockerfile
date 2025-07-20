# --- 1. Aşama: Bağımlılıkları Yükleme (deps) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- 2. Aşama: Projeyi İnşa Etme (builder) ---
FROM node:20-alpine AS builder
WORKDIR /app
# Önceki aşamadan sadece node_modules'ü kopyala
COPY --from=deps /app/node_modules ./node_modules
# Tüm proje dosyalarını kopyala
COPY . .
# Next.js'in production (canlı ortam) için optimize edilmiş halini oluştur.
RUN npm run build

# --- 3. Aşama: Production Ortamı (runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Next.js'in production'da çalışması için gereken .env ayarları
ENV NODE_ENV=production

# Bağımlılıkları ve build edilmiş dosyaları kopyala
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Next.js production sunucusunu başlatır.
CMD ["npm", "start"]