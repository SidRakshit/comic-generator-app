FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV PORT=3001
EXPOSE 3001
CMD ["node", "dist/index.js"]
