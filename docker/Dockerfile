# UPAY 独角数卡适配器
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3100

ENV NODE_ENV=production
CMD ["node", "src/app.js"]
