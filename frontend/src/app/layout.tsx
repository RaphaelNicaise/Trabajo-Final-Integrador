'use client';

import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <link rel="icon" type="image/x-icon" href="/logosolo.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                <AuthProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
