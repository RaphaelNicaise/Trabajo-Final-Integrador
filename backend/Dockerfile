FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copiamos todo el código, aunque se va a usar volumen
COPY . .

EXPOSE 4000
CMD ["pnpm", "run", "dev"]
