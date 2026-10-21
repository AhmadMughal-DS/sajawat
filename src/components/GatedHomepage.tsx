import React from 'react';
import { UserRole } from '../types/index.ts';
import {
  Truck,
  ArrowRight,
  Lock,
  Sparkles,
  MapPin,
  BadgePercent,
  Layers,
  MessageCircle,
} from 'lucide-react';

interface GatedHomepageProps {
  currentRole: UserRole;
  onOpenRegister: () => void;
  onBrowseCatalog: (category?: 'ALL' | 'WOMENS_STITCHED' | 'KIDS_STITCHED') => void;
  onSwitchToRetailer: () => void;
  onOpenArchitecture: () => void;
}

export const GatedHomepage: React.FC<GatedHomepageProps> = ({
  currentRole,
  onOpenRegister,
  onBrowseCatalog,
  onSwitchToRetailer,
}) => {
  return (
    <div className="space-y-10 pb-6">
      {/* Luminous Luxury Pakistani Wholesale Editorial Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF8F4] to-[#F2ECE1] text-stone-900 border-b border-stone-200/80">
        {/* Soft luminous ambient accents */}
        <div className="pointer-events-none absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full bg-[#D4AF37]/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 w-[420px] h-[420px] rounded-full bg-[#8B3264]/8 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Sajawat® Brand Statement & Pakistan Wholesale Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-2xs border border-stone-200/90 text-[10px] sm:text-xs font-bold tracking-wider text-[#5E1B42] uppercase max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                <span className="truncate">
                  Pakistan’s #1 Factory-Direct<span className="hidden sm:inline"> Stitched Wholesale Platform</span>
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-stone-900 leading-[1.12]">
                <span className="text-[#5E1B42]">Sajawat®</span> Stitched Women &amp; Kids Wholesale —{' '}
                <span className="italic font-normal text-[#8B3264]">38% Below Retail</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
                Built for Pakistani boutique owners, garment shopkeepers, and wholesale resellers across{' '}
                <strong className="text-stone-900">
                  Karachi, Lahore, Faisalabad, Rawalpindi, Islamabad &amp; Multan
                </strong>
                . Source factory-direct <strong className="text-stone-900">Women’s 3-Piece Chiffon, 9000 Shahi Velvet &amp; Dhanak Shawl Suits</strong>{' '}
                and <strong className="text-stone-900">Kids’ Festive Silk Sharara &amp; Velvet Sets</strong> in ready-to-sell size bundles with 24–72 hour Bilti dispatch.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onBrowseCatalog('ALL')}
                  className="px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  Explore Wholesale Catalog
                  <ArrowRight className="w-4 h-4 text-[#F5D77F]" />
                </button>

                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-5 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 rounded-xl transition-colors text-center shadow-2xs"
                >
                  Register Boutique / Shop
                </button>
              </div>

              {/* Role Gating Notice (if user switched to Guest mode) */}
              {currentRole === 'GUEST' && (
                <div className="bg-white border border-amber-200 rounded-2xl p-4 max-w-xl shadow-xs">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#5E1B42] shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-stone-900">
                        Guest Preview Mode Active — Wholesale Tier Rates Locked
                      </div>
                      <p className="text-stone-600">
                        Click below to unlock live Factory FOB/Bilti wholesale tier rates and interactive color/size ordering immediately.
                      </p>
                      <button
                        type="button"
                        onClick={onSwitchToRetailer}
                        className="px-3.5 py-1.5 bg-[#5E1B42] text-white font-bold rounded-lg text-xs hover:bg-[#732252] transition-colors"
                      >
                        1-Click Unlock Wholesale Prices
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Wholesale Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#5E1B42] tabular-nums">
                    Rs. 1,320
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Kids 3-Pc Starting</div>
                </div>
                <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#5E1B42] tabular-nums">
                    Rs. 2,100
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Women 3-Pc Starting</div>
                </div>
                <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#5E1B42] tabular-nums">
                    12–18 Sets
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Low Boutique MOQ</div>
                </div>
                <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-3.5 shadow-2xs">
                  <div className="text-lg sm:text-xl font-bold font-mono text-[#5E1B42] tabular-nums">
                    24–72 Hrs
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">All-Pakistan Bilti</div>
                </div>
              </div>
            </div>

            {/* Right Column: Dual Visual Showcase (Women & Kids S3 Product Cards) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onBrowseCatalog('WOMENS_STITCHED')}
                className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-lg aspect-3/4 text-left focus:outline-none"
              >
                <img
                  src="https://sajawat-wholesale-assets.s3.us-east-1.amazonaws.com/catalog/SJW-W-2026-CHF01_1200w.webp"
                  alt="Women's Stitched Wholesale Suits Pakistan — Chiffon, Velvet & Dhanak"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5 sm:p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5D77F] font-semibold">
                    8 Lots · MOQ 12
                  </span>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                    Women’s Stitched
                  </h2>
                  <p className="hidden sm:block text-[11px] text-stone-200 mt-0.5">
                    Chiffon 3-Pc, 9000 Velvet &amp; Dhanak
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#F5D77F] group-hover:translate-x-1 transition-transform">
                    Explore Women’s <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onBrowseCatalog('KIDS_STITCHED')}
                className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-lg aspect-3/4 text-left focus:outline-none"
              >
                <img
                  src="https://sajawat-wholesale-assets.s3.us-east-1.amazonaws.com/catalog/SJW-K-2026-SHR01_1200w.webp"
                  alt="Kids' Stitched Festive Wholesale Pakistan — Silk Sharara & Velvet Sets"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5 sm:p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5D77F] font-semibold">
                    8 Lots · MOQ 18
                  </span>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-white leading-tight mt-0.5">
                    Kids’ Festive
                  </h2>
                  <p className="hidden sm:block text-[11px] text-stone-200 mt-0.5">
                    Silk Sharara 3-Pc &amp; Velvet (2Y–12Y)
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#F5D77F] group-hover:translate-x-1 transition-transform">
                    Explore Kids’ <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pakistan Wholesale Market Hubs Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FDF4F8] text-[#5E1B42] border border-[#F3D1E2] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                Daily Wholesale Bilti Supply Across Pakistan’s Top Garment Markets
              </h2>
              <p className="text-xs text-stone-500">
                Direct master carton delivery via TCS Overland, Daewoo FastEx, Leopard Cargo &amp; Truck Adda:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            {[
              'Lahore (Azam Market · Liberty · Gulberg)',
              'Karachi (Tariq Rd · Jama Cloth · Bolton)',
              'Faisalabad (Karkhana Bazar · D-Ground)',
              'Rawalpindi (Raja Bazar · Rabi Center)',
              'Multan & Gujranwala',
              'UK / USA / UAE Boutiques',
            ].map((hub) => (
              <span
                key={hub}
                className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-800"
              >
                {hub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core B2B Advantage Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FDF4F8] border border-[#F3D1E2] flex items-center justify-center text-[#5E1B42]">
              <BadgePercent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif">
              35%–42% Cheaper Than www.pehnavaa.com
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Direct mill wholesale rates starting at <strong>Rs. 1,320 (Kids)</strong> and <strong>Rs. 2,100 (Women)</strong> so boutique owners earn Rs. 1,200–3,500 clear profit per suit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FDF4F8] border border-[#F3D1E2] flex items-center justify-center text-[#5E1B42]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif">
              Click Any Product for Full Details &amp; Colors
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Clean, uncluttered catalog browsing — click any stitched suit to open its dedicated product page with interactive color selection, size breakdown, and fabric specs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#FDF4F8] border border-[#F3D1E2] flex items-center justify-center text-[#5E1B42]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif">
              AWS S3 + MongoDB Automated Pipeline
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Powered by AWS S3 (<code className="font-mono text-[11px] text-[#5E1B42]">sajawat-wholesale-assets</code>) and MongoDB Atlas (<code className="font-mono text-[11px] text-[#5E1B42]">sajawat_wholesale</code>) for instant catalog updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
