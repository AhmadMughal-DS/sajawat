import React, { useEffect, useState } from 'react';
import { UserRole } from '../types/index.ts';
import { ShoppingBag, UserCheck, Lock, KeyRound, Menu, X, Sparkles, Code2 } from 'lucide-react';

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
  cloudConnected?: boolean;
}

const NAV_ITEMS: { id: string; label: string; short: string }[] = [
  { id: 'catalog', label: 'Wholesale Catalog', short: 'Catalog' },
  { id: 'manufacturing', label: 'Factory & Bilti', short: 'Factory & Bilti' },
  { id: 'benchmark', label: 'Sajawat vs Pehnavaa', short: 'vs Pehnavaa' },
  { id: 'portal', label: 'Buyer Portal', short: 'Buyer Portal' },
];

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the drawer automatically when resizing up to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const go = (tab: string) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const CurrencyToggle = ({ compact = false }: { compact?: boolean }) => (
    <div
      className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200"
      role="group"
      aria-label="Select currency"
    >
      {(['PKR', 'USD'] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onToggleCurrency(c)}
          aria-pressed={currency === c}
          className={`${compact ? 'px-2 py-1' : 'px-3 py-1.5'} text-[11px] font-bold rounded-md transition-colors ${
            currency === c ? 'bg-[#5E1B42] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {c === 'PKR' ? 'Rs.' : '$'}
          <span className={compact ? 'sr-only' : 'ml-1'}>{c}</span>
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 sm:h-20">
          {/* Brand */}
          <button
            type="button"
            onClick={() => go('catalog')}
            className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none min-w-0"
            aria-label="Sajawat Wholesale home"
          >
            <div className="h-11 w-20 sm:h-14 sm:w-28 rounded-xl overflow-hidden border border-stone-200 bg-[#FAF7F2] shadow-2xs flex items-center justify-center p-1 shrink-0 group-hover:border-[#5E1B42] transition-colors">
              <img
                src="/sajawat-logo.webp"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://sajawat-wholesale-assets.s3.us-east-1.amazonaws.com/brand/sajawat-logo.jpeg';
                }}
                alt="Sajawat® — Stitched Women & Kids Wholesale Pakistan"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="block font-serif text-xl lg:text-2xl font-bold tracking-tight text-stone-900 leading-none">
                SAJAWAT<sup className="text-[10px] font-sans text-[#5E1B42]">®</sup>
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.16em] text-stone-500 uppercase mt-1 whitespace-nowrap">
                Women &amp; Kids · Wholesale
              </span>
            </div>
          </button>

          {/* Desktop navigation (xl+) */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium text-stone-700" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    active ? 'text-[#5E1B42] font-bold bg-[#FDF4F8]' : 'hover:text-[#5E1B42] hover:bg-stone-100/80'
                  }`}
                >
                  {item.id === 'benchmark' && <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />}
                  {item.id === 'portal' && currentRole === 'GUEST' && <Lock className="w-3.5 h-3.5 text-[#8B3264]" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:block">
              <CurrencyToggle compact />
            </div>

            <button
              type="button"
              onClick={onOpenRegister}
              className="hidden md:inline-flex items-center px-4 py-2.5 text-xs font-bold tracking-wide uppercase bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl shadow-2xs transition-all whitespace-nowrap active:scale-98"
            >
              Register Shop
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open wholesale cart with ${cartItemCount} suits`}
              className="relative h-10 sm:h-11 px-2.5 sm:px-3 bg-stone-100 hover:bg-stone-200/80 text-stone-900 rounded-xl transition-colors border border-stone-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-[#5E1B42]" />
              <span className="hidden sm:inline text-xs font-bold font-mono tabular-nums">{cartItemCount}</span>
              {cartItemCount > 0 && (
                <span className="sm:hidden absolute -top-1.5 -right-1.5 bg-[#5E1B42] text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="xl:hidden h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-stone-800 hover:bg-stone-100 rounded-xl border border-stone-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden pb-4 pt-3 border-t border-[#EBDCCB] space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="Mobile">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center gap-2 ${
                    activeTab === item.id ? 'bg-[#5E1B42] text-white' : 'bg-[#FAF3E8] text-[#4A3540]'
                  }`}
                >
                  {item.id === 'portal' && currentRole === 'GUEST' && <Lock className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EBDCCB]">
              <div className="flex items-center gap-2 text-xs text-[#6E5662]">
                <span className="font-semibold">Currency</span>
                <CurrencyToggle />
              </div>
              {onRoleChange && (
                <div className="flex items-center gap-1 bg-[#F6EFE6] p-1 rounded-xl border border-[#E4D4C0] text-[11px]">
                  <button
                    type="button"
                    onClick={() => onRoleChange('RETAILER')}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
                      currentRole !== 'GUEST' ? 'bg-[#5E1B42] text-white font-semibold' : 'text-[#6E5662]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Wholesale Rates
                  </button>
                  <button
                    type="button"
                    onClick={() => onRoleChange('GUEST')}
                    className={`px-2.5 py-1.5 rounded-lg ${
                      currentRole === 'GUEST' ? 'bg-white text-[#5E1B42] font-semibold' : 'text-[#6E5662]'
                    }`}
                  >
                    Guest View
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenRegister();
                  setMobileMenuOpen(false);
                }}
                className="md:hidden px-4 py-3 text-xs font-bold uppercase tracking-wide bg-[#5E1B42] text-white rounded-xl"
              >
                Register Wholesale Shop
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenArchitecture();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-xs font-semibold text-[#5E1B42] bg-[#FAF3E8] rounded-xl flex items-center justify-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" /> Platform Specs
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenAdminRoute();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-xs font-semibold text-[#5E1B42] bg-[#FAF3E8] rounded-xl flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Admin / Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
