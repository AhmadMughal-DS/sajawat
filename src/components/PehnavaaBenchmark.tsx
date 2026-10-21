import React, { useState } from 'react';
import { Check, X, Sparkles, Calculator } from 'lucide-react';

interface PehnavaaBenchmarkProps {
  onExploreCatalog: () => void;
  onOpenMatrixWithSample: () => void;
}

export const PehnavaaBenchmark: React.FC<PehnavaaBenchmarkProps> = ({
  onExploreCatalog,
}) => {
  // Pakistani Rupee (PKR) Boutique Profit Simulator
  const [calculatorSets, setCalculatorSets] = useState(48);
  const [retailResalePricePkr, setRetailResalePricePkr] = useState(5800);

  // Typical Pehnavaa single-piece retail/semi-wholesale price vs Sajawat Tier 3 wholesale rate
  const pehnavaaUnitCostPkr = 4650;
  const sajawatUnitCostPkr = 2850;

  const pehnavaaTotalCost = calculatorSets * pehnavaaUnitCostPkr;
  const sajawatTotalCost = calculatorSets * sajawatUnitCostPkr;
  const totalBoutiqueRevenue = calculatorSets * retailResalePricePkr;

  const pehnavaaBoutiqueProfit = totalBoutiqueRevenue - pehnavaaTotalCost;
  const sajawatBoutiqueProfit = totalBoutiqueRevenue - sajawatTotalCost;
  const additionalProfitEarned = sajawatBoutiqueProfit - pehnavaaBoutiqueProfit;
  const marginPercentage = Number(((sajawatBoutiqueProfit / totalBoutiqueRevenue) * 100).toFixed(1));

  const comparisonPillars = [
    {
      pillar: 'Pakistan Wholesale Pricing & Margin Defense',
      pehnavaa:
        'Public consumer retail prices (Rs. 2,599–10,499) shown to everyone; end-customers see the same prices as shopkeepers.',
      sajawat:
        'Dedicated Factory Wholesale Tiers (Rs. 1,320–4,190/suit) with 1-click Wholesale Gating so your boutique markup stays protected.',
      advantage: 'Earn Rs. 1,200 to Rs. 3,200 clear profit on every stitched suit.',
    },
    {
      pillar: 'Bulk Set & Size Curve Ordering',
      pehnavaa:
        'Consumer 1-by-1 add-to-cart or slow WhatsApp voice-note negotiation for bundles.',
      sajawat:
        'Instant Bulk Order Matrix & 1-Click Set Bundles across S, M, L, XL and Kids 2Y–12Y.',
      advantage: 'Build a 48-suit multi-design wholesale PO in under 30 seconds.',
    },
    {
      pillar: 'Non-Clickable Full Set Colorways & Auto S3 Pipeline',
      pehnavaa:
        'Inconsistent consumer product variants without wholesale bundle clarity.',
      sajawat:
        'Pre-balanced non-clickable bundle colorways with high-res studio photos served from AWS S3 (`sajawat-wholesale-assets`) & MongoDB.',
      advantage: 'Guaranteed color assortment in every gaddi/bundle with zero dead variant links.',
    },
    {
      pillar: 'All-Pakistan Bilti & Cargo Integration',
      pehnavaa:
        'Standard single-parcel retail courier charges.',
      sajawat:
        'Master Carton Bilti via TCS Overland, Daewoo FastEx, Leopard Cargo & Truck Adda to Lahore, Karachi, Faisalabad, Rawalpindi & Multan.',
      advantage: 'Lowest per-suit freight cost in Pakistan (24–72 hour delivery).',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      <div className="bg-gradient-to-br from-white via-[#FAF8F4] to-[#F2ECE1] text-stone-900 border-b border-stone-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#5E1B42] uppercase">
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
            Pakistan Wholesale Benchmark Audit (2026)
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Why Pakistani Boutiques Choose Sajawat® Over www.pehnavaa.com
          </h2>
          <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
            Compare <strong>Sajawat® (Stitched Women &amp; Kids Wholesale)</strong> against consumer-focused websites like <strong>pehnavaa.com</strong> across factory pricing, bundle ordering, Bilti logistics, and AWS S3 + MongoDB cloud speed.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison — stacked cards on mobile, table on md+ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="md:hidden space-y-4">
          {comparisonPillars.map((row, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#E6D6C1] overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-[#FAF3E8] border-b border-[#E5D5C0] font-bold text-sm text-[#221A1F]">
                {row.pillar}
              </div>
              <div className="p-4 space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-2 text-[#5E4A54]">
                  <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A5B6B] mb-0.5">pehnavaa.com</div>
                    {row.pehnavaa}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[#221A1F] bg-[#FDF9FB] border border-[#F3D1E2] rounded-xl p-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5E1B42]">Sajawat® Wholesale</div>
                    <div className="font-semibold">{row.sajawat}</div>
                    <div className="text-[11px] text-[#5E1B42] font-bold">→ {row.advantage}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block bg-white rounded-2xl border border-[#E6D6C1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF3E8] border-b border-[#E5D5C0] text-[#221A1F]">
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider w-1/4">
                    Wholesale Dimension
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider w-1/3 text-[#7A5B6B]">
                    www.pehnavaa.com (Retail Store)
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider w-5/12 text-[#5E1B42] bg-[#FDF4F8]">
                    Sajawat® Wholesale Pakistan (100% Level-Up)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6D8]">
                {comparisonPillars.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-4 px-5 font-bold text-[#221A1F] align-top">{row.pillar}</td>
                    <td className="py-4 px-5 text-[#5E4A54] align-top leading-relaxed">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.pehnavaa}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 bg-[#FDF9FB] align-top space-y-1.5 leading-relaxed">
                      <div className="flex items-start gap-2 text-[#221A1F] font-semibold">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.sajawat}</span>
                      </div>
                      <div className="text-[11px] text-[#5E1B42] font-bold pl-6">
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

      {/* Interactive PKR Boutique Profit Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#2F0B20] to-[#471231] text-white rounded-2xl p-5 sm:p-10 shadow-xl space-y-8 border border-[#732252]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-[#F5D77F] uppercase flex items-center gap-1.5">
                <Calculator className="w-4 h-4 shrink-0" />
                Boutique Profit Calculator (PKR)
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                Calculate Your Shop’s Extra Profit with Sajawat® Factory Rates
              </h3>
            </div>

            <div className="bg-black/30 p-3.5 rounded-xl border border-[#F5D77F]/40 md:text-right shrink-0">
              <div className="text-[11px] text-[#EAD2DF]">Extra Boutique Profit Earned:</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#F5D77F] tabular-nums">
                +Rs. {additionalProfitEarned.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs mb-2">
                  <span className="text-[#EAD2DF] font-medium">Wholesale Order Quantity:</span>
                  <span className="font-mono font-bold text-[#F5D77F] text-sm tabular-nums">
                    {calculatorSets} Suits
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="240"
                  step="12"
                  value={calculatorSets}
                  aria-label="Wholesale order quantity"
                  onChange={(e) => setCalculatorSets(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F5D77F] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs mb-2">
                  <span className="text-[#EAD2DF] font-medium">Your Selling Price per Suit:</span>
                  <span className="font-mono font-bold text-[#F5D77F] text-sm tabular-nums">
                    Rs. {retailResalePricePkr.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="3800"
                  max="9500"
                  step="200"
                  value={retailResalePricePkr}
                  aria-label="Boutique selling price per suit"
                  onChange={(e) => setRetailResalePricePkr(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F5D77F] cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 sm:p-6 border border-white/15 space-y-3.5 text-xs">
              <div className="space-y-2.5">
                <div className="flex justify-between gap-3 text-[#EAD2DF]">
                  <span>Cost via Retail (Rs. 4,650/suit)</span>
                  <span className="font-mono tabular-nums whitespace-nowrap">Rs. {pehnavaaTotalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-3 text-emerald-300 font-bold">
                  <span>Cost via Sajawat® (Rs. 2,850/suit)</span>
                  <span className="font-mono tabular-nums whitespace-nowrap">Rs. {sajawatTotalCost.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/15" />
                <div className="flex justify-between gap-3 text-white">
                  <span>Total Sales Revenue</span>
                  <span className="font-mono font-bold tabular-nums whitespace-nowrap">Rs. {totalBoutiqueRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-3 text-[#F5D77F] font-bold text-sm">
                  <span>Net Profit ({marginPercentage}% margin)</span>
                  <span className="font-mono tabular-nums whitespace-nowrap">Rs. {sajawatBoutiqueProfit.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onExploreCatalog}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#F5D77F] hover:bg-[#D4AF37] text-[#221A1F] rounded-xl transition-colors"
              >
                Order Wholesale Bundles Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
