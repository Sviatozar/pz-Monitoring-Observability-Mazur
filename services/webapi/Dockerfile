FROM node:18-alpine

WORKDIR /app

# Встановити залежності
COPY package*.json ./
RUN npm ci --only=production

# Копіювати код
COPY . .

# Expose порт
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Запустити додаток
CMD ["node", "server.js"]
