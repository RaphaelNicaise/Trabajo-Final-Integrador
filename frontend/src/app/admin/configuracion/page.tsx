'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { ConfiguracionPage } from '@/views/admin/Configuracion';

export default function ConfiguracionRoute() {
    return (
        <ShopGuard>
            <ConfiguracionPage />
        </ShopGuard>
    );
}
