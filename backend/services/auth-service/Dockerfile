# --- 1. Aşama: Bağımlılıkları Yükleme (Builder) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- 2. Aşama: Çalıştırma (Runner) ---
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Auth Service'in portu 5001'di.
EXPOSE 5001

CMD [ "npm", "start" ]