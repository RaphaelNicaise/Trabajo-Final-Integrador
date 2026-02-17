'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { CategoriasPage } from '@/views/admin/Categorias';

export default function CategoriasRoute() {
    return (
        <ShopGuard>
            <CategoriasPage />
        </ShopGuard>
    );
}
