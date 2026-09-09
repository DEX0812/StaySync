'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { OwnerDashboard } from '@/components/owner/OwnerDashboard';
import { TenantPortal } from '@/components/tenant/TenantPortal';
import { store } from '@/lib/store';

export default function Home() {
  const [activePersona, setActivePersona] = useState<'owner' | 'tenant'>('owner');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  useEffect(() => {
    const tenants = store.getTenants();
    if (tenants.length > 0) {
      setSelectedTenantId(tenants[0].id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header
        activePersona={activePersona}
        setActivePersona={setActivePersona}
        selectedTenantId={selectedTenantId}
        setSelectedTenantId={setSelectedTenantId}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePersona === 'owner' ? (
          <OwnerDashboard />
        ) : (
          <TenantPortal tenantId={selectedTenantId} />
        )}
      </main>
    </div>
  );
}
