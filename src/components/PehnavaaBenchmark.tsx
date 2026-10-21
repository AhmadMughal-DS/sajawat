import React, { useState } from 'react';
import {
  Check,
  X,
  TrendingUp,
  ShieldCheck,
  Grid3X3,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Calculator,
  Award,
  Zap,
} from 'lucide-react';

interface PehnavaaBenchmarkProps {
  onExploreCatalog: () => void;
  onOpenMatrixWithSample: () => void;
}

export const PehnavaaBenchmark: React.FC<PehnavaaBenchmarkProps> = ({
  onExploreCatalog,
  onOpenMatrixWithSample,
}) => {
  // Margin calculator state
  const [calculatorSets, setCalculatorSets] = useState(120);
  const [retailResalePrice, setRetailResalePrice] = useState(85.0); // What boutique sells it for ($)

  // Comparative Cost calculations
  // Pehnavaa typical consumer retail / wholesale inquiry price per stitched 3pc: ~$52 - $58 USD
  const pehnavaaUnitCost = 54.0;
  // Sutura Tier 3 Mill-direct price: ~$32.50 USD
  const suturaUnitCost = 32.5;

  const pehnavaaTotalCost = calculatorSets * pehnavaaUnitCost;
  const suturaTotalCost = calculatorSets * suturaUnitCost;
  const totalBoutiqueRevenue = calculatorSets * retailResalePrice;

  const pehnavaaBoutiqueProfit = totalBoutiqueRevenue - pehnavaaTotalCost;
  const suturaBoutiqueProfit = totalBoutiqueRevenue - suturaTotalCost;
  const additionalProfitEarned = suturaBoutiqueProfit - pehnavaaBoutiqueProfit;
  const marginPercentage = Number(((suturaBoutiqueProfit / totalBoutiqueRevenue) * 100).toFixed(1));

  const comparisonPillars = [
    {
      pillar: 'Wholesale Pricing & Access Gating',
      pehnavaa: 'Public consumer retail prices displayed; no gated access. Retailer margins are visible to consumers.',
      sutura: 'Strictly gated B2B portal. Tax ID / Resale License required to view FOB Mill volume tier rates ($/set).',
      advantage: 'Protects boutique retail markup and prevents price erosion.',
    },
    {
      pillar: 'Bulk Ordering Workflow',
      pehnavaa: 'Consumer 1-by-1 product pages or manual back-and-forth WhatsApp chat negotiation.',
      sutura: 'High-density Bulk Order Matrix. Enter 100+ sets across S, M, L, XL, XXL and 4 colorways simultaneously.',
      advantage: 'Reduces wholesale order creation time from hours of chat to under 30 seconds.',
    },
    {
      pillar: 'Volume Pricing Tiers & MOQs',
      pehnavaa: 'Fixed consumer price per piece. Bulk discount inquiries are negotiated informally via chat.',
      sutura: 'Automated dynamic volume tiers (e.g. 24–49: $44.50, 50–99: $38.00, 100+: $32.50) with live upsell cues.',
      advantage: 'Predictable contract pricing with transparent factory cost sheets.',
    },
    {
      pillar: 'Retailer Marketing Asset Pipeline',
      pehnavaa: 'No downloadable asset kits. Retailers must capture screenshots or shoot their own lookbooks.',
      sutura: 'Automated 1-click ZIP Asset Kits containing 4K studio lookbooks, 1:1 IG squares, 9:16 stories, and clean white cutouts.',
      advantage: 'Boutiques can launch presales on Shopify & Instagram weeks before air freight delivery.',
    },
    {
      pillar: 'Export Logistics & Master Packaging',
      pehnavaa: 'Standard parcel courier or informal forwarding with manual freight quotes.',
      sutura: 'Automated export carton calculation, gross cargo kg, CBM volume, and FOB/CIF/DDP Incoterms with live tracking.',
      advantage: 'Avoids port customs surprises and reduces air/ocean freight landed costs.',
    },
    {
      pillar: 'Technical Architecture & Speed',
      pehnavaa: 'Standard consumer CMS (Shopify/WooCommerce) with standard plugins.',
      sutura: 'Next.js App Router, FastAPI asynchronous core, Pillow multi-scale WebP engine, and Docker microservices.',
      advantage: 'Instant response times with zero lag during high-volume wholesale catalog lookups.',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <div className="bg-[#FAF9F5] border-b border-[#E8E6DF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#97731B] uppercase">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            B2B Architectural & Commercial Benchmark
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1E1E]">
            Comparative Benchmark: Sutura B2B vs. www.pehnavaa.com
          </h2>
          <p className="text-sm text-[#555555] max-w-3xl leading-relaxed">
            While <strong>Pehnavaa (pehnavaa.com)</strong> is an established consumer destination for stitched ethnic wear (including 3-piece chiffon suits, Nayab velvet, and festive girlswear), bulk boutique buyers and multi-door retailers require a purpose-built B2B manufacturing engine. Below is a comprehensive feature, workflow, and financial comparative analysis.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1E1E1E]">
              Feature-by-Feature Operational Comparison
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Analyzing wholesale functionality, boutique margin defense, and technical architecture.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
            Benchmark Audit Q4 2026
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE6DD] text-[#333333]">
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider w-1/4">
                    Capability / Dimension
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider w-1/3 text-neutral-500">
                    www.pehnavaa.com (Consumer / Traditional)
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider w-5/12 text-[#97731B] bg-[#FBF8EE]">
                    Sutura B2B Wholesale Atelier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {comparisonPillars.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-5 font-bold text-[#1E1E1E] align-top">
                      {row.pillar}
                    </td>
                    <td className="py-4 px-5 text-neutral-600 align-top leading-relaxed">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.pehnavaa}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 bg-[#FDFBF7] align-top space-y-1.5 leading-relaxed">
                      <div className="flex items-start gap-2 text-[#1E1E1E] font-medium">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.sutura}</span>
                      </div>
                      <div className="text-[11px] text-[#97731B] font-semibold pl-6">
                        → {row.advantage}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Interactive Margin & Profitability ROI Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E1E1E] text-white rounded-2xl p-8 sm:p-10 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-700 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                B2B Retailer Financial Simulator
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
                Boutique Profitability: Sutura Factory Direct vs. Pehnavaa Sourcing
              </h3>
              <p className="text-xs text-neutral-300">
                Simulate your wholesale consignment economics based on real FOB Mill price tier breaks.
              </p>
            </div>

            <div className="bg-[#2B2B2E] p-3 rounded-xl border border-neutral-700 text-right">
              <div className="text-[11px] text-neutral-400">Net Additional Margin Gain:</div>
              <div className="text-2xl font-bold font-mono text-[#D4AF37] tabular-nums">
                +${additionalProfitEarned.toLocaleString()} USD
              </div>
            </div>
          </div>

          {/* Calculator Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-neutral-300 font-medium">Bulk Order Consignment Size:</span>
                  <span className="font-mono font-bold text-[#D4AF37] text-sm tabular-nums">
                    {calculatorSets} Stitched Sets
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="500"
                  step="12"
                  value={calculatorSets}
                  onChange={(e) => setCalculatorSets(parseInt(e.target.value, 10))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-1">
                  <span>MOQ (24 Sets)</span>
                  <span>100 Sets (Tier 3)</span>
                  <span>500 Sets (Container)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-neutral-300 font-medium">Boutique Retail Selling Price:</span>
                  <span className="font-mono font-bold text-[#D4AF37] text-sm tabular-nums">
                    ${retailResalePrice.toFixed(2)} / Set
                  </span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="140"
                  step="5"
                  value={retailResalePrice}
                  onChange={(e) => setRetailResalePrice(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-1">
                  <span>$55 (Everyday Pret)</span>
                  <span>$85 (Luxury Lawn/Chiffon)</span>
                  <span>$140 (Festive Velvet)</span>
                </div>
              </div>
            </div>

            {/* Financial Results Breakdown Card */}
            <div className="bg-[#2A2A2E] rounded-xl p-6 border border-neutral-700 space-y-4 text-xs">
              <div className="text-sm font-semibold text-white border-b border-neutral-700 pb-2">
                Consignment Cost & Net Profit Comparison ({calculatorSets} Sets):
              </div>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Sourcing via Pehnavaa Wholesale/Retail ($54/set):</span>
                  <span className="text-neutral-300">${pehnavaaTotalCost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Sourcing via Sutura Factory Direct ($32.50/set):</span>
                  <span>${suturaTotalCost.toLocaleString()}</span>
                </div>

                <div className="h-px bg-neutral-700" />

                <div className="flex justify-between text-neutral-300">
                  <span>Gross Retail Revenue at Boutique:</span>
                  <span className="font-bold text-white">${totalBoutiqueRevenue.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span>Pehnavaa Net Profit:</span>
                  <span>${pehnavaaBoutiqueProfit.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[#D4AF37] font-bold text-sm">
                  <span>Sutura Net Profit ({marginPercentage}% Margin):</span>
                  <span>${suturaBoutiqueProfit.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-[#1E1E1E] rounded transition-colors"
                >
                  Source Comparable Stitched Lines at Factory Direct Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stitched Product Line Equivalence Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#1E1E1E]">
            Stitched Collections: Pehnavaa Equivalents in Sutura B2B
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Compare Sutura’s manufacturing specs against Pehnavaa’s top-selling stitched collections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-3">
            <span className="text-[10px] uppercase tracking-wide font-mono text-neutral-500">
              Pehnavaa Category 01
            </span>
            <h4 className="font-serif text-base font-bold text-[#1E1E1E]">
              Chiffon Cutwork & Embroidered 3-Piece Suits
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pehnavaa’s popular chiffon collection with delicate neckline cutwork and flared trousers.
            </p>
            <div className="p-3 bg-[#FAF9F5] border border-[#E8E4D8] rounded-lg text-xs space-y-1">
              <div className="font-semibold text-[#1E1E1E]">Sutura Factory Spec:</div>
              <div className="text-neutral-600">
                80 GSM Pure Raw Silk / Chiffon with 14 SPI Schiffli Cutwork neckline and dual-needle bound trousers. MOQ: 24 Sets.
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-3">
            <span className="text-[10px] uppercase tracking-wide font-mono text-neutral-500">
              Pehnavaa Category 02
            </span>
            <h4 className="font-serif text-base font-bold text-[#1E1E1E]">
              Nayab Velvet & Luxury Pret Ensembles
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Heavily embellished micro-velvet winter formal wear with zari threadwork and pure organza shawls.
            </p>
            <div className="p-3 bg-[#FAF9F5] border border-[#E8E4D8] rounded-lg text-xs space-y-1">
              <div className="font-semibold text-[#1E1E1E]">Sutura Factory Spec:</div>
              <div className="text-neutral-600">
                Grade-A 9000 Micro-velvet, industrial Tajima zari needles, anti-shed pile, and pre-shrunk organza insets. MOQ: 20 Sets.
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#EAEAEA] shadow-2xs space-y-3">
            <span className="text-[10px] uppercase tracking-wide font-mono text-neutral-500">
              Pehnavaa Category 03
            </span>
            <h4 className="font-serif text-base font-bold text-[#1E1E1E]">
              Kids Festive Fancy Chiffon & Gharara Sets
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Girls’ festive partywear dresses, coordinated ghararas, and boys’ jacquard waistcoats.
            </p>
            <div className="p-3 bg-[#FAF9F5] border border-[#E8E4D8] rounded-lg text-xs space-y-1">
              <div className="font-semibold text-[#1E1E1E]">Sutura Factory Spec:</div>
              <div className="text-neutral-600">
                100% skin-safe OEKO-TEX certified cotton voile lining (zero scratch), soft elasticated waists, and durable resham motifs. MOQ: 36 Sets.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
