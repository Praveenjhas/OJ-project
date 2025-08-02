# frontend/Dockerfile
FROM node:20-slim

WORKDIR /app

# Install build tools needed for native modules
RUN apt-get update && apt-get install -y python3 g++ make && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci  --no-audit --progress=false

COPY . .

EXPOSE 5173

ENV CHOKIDAR_USEPOLLING=true \
    VITE_API_BASE_URL=http://server:5000

CMD ["npm", "run", "dev"]
