/** @type {import('next').NextConfig} */
const nextConfig = {
    // Habilita el App Router (default en Next 15)
    reactStrictMode: true,
    // Genera un build standalone para contenedores Docker optimizados
    output: 'standalone',
};

module.exports = nextConfig;
