FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con hoist
RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN pnpm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
