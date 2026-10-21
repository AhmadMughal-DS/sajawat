import React, { useState, useMemo } from 'react';
import { ClothingProduct, MatrixInput } from '../types/index.ts';
import {
  calculateMatrixTotalPieces,
  calculateTierPrice,
  calculateLogisticsPackaging,
  formatCurrency,
} from '../utils/b2bLogic.ts';
import { X, CheckCircle, AlertCircle, PackageCheck, Sparkles, Box, TrendingUp } from 'lucide-react';

interface BulkOrderMatrixModalProps {
  product: ClothingProduct | null;
  currency?: 'PKR' | 'USD';
  onClose: () => void;
  onAddToCart: (
    product: ClothingProduct,
    matrix: MatrixInput,
    totalPieces: number,
    unitPrice: number,
    subtotal: number,
    cartonCount: number,
    grossWeightKg: number
  ) => void;
}

export const BulkOrderMatrixModal: React.FC<BulkOrderMatrixModalProps> = ({
  product,
  currency = 'PKR',
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [matrix, setMatrix] = useState<MatrixInput>(() => {
    const initial: MatrixInput = {};
    product.colorways.forEach((c) => {
      initial[c.id] = {};
      product.sizeRange.forEach((s) => {
        initial[c.id][s] = 0;
      });
    });
    return initial;
  });

  const totalPieces = useMemo(() => calculateMatrixTotalPieces(matrix), [matrix]);

  const tierResult = useMemo(
    () => calculateTierPrice(totalPieces, product.pricingTiers, product.moq),
    [totalPieces, product.pricingTiers, product.moq]
  );

  const packaging = useMemo(
    () => calculateLogisticsPackaging(totalPieces, product.gramsPerPiece, product.piecesPerCarton),
    [totalPieces, product.gramsPerPiece, product.piecesPerCarton]
  );

  const retailBenchmark = product.retailBenchmarkPkr || Math.round((product.pricingTiers[0]?.pricePerUnit || 3000) * 1.62);
  const estimatedBoutiqueProfit = Math.max(0, totalPieces * (retailBenchmark - tierResult.unitPrice));

  const handleCellChange = (colorwayId: string, sizeCode: string, value: string) => {
    const parsed = parseInt(value, 10);
    const safeVal = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setMatrix((prev: MatrixInput) => ({
      ...prev,
      [colorwayId]: {
        ...prev[colorwayId],
        [sizeCode]: safeVal,
      },
    }));
  };

  // Fill exact target bundle count across colorways & sizes
  const applyBundlePreset = (perCellQty: number) => {
    setMatrix(() => {
      const updated: MatrixInput = {};
      product.colorways.forEach((c) => {
        updated[c.id] = {};
        product.sizeRange.forEach((s) => {
          updated[c.id][s] = perCellQty;
        });
      });
      return updated;
    });
  };

  const clearMatrix = () => {
    setMatrix(() => {
      const reset: MatrixInput = {};
      product.colorways.forEach((c) => {
        reset[c.id] = {};
        product.sizeRange.forEach((s) => {
          reset[c.id][s] = 0;
        });
      });
      return reset;
    });
  };

  const columnTotals = useMemo(() => {
    const totals: { [size: string]: number } = {};
    product.sizeRange.forEach((size) => {
      let sum = 0;
      product.colorways.forEach((c) => {
        sum += matrix[c.id]?.[size] || 0;
      });
      totals[size] = sum;
    });
    return totals;
  }, [matrix, product.colorways, product.sizeRange]);

  const handleConfirmOrder = () => {
    if (totalPieces === 0) return;
    onAddToCart(
      product,
      matrix,
      totalPieces,
      tierResult.unitPrice,
      tierResult.subtotal,
      packaging.cartonCount,
      packaging.totalWeightKg
    );
    onClose();
  };

  const cellsCount = product.colorways.length * product.sizeRange.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrix-order-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-5xl w-full shadow-2xl border border-[#E5D5C0] overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2F0B20] to-[#471231] text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#732252] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-11 h-14 sm:w-14 sm:h-16 rounded-xl bg-white/10 overflow-hidden shrink-0 border border-[#E5C158]/50">
              <img
                src={product.catalogImage}
                alt={product.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-bold text-[#221A1F] bg-[#F5D77F] px-2 py-0.5 rounded">
                  {product.sku}
                </span>
                <span className="hidden sm:inline text-[#E5C158]">·</span>
                <span className="hidden sm:inline text-[#F3DCE8] truncate">{product.collection}</span>
              </div>
              <h2 id="matrix-order-title" className="font-serif text-base sm:text-xl font-bold text-white mt-0.5 line-clamp-2">
                {product.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bulk order matrix modal"
            className="p-2 text-[#EAD2DF] hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Dynamic Tier Cards Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#5E1B42]">
                Sajawat® Factory Wholesale Volume Tiers (Per Stitched Set):
              </span>
              <span className="text-[#6B5360]">
                Minimum Wholesale Bundle (MOQ): <strong className="text-[#221A1F]">{product.moq} Sets</strong> · Market Retail:{' '}
                <strong className="line-through text-neutral-500">{formatCurrency(retailBenchmark, currency)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {product.pricingTiers.map((tier, idx) => {
                const isActive = tierResult.activeTierIndex === idx && totalPieces > 0;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#FDF4F8] border-[#5E1B42] ring-2 ring-[#5E1B42]/20 shadow-xs'
                        : 'bg-[#FAF6F0] border-[#E6D6C1] text-[#5E4A54]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold">
                        {tier.maxQty ? `${tier.minQty} – ${tier.maxQty} sets` : `${tier.minQty}+ sets (Master Rate)`}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-[#5E1B42] text-[#F5D77F] rounded">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xl font-bold text-[#221A1F] tabular-nums mt-1">
                      {formatCurrency(tier.pricePerUnit, currency)}
                      <span className="text-xs font-normal text-[#6B5360] ml-1">/ set</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Tier Incentive Alert */}
            {tierResult.nextTier && (
              <div className="p-2.5 bg-[#FDF4F8] border border-[#EBC5D8] rounded-xl text-xs text-[#5E1B42] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                <span>
                  Volume Discount Alert: Add <strong>{tierResult.nextTier.unitsNeeded} more sets</strong> to unlock{' '}
                  <strong>{formatCurrency(tierResult.nextTier.pricePerUnit, currency)}/set</strong> (Save{' '}
                  {formatCurrency(tierResult.nextTier.savingsPerUnit, currency)} per suit)!
                </span>
              </div>
            )}
          </div>

          {/* Quick Pakistani Bundle Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#5E4A54] font-semibold">Quick Gaddi / Bundle Fill:</span>
              <button
                type="button"
                onClick={() => applyBundlePreset(1)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#FAF3E8] hover:bg-[#5E1B42] hover:text-white text-[#5E1B42] border border-[#E2D0B8] rounded-lg transition-colors"
              >
                1 Set Bundle ({cellsCount} Suits)
              </button>
              <button
                type="button"
                onClick={() => applyBundlePreset(2)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#FAF3E8] hover:bg-[#5E1B42] hover:text-white text-[#5E1B42] border border-[#E2D0B8] rounded-lg transition-colors"
              >
                2 Set Bundles ({cellsCount * 2} Suits)
              </button>
              <button
                type="button"
                onClick={() => applyBundlePreset(4)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#FAF3E8] hover:bg-[#5E1B42] hover:text-white text-[#5E1B42] border border-[#E2D0B8] rounded-lg transition-colors"
              >
                Master Carton ({cellsCount * 4} Suits)
              </button>
            </div>
            <button
              type="button"
              onClick={clearMatrix}
              className="text-xs text-[#6B5360] hover:text-red-600 font-semibold underline"
            >
              Reset Matrix to 0
            </button>
          </div>

          {/* Bulk Order Matrix Table */}
          <div className="border border-[#E5D5C0] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF3E8] border-b border-[#E5D5C0] text-[#3D2B35]">
                    <th className="py-3 px-3 sm:px-4 font-bold min-w-36 sticky left-0 z-10 bg-[#FAF3E8]">Bundle Color</th>
                    {product.sizeRange.map((size) => (
                      <th key={size} className="py-3 px-2 font-bold text-center w-24">
                        Size {size}
                      </th>
                    ))}
                    <th className="py-3 px-3 font-bold text-right w-28">Color Total</th>
                    <th className="py-3 px-3 font-semibold text-right w-24 text-[#7A5B6B]">
                      Ready Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6D8]">
                  {product.colorways.map((c) => {
                    let rowSum = 0;
                    product.sizeRange.forEach((s) => {
                      rowSum += matrix[c.id]?.[s] || 0;
                    });

                    return (
                      <tr key={c.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-[#221A1F] pointer-events-none select-none sticky left-0 z-10 bg-white">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                              style={{ backgroundColor: c.hexCode }}
                            />
                            <span>{c.name}</span>
                          </div>
                        </td>

                        {product.sizeRange.map((size) => {
                          const val = matrix[c.id]?.[size] ?? 0;
                          return (
                            <td key={size} className="py-2 px-1 text-center">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={val === 0 ? '' : val}
                                placeholder="0"
                                onChange={(e) => handleCellChange(c.id, size, e.target.value)}
                                className="w-18 py-1.5 px-2 text-center font-mono font-bold text-xs bg-white border border-[#D8C7B2] focus:border-[#5E1B42] focus:ring-1 focus:ring-[#5E1B42] rounded-lg transition-all outline-none tabular-nums"
                                aria-label={`Quantity for ${c.name} size ${size}`}
                              />
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-right font-mono font-bold text-[#5E1B42] tabular-nums">
                          {rowSum}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-[#7A5B6B] tabular-nums">
                          {c.inStockPieces}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FAF3E8] border-t-2 border-[#DFCBB2] font-bold text-[#221A1F]">
                    <td className="py-3 px-3 sm:px-4 uppercase tracking-wider text-[11px] sticky left-0 z-10 bg-[#FAF3E8]">
                      Size Totals
                    </td>
                    {product.sizeRange.map((size) => (
                      <td key={size} className="py-3 px-2 text-center font-mono text-xs tabular-nums">
                        {columnTotals[size]}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#5E1B42] tabular-nums">
                      {totalPieces}
                    </td>
                    <td className="py-3 px-3 text-right text-[11px] text-[#7A5B6B]">Total Suits</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Packaging, Bilti & Boutique Profit Strip */}
          <div className="bg-[#FAF6F0] border border-[#E6D6C1] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-lg border border-[#E2D0B8] text-[#5E1B42]">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[#6B5360] text-[11px]">Master Bilti Cartons:</div>
                <div className="font-mono font-bold text-[#221A1F] tabular-nums">
                  {packaging.cartonCount} Parcels ({product.piecesPerCarton} pcs/box)
                </div>
              </div>
            </div>

            <div>
              <div className="text-[#6B5360] text-[11px]">Gross Bilti Weight:</div>
              <div className="font-mono font-bold text-[#221A1F] tabular-nums">
                {packaging.totalWeightKg} kg
              </div>
            </div>

            <div>
              <div className="text-[#6B5360] text-[11px]">Recommended Dispatch:</div>
              <div className="font-semibold text-[#221A1F]">
                TCS Overland / Daewoo FastEx Bilti
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              <div className="text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Est. Boutique Resale Profit:
              </div>
              <div className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                +{formatCurrency(estimatedBoutiqueProfit, currency)}
              </div>
            </div>
          </div>

          {/* MOQ Check */}
          <div className="flex items-center justify-between text-xs px-1">
            {totalPieces >= product.moq ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Meets Sajawat® Wholesale MOQ ({totalPieces} / {product.moq} sets minimum). Ready for Bilti dispatch!
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>
                  Add {tierResult.moqDeficit} more sets to reach the standard wholesale bundle of {product.moq} sets (or click &ldquo;1 Set Bundle&rdquo; above).
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF3E8] px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#E5D5C0] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="min-w-0">
              <div className="text-[10px] text-[#6B5360] uppercase tracking-wide font-semibold">
                Total Suits
              </div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#221A1F] tabular-nums">
                {totalPieces} <span className="text-xs font-normal text-[#6B5360]">sets</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[10px] text-[#6B5360] uppercase tracking-wide font-semibold">
                Rate / Suit
              </div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#221A1F] tabular-nums truncate">
                {formatCurrency(tierResult.unitPrice, currency)}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[10px] text-[#6B5360] uppercase tracking-wide font-semibold">
                Subtotal
              </div>
              <div className="text-base sm:text-2xl font-bold font-mono text-[#5E1B42] tabular-nums truncate">
                {formatCurrency(tierResult.subtotal, currency)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 sm:py-2.5 text-xs font-semibold text-[#5E4A54] bg-white border border-[#D8C7B2] rounded-xl hover:bg-neutral-50 transition-colors shrink-0"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={totalPieces === 0}
              onClick={handleConfirmOrder}
              className={`flex-1 lg:flex-none px-4 sm:px-6 py-3 sm:py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                totalPieces === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#5E1B42] hover:bg-[#732252] text-white active:scale-98'
              }`}
            >
              <PackageCheck className="w-4 h-4 text-[#F5D77F] shrink-0" />
              Add {totalPieces} Suits to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
