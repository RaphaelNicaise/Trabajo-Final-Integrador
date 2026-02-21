'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { PromocionesPage } from '@/views/admin/Promociones';

export default function PromocionesRoute() {
    return (
        <ShopGuard>
            <PromocionesPage />
        </ShopGuard>
    );
}
