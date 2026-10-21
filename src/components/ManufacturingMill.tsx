import React from 'react';
import { FACTORY_METRICS } from '../data/mockB2BData.ts';
import { ShieldCheck, CheckCircle2, Factory, Award, Truck, Layers, Scissors, Flame } from 'lucide-react';

interface ManufacturingMillProps {
  onBrowseCatalog: () => void;
  onOpenRegister: () => void;
}

export const ManufacturingMill: React.FC<ManufacturingMillProps> = ({
  onBrowseCatalog,
  onOpenRegister,
}) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Mill Hero */}
      <div className="bg-[#FAF9F5] border-b border-[#E8E6DF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#97731B]">
              Textile Mill & Garment Manufacturing Plant #2
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1E1E] leading-tight">
              Export-Standard Stitched Apparel Production Capacity
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed max-w-2xl">
              Operating across 85,000 sq ft of modern stitching and embroidery facilities. We specialize exclusively in contract manufacturing and private wholesale production for boutique owners, multi-door retailers, and departmental distributors across North America, the UK, Europe, and the Gulf.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBrowseCatalog}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#1E1E1E] text-white hover:bg-[#D4AF37] hover:text-[#1E1E1E] rounded transition-colors"
              >
                Explore Wholesale Lots
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] text-white hover:bg-[#ba9324] rounded transition-colors"
              >
                Request Custom Sample Swatches
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#E0D8C8] shadow-lg aspect-16/10">
            <img
              src="/src/assets/images/factory_stitching_production_floor_1792570276341.jpg"
              alt="Sutura Factory Production Line"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Production Infrastructure Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#D4AF37] tabular-nums">
              120,000 Pcs
            </div>
            <div className="text-sm font-semibold text-[#1E1E1E]">Monthly Stitched Capacity</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Full-line lockstitch, overlock, and flatlock operations with zero bottlenecking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#D4AF37] tabular-nums">
              36 Heads
            </div>
            <div className="text-sm font-semibold text-[#1E1E1E]">Industrial Tajima Embroidery</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Multi-color silk thread, tilla, cutwork schiffli, and zari micro-stitching.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#D4AF37] tabular-nums">
              14 SPI
            </div>
            <div className="text-sm font-semibold text-[#1E1E1E]">Stitch Density Guarantee</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Tight, smooth lockstitching with reinforced armholes and double-bound hemlines.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#D4AF37] tabular-nums">
              AQL 1.5
            </div>
            <div className="text-sm font-semibold text-[#1E1E1E]">Final Quality Audit Standard</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              100% pre-packing inspection ensuring zero seam distortion, dye bleeding, or mis-sizing.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance & Audit Certifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF7EE] text-[#D4AF37] rounded-xl border border-[#E6DCBF]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1E1E1E]">
                Ethical Audit Compliance & Retailer Verification Certificates
              </h3>
              <p className="text-xs text-[#666666]">
                Documents available for multi-door department store onboarding and retail compliance audits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 bg-[#FAF9F6] border border-[#ECEAE2] rounded-xl space-y-2 text-xs">
              <div className="font-bold text-[#1E1E1E] text-sm">Sedex SMETA 4-Pillar Audit</div>
              <p className="text-neutral-600">
                Labour Standards, Health & Safety, Environmental Assessment, and Business Ethics verified annually by independent third-party auditors.
              </p>
              <div className="text-[11px] font-mono text-[#97731B]">Certificate Ref: SMETA-PK-2026-992</div>
            </div>

            <div className="p-4 bg-[#FAF9F6] border border-[#ECEAE2] rounded-xl space-y-2 text-xs">
              <div className="font-bold text-[#1E1E1E] text-sm">ISO 9001:2015 Quality Management</div>
              <p className="text-neutral-600">
                Systematic process control from yarn inspection, dye colorfastness testing, pattern digitization, to carton sealing.
              </p>
              <div className="text-[11px] font-mono text-[#97731B]">Certificate Ref: ISO-QMS-448291</div>
            </div>

            <div className="p-4 bg-[#FAF9F6] border border-[#ECEAE2] rounded-xl space-y-2 text-xs">
              <div className="font-bold text-[#1E1E1E] text-sm">OEKO-TEX Standard 100 Class I & II</div>
              <p className="text-neutral-600">
                Harmful chemical-free certification safe for infant and children's delicate skin. Tested for azo dyes, formaldehyde, and heavy metals.
              </p>
              <div className="text-[11px] font-mono text-[#97731B]">Certificate Ref: OEKO-TEX-CH-82910</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
