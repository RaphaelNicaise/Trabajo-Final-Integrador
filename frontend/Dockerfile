FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiamos solo los manifests para cache de dependencias
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

# Copiamos el resto del código
COPY . .

EXPOSE 5173

# Comando por defecto -> vite con hot reload
CMD ["pnpm", "dev", "--host", "--strictPort"]
