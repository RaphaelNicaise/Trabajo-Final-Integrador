'use client';

import { ShopGuard } from '@/components/ShopGuard';
import { DashboardPage } from '@/views/admin/Dashboard';

export default function DashboardRoute() {
    return (
        <ShopGuard>
            <DashboardPage />
        </ShopGuard>
    );
}
