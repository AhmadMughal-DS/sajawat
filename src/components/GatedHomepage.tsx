import React from 'react';
import { UserRole } from '../types/index.ts';
import { ShieldCheck, Truck, Factory, Award, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { FACTORY_METRICS } from '../data/mockB2BData.ts';

interface GatedHomepageProps {
  currentRole: UserRole;
  onOpenRegister: () => void;
  onBrowseCatalog: () => void;
  onSwitchToRetailer: () => void;
  onOpenArchitecture: () => void;
}

export const GatedHomepage: React.FC<GatedHomepageProps> = ({
  currentRole,
  onOpenRegister,
  onBrowseCatalog,
  onSwitchToRetailer,
  onOpenArchitecture,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Editorial B2B Hero Section */}
      <section className="relative overflow-hidden bg-[#FAF9F5] border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Brand Statement & Gated Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#97731B] uppercase">
                <span className="w-6 h-px bg-[#D4AF37]" />
                Exclusive B2B Garment Manufacturing & Wholesale
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1E1E1E] leading-[1.15]">
                Direct-from-Mill Stitched Apparel for Modern Boutiques.
              </h1>

              <p className="text-base sm:text-lg text-[#555555] max-w-2xl leading-relaxed">
                Sutura Atelier delivers production-grade stitched collections in women’s luxury pret,
                ceremonial festive wear, and children’s artisanal kurtas. Strictly wholesale access
                with rapid matrix ordering, guaranteed MOQs, and consolidated global cargo freight.
              </p>

              {/* Gated Access Notice Banner */}
              {currentRole === 'GUEST' && (
                <div className="bg-white border border-[#E0D7C6] rounded-xl p-5 shadow-xs max-w-xl">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 bg-[#FBF8EE] text-[#D4AF37] rounded-lg shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-[#1E1E1E]">
                        Strictly Gated Wholesale Pricing & Matrix Ordering
                      </h4>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        To protect retailer margins and ensure factory-direct integrity, wholesale pricing tiers and bulk order forms are restricted to registered business buyers with valid Resale Permits or Tax IDs.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={onOpenRegister}
                          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded transition-colors active:scale-98"
                        >
                          Apply for Wholesale Account
                        </button>
                        <button
                          type="button"
                          onClick={onSwitchToRetailer}
                          className="text-xs font-medium text-[#1E1E1E] hover:text-[#D4AF37] underline underline-offset-4"
                        >
                          Quick Switch to Approved Retailer View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentRole !== 'GUEST' && (
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onBrowseCatalog}
                    className="px-6 py-3 text-sm font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded shadow-sm transition-all flex items-center gap-2 active:scale-98"
                  >
                    Enter Wholesale Catalog
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenArchitecture}
                    className="px-5 py-3 text-sm font-medium text-[#1E1E1E] bg-white border border-neutral-300 hover:border-neutral-400 rounded transition-colors"
                  >
                    Inspect Full-Stack Architecture
                  </button>
                </div>
              )}

              {/* Manufacturing Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8E8E8]">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                    120,000+
                  </div>
                  <div className="text-xs text-[#777777] mt-0.5">Pcs/Mo Stitched Output</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                    14 SPI
                  </div>
                  <div className="text-xs text-[#777777] mt-0.5">Stitch Density Standard</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                    42
                  </div>
                  <div className="text-xs text-[#777777] mt-0.5">Countries Freight Support</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Atelier Showroom Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 lg:aspect-5/4 border border-[#E5E0D5]">
                <img
                  src="/src/assets/images/hero_b2b_textile_atelier_1792570274235.jpg"
                  alt="Sutura Atelier B2B Wholesale Showroom"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                      Live Showroom & Quality Control
                    </span>
                    <h3 className="text-base font-serif font-medium">
                      Spring/Summer 2026 Stitched Collections
                    </h3>
                    <p className="text-xs text-neutral-300">
                      Pure lawn, organza, raw silk, and coordinated kids festive lines ready for container dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Trust Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#FAF7ED] flex items-center justify-center text-[#D4AF37]">
              <Factory className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E1E1E] font-serif">
              Factory Direct Pricing
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              Eliminate multi-tiered middlemen, agent commissions, and trading markups. Source directly from our export-certified stitching lines with tiered bulk pricing up to 40% below wholesale trading hubs.
            </p>
            <div className="text-xs text-[#D4AF37] font-medium pt-1">
              Zero distributor margins · Transparent cost sheets
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#FAF7ED] flex items-center justify-center text-[#D4AF37]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E1E1E] font-serif">
              Verified Ethical Manufacturer
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              Sedex SMETA 4-Pillar Audited, ISO 9001:2015 compliant, and OEKO-TEX Standard 100 certified. Every bulk consignment passes rigorous 100% seam integrity, colorfastness, and AQL 1.5 inspections.
            </p>
            <div className="text-xs text-[#D4AF37] font-medium pt-1">
              Audit certificates available for retail compliance
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#FAF7ED] flex items-center justify-center text-[#D4AF37]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E1E1E] font-serif">
              Global Cargo & Customs Support
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              Seamless logistics integration offering FOB, CIF, and Delivered Duty Paid (DDP) by Air Priority or Ocean LCL/FCL. We handle export documentation, commercial invoices, and tariff harmonizations.
            </p>
            <div className="text-xs text-[#D4AF37] font-medium pt-1">
              Live airway bill & container tracking in buyer portal
            </div>
          </div>
        </div>
      </section>

      {/* Factory Floor & Capacity Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E1E1E] text-white rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-6 flex flex-col justify-center">
              <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                Production Floor & Facility Standards
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold leading-snug">
                Precision Lockstitch, Industrial Tajima Embroidery & Hand Finishing
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Our twin production units house 250+ Japanese Juki lockstitch stations and 36 multi-head Tajima embroidery beds. From intricate cutwork schiffli on pure organza to zero-scratch kidswear lining, each production batch meets international boutique requirements.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Double-needle overlocked seams with anti-fray bottom bindings</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Sanforized and pre-shrunk fabrics (0-1% residual shrinkage)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Pre-packaged in export master cartons with barcode polybags</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onBrowseCatalog}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#ba9324] text-[#1E1E1E] font-semibold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  View In-Stock Wholesale Lots
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-full">
              <img
                src="/src/assets/images/factory_stitching_production_floor_1792570276341.jpg"
                alt="Sutura Garment Stitching Plant"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
