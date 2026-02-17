'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { ProductosPage } from '@/views/admin/Productos';

export default function ProductosRoute() {
    return (
        <ShopGuard>
            <ProductosPage />
        </ShopGuard>
    );
}
