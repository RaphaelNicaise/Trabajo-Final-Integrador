'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { OrdenesPage } from '@/views/admin/Ordenes';

export default function OrdenesRoute() {
    return (
        <ShopGuard>
            <OrdenesPage />
        </ShopGuard>
    );
}
