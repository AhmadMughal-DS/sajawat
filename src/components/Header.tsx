import React from 'react';
import { UserRole } from '../types/index.ts';
import { ShoppingBag, ShieldCheck, UserCheck, Code2, Lock, Building2, KeyRound } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenRegister: () => void;
  onOpenArchitecture: () => void;
  onOpenAdminRoute: () => void;
  currency: 'PKR' | 'USD';
  onToggleCurrency: (c: 'PKR' | 'USD') => void;
}


export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  cartItemCount,
  onOpenCart,
  onOpenRegister,
  onOpenArchitecture,
  onOpenAdminRoute,
  currency,
  onToggleCurrency,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E8E8] transition-all">
      {/* Top Pakistani B2B Trust & Currency Ticker */}
      <div className="bg-[#18181A] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] tracking-wide text-[#E0E0E0]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Karachi Korangi & SITE Mill Direct · FBR Registered Exporter (NTN: 4892011-4)
            </span>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:inline">Monthly Stitched Output: 120,000 Pcs</span>
            <span className="hidden lg:inline text-neutral-600">|</span>
            <span className="hidden lg:inline">Domestic Bilti (TCS / Cargo) & Port Qasim Ocean Freight</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Currency Selector (PKR default for Pakistani domestic + USD for export) */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-neutral-400">Currency:</span>
              <div className="inline-flex rounded bg-[#262629] p-0.5 border border-neutral-700">
                <button
                  type="button"
                  onClick={() => onToggleCurrency('PKR')}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    currency === 'PKR'
                      ? 'bg-[#D4AF37] text-[#1E1E1E] font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  PKR (Rs.)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCurrency('USD')}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    currency === 'USD'
                      ? 'bg-[#D4AF37] text-[#1E1E1E] font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* Dedicated Protected Factory Route Entry */}
            <button
              type="button"
              onClick={onOpenAdminRoute}
              className="text-[11px] text-neutral-400 hover:text-[#D4AF37] flex items-center gap-1 transition-colors pl-2 border-l border-neutral-700"
              title="Factory Admin Route (/admin)"
            >
              <KeyRound className="w-3 h-3 text-[#D4AF37]" />
              <span className="hidden sm:inline">Factory Admin Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (4-5 Nav Links) - Zone 3 (Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('catalog')}
              className="text-left group focus:outline-none"
            >
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1E1E1E] group-hover:text-[#D4AF37] transition-colors">
                SUTURA
              </span>
              <span className="block text-[9px] font-sans tracking-[0.25em] text-[#888888] uppercase">
                Pakistan Wholesale Atelier
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 Concise Navigation Links (Public for all retailers/buyers) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A4A4A]">
            <button
              type="button"
              onClick={() => onTabChange('catalog')}
              className={`hover:text-[#1E1E1E] transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'catalog'
                  ? 'text-[#1E1E1E] font-semibold border-b-2 border-[#D4AF37]'
                  : ''
              }`}
            >
              Stitched Collections
            </button>
            <button
              type="button"
              onClick={() => onTabChange('manufacturing')}
              className={`hover:text-[#1E1E1E] transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'manufacturing'
                  ? 'text-[#1E1E1E] font-semibold border-b-2 border-[#D4AF37]'
                  : ''
              }`}
            >
              Manufacturing Mill (Karachi)
            </button>
            <button
              type="button"
              onClick={() => onTabChange('portal')}
              className={`hover:text-[#1E1E1E] transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'portal'
                  ? 'text-[#1E1E1E] font-semibold border-b-2 border-[#D4AF37]'
                  : ''
              }`}
            >
              {currentRole === 'GUEST' && <Lock className="w-3.5 h-3.5 text-neutral-400" />}
              Retailer Portal
            </button>
            <button
              type="button"
              onClick={() => onTabChange('benchmark')}
              className={`hover:text-[#1E1E1E] transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'benchmark'
                  ? 'text-[#1E1E1E] font-semibold border-b-2 border-[#D4AF37]'
                  : ''
              }`}
            >
              Pehnavaa Comparison
            </button>
            <button
              type="button"
              onClick={onOpenArchitecture}
              className="text-[#6B7280] hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              Architecture
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role Quick Toggle for B2B Evaluation & Gating Test */}
            {onRoleChange && (
              <div className="hidden lg:flex items-center gap-1 bg-[#F2F1EC] p-0.5 rounded-lg border border-[#E2E0D8] text-[11px]">
                <button
                  type="button"
                  onClick={() => onRoleChange('GUEST')}
                  className={`px-2 py-1 rounded transition-colors ${
                    currentRole === 'GUEST'
                      ? 'bg-white text-[#1E1E1E] font-bold shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Preview Gated Guest Experience"
                >
                  Guest
                </button>
                <button
                  type="button"
                  onClick={() => onRoleChange('RETAILER')}
                  className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    currentRole === 'RETAILER'
                      ? 'bg-[#1E1E1E] text-[#D4AF37] font-bold shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title="Preview Verified Wholesale Buyer Experience"
                >
                  <UserCheck className="w-3 h-3 text-[#D4AF37]" />
                  NTN Verified
                </button>
              </div>
            )}

            {currentRole === 'GUEST' ? (
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-3.5 py-2 text-xs font-semibold tracking-wide uppercase bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-98"
              >
                Apply for Wholesale
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-700 bg-[#F4F3EE] border border-[#E5E3D8] px-2.5 py-1.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[#1E1E1E]">
                  Gulberg Pret (NTN Active)
                </span>
              </div>
            )}

            {/* Bulk Cart Action */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open bulk cart with ${cartItemCount} items`}
              className="relative p-2.5 text-[#1E1E1E] hover:text-[#D4AF37] hover:bg-neutral-50 rounded-lg transition-colors border border-neutral-200"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#1E1E1E] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
