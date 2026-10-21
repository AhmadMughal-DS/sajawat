import React from 'react';
import { ShieldCheck, Factory, Truck, MapPin } from 'lucide-react';

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
      <div className="bg-[#FAF3E8] border-b border-[#E5D5C0] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E1B42]">
              Sajawat® Garment Stitching &amp; Embroidery Units · Pakistan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221A1F] leading-tight">
              150,000+ Monthly Stitched Output for Pakistani Wholesalers &amp; Boutiques
            </h2>
            <p className="text-sm text-[#5E4A54] leading-relaxed max-w-2xl">
              Our dedicated stitching and multi-head Tajima embroidery plants produce export-grade{' '}
              <strong>Women’s 3-Piece Chiffon, 9000 Velvet, Dhanak Shawl &amp; Organza Suits</strong> and{' '}
              <strong>Kids’ Silk Sharara &amp; Velvet Sets</strong>. Every bundle is size-graded, steam-pressed, polybagged with barcodes, and dispatched via daily Bilti across Pakistan.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBrowseCatalog}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] text-white hover:bg-[#732252] rounded-xl transition-colors"
              >
                Browse Ready-to-Ship Lots
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-[#221A1F] hover:bg-[#c59b27] rounded-xl transition-colors"
              >
                Register Wholesale Shop
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#E0D8C8] shadow-lg aspect-16/10 bg-[#2F0B20] p-4 flex items-center justify-center">
            <img
              src="/sajawat-logo.webp"
              alt="Sajawat® Stitching & Wholesale Unit"
              className="w-full h-full object-contain rounded-xl bg-[#F7E8D4] p-4"
            />
          </div>
        </div>
      </div>

      {/* Production Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6D6C1] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#5E1B42]">150,000 Suits</div>
            <div className="text-sm font-bold text-[#221A1F]">Monthly Stitched Capacity</div>
            <p className="text-xs text-[#6B5360]">
              High-speed Juki lockstitch, overlock, and boutique finishing lines.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E6D6C1] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#5E1B42]">42 Heads</div>
            <div className="text-sm font-bold text-[#221A1F]">Tajima Zari &amp; Tilla Embroidery</div>
            <p className="text-xs text-[#6B5360]">
              Heavy bridal-pret tilla, resham, schiffli cutwork, and foil mirror work.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E6D6C1] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#5E1B42]">24–72 Hrs</div>
            <div className="text-sm font-bold text-[#221A1F]">All-Pakistan Bilti Dispatch</div>
            <p className="text-xs text-[#6B5360]">
              Daily consignments via TCS Overland, Daewoo FastEx, Leopard &amp; Truck Adda.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#E6D6C1] shadow-2xs space-y-2">
            <div className="text-2xl font-bold font-mono text-[#5E1B42]">100% Cotton</div>
            <div className="text-sm font-bold text-[#221A1F]">Zero-Scratch Kids Lining</div>
            <p className="text-xs text-[#6B5360]">
              Every kids’ chiffon and silk sharara suit includes soft breathable cotton inner lining.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
