# server/Dockerfile
FROM node:20-alpine

RUN apk add --no-cache bash docker-cli

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
