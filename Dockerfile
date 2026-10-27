FROM node:24-alpine
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install
COPY server/ ./
EXPOSE 3001
CMD ["node", "server.js"]
