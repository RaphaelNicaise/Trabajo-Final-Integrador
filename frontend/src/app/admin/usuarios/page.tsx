'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { UsuariosPage } from '@/views/admin/Usuarios';

export default function UsuariosRoute() {
    return (
        <ShopGuard>
            <UsuariosPage />
        </ShopGuard>
    );
}
