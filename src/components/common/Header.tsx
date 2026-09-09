'use client';

import React from 'react';
import { Building2, User, RefreshCw, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { store } from '@/lib/store';

interface HeaderProps {
  activePersona: 'owner' | 'tenant';
  setActivePersona: (persona: 'owner' | 'tenant') => void;
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  setActivePersona,
  selectedTenantId,
  setSelectedTenantId,
}) => {
  const property = store.getProperty();
  const tenants = store.getTenants();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 transition-transform hover:scale-105">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  StaySync<span className="text-blue-600">.</span>
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> PG SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate max-w-xs">
                {property.name} • {property.address.split(',')[0]}
              </p>
            </div>
          </div>

          {/* Persona Switcher Pill */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/60">
              <button
                onClick={() => setActivePersona('owner')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activePersona === 'owner'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider text-[11px]">Owner Hub</span>
              </button>

              <button
                onClick={() => setActivePersona('tenant')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                  activePersona === 'tenant'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider text-[11px]">Tenant Portal</span>
              </button>
            </div>

            {/* Tenant Selector Dropdown (Tenant Mode) */}
            {activePersona === 'tenant' && (
              <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-blue-600 mr-2" />
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-white text-slate-900">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Dataset Tool */}
            <button
              onClick={() => {
                if (confirm('Reset demo dataset to initial state?')) {
                  store.resetToDefaultSeed();
                }
              }}
              title="Reset Test Data"
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 border border-slate-200/60 transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
