import React, { useState, useMemo } from 'react';
import { ClothingProduct, MatrixInput } from '../types/index.ts';
import {
  calculateMatrixTotalPieces,
  calculateTierPrice,
  calculateLogisticsPackaging,
  formatCurrency,
} from '../utils/b2bLogic.ts';
import { X, CheckCircle, AlertCircle, PackageCheck, Sparkles, Box, Info } from 'lucide-react';

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

  // Initialize matrix state: colorwayId -> sizeCode -> quantity
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

  // Calculate live totals
  const totalPieces = useMemo(() => calculateMatrixTotalPieces(matrix), [matrix]);

  const tierResult = useMemo(
    () => calculateTierPrice(totalPieces, product.pricingTiers, product.moq),
    [totalPieces, product.pricingTiers, product.moq]
  );

  const packaging = useMemo(
    () => calculateLogisticsPackaging(totalPieces, product.gramsPerPiece, product.piecesPerCarton),
    [totalPieces, product.gramsPerPiece, product.piecesPerCarton]
  );

  // Cell quantity change handler
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

  // Quick fill helper presets for retail store buyers
  const applyQuickRatio = (multiplier: number) => {
    setMatrix((prev: MatrixInput) => {
      const updated: MatrixInput = {};
      product.colorways.forEach((c) => {
        updated[c.id] = {};
        product.sizeRange.forEach((s) => {
          // Curve standard sizing curve: Medium and Large get 2x, XS/XXL get 1x
          const weight = s === 'M' || s === 'L' || s === '6Y-7Y' ? 2 : 1;
          updated[c.id][s] = weight * multiplier;
        });
      });
      return updated;
    });
  };

  const clearMatrix = () => {
    setMatrix((prev: MatrixInput) => {
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

  // Calculate column totals (total per size)
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrix-order-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#FAF9F6] px-6 py-4 border-b border-[#E8E6DF] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
              <img
                src={product.catalogImage}
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-medium text-[#1E1E1E] bg-white px-2 py-0.5 rounded border border-neutral-200">
                  {product.sku}
                </span>
                <span className="text-[#888888] font-sans">·</span>
                <span className="text-[#777777]">{product.collection}</span>
              </div>
              <h2 id="matrix-order-title" className="font-serif text-xl font-bold text-[#1E1E1E]">
                {product.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bulk order matrix modal"
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Dynamic Tier Cards Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[#666666]">
                Dynamic Tier Pricing (FOB Stitched Price per Set):
              </span>
              <span className="text-neutral-500">
                Minimum Order Quantity (MOQ): <strong className="text-[#1E1E1E]">{product.moq} Sets</strong>
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
                        ? 'bg-[#FBF8EE] border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-xs'
                        : 'bg-[#FAFAFA] border-neutral-200 text-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium">
                        {tier.maxQty ? `${tier.minQty} - ${tier.maxQty} sets` : `${tier.minQty}+ sets`}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 bg-[#D4AF37] text-white rounded">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xl font-bold text-[#1E1E1E] tabular-nums mt-1">
                      {formatCurrency(tier.pricePerUnit, currency)}
                      <span className="text-xs font-normal text-neutral-500 ml-1">/ set</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Tier Incentive Alert */}
            {tierResult.nextTier && (
              <div className="p-2.5 bg-[#F5F8FF] border border-[#CCD8F5] rounded-lg text-xs text-[#204080] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3366CC]" />
                  Volume Upsell: Add <strong>{tierResult.nextTier.unitsNeeded} more sets</strong> to reach
                  the next tier and save <strong>{formatCurrency(tierResult.nextTier.savingsPerUnit, currency)}/set</strong>!
                </span>
                <span className="font-mono font-medium">
                  Next Price: {formatCurrency(tierResult.nextTier.pricePerUnit, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Quick Preset Ratios */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Quick Fill Presets:</span>
              <button
                type="button"
                onClick={() => applyQuickRatio(2)}
                className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
              >
                Standard Boutique Pack (24 Sets)
              </button>
              <button
                type="button"
                onClick={() => applyQuickRatio(4)}
                className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
              >
                High-Volume Pack (48 Sets)
              </button>
              <button
                type="button"
                onClick={() => applyQuickRatio(8)}
                className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
              >
                Master Lot (96 Sets)
              </button>
            </div>
            <button
              type="button"
              onClick={clearMatrix}
              className="text-xs text-neutral-500 hover:text-red-600 underline"
            >
              Reset Matrix to 0
            </button>
          </div>

          {/* Bulk Order Matrix Table */}
          <div className="border border-[#E5E5E5] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F4EE] border-b border-[#E2DFD2] text-[#444444]">
                    <th className="py-3 px-4 font-semibold w-48">Colorway / Fabric Dye</th>
                    {product.sizeRange.map((size) => (
                      <th key={size} className="py-3 px-2 font-semibold text-center w-24">
                        Size {size}
                      </th>
                    ))}
                    <th className="py-3 px-3 font-semibold text-right w-28">Color Total</th>
                    <th className="py-3 px-3 font-semibold text-right w-24 text-neutral-500">
                      In-Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {product.colorways.map((c) => {
                    // Row total
                    let rowSum = 0;
                    product.sizeRange.forEach((s) => {
                      rowSum += matrix[c.id]?.[s] || 0;
                    });

                    return (
                      <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#1E1E1E]">
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
                                className="w-18 py-1.5 px-2 text-center font-mono font-medium text-xs bg-white border border-neutral-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded transition-all outline-none tabular-nums"
                                aria-label={`Quantity for ${c.name} size ${size}`}
                              />
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-right font-mono font-bold text-[#1E1E1E] tabular-nums">
                          {rowSum}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-neutral-500 tabular-nums">
                          {c.inStockPieces}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FAF9F6] border-t-2 border-[#D8D4C5] font-semibold text-[#1E1E1E]">
                    <td className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">
                      Column Totals (By Size)
                    </td>
                    {product.sizeRange.map((size) => (
                      <td key={size} className="py-3 px-2 text-center font-mono text-xs tabular-nums">
                        {columnTotals[size]}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#D4AF37] tabular-nums">
                      {totalPieces}
                    </td>
                    <td className="py-3 px-3 text-right text-[11px] text-neutral-400">Total Sets</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Export Packaging & Logistics Estimation Strip */}
          <div className="bg-[#F9F9F8] border border-[#E7E7E5] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-lg border border-neutral-200 text-[#D4AF37]">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <div className="text-neutral-500 text-[11px]">Master Cartons:</div>
                <div className="font-mono font-bold text-[#1E1E1E] tabular-nums">
                  {packaging.cartonCount} Boxes ({product.piecesPerCarton} pcs/box)
                </div>
              </div>
            </div>

            <div>
              <div className="text-neutral-500 text-[11px]">Gross Cargo Weight:</div>
              <div className="font-mono font-bold text-[#1E1E1E] tabular-nums">
                {packaging.totalWeightKg} kg
              </div>
            </div>

            <div>
              <div className="text-neutral-500 text-[11px]">Est. CBM Volume:</div>
              <div className="font-mono font-bold text-[#1E1E1E] tabular-nums">
                {packaging.estimatedCbm} CBM
              </div>
            </div>

            <div>
              <div className="text-neutral-500 text-[11px]">Recommended Freight:</div>
              <div className="font-semibold text-[#1E1E1E]">
                {packaging.recommendedFreightMethod === 'EXPRESS_AIR' && 'Express Air Cargo'}
                {packaging.recommendedFreightMethod === 'AIR_CARGO' && 'Consolidated Air Freight'}
                {packaging.recommendedFreightMethod === 'OCEAN_LCL' && 'Ocean LCL (Palletized)'}
                {packaging.recommendedFreightMethod === 'OCEAN_FCL' && 'Ocean FCL (20ft Container)'}
              </div>
            </div>
          </div>

          {/* MOQ Status Check */}
          <div className="flex items-center justify-between text-xs px-1">
            {totalPieces >= product.moq ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Order meets MOQ requirement ({totalPieces} / {product.moq} sets minimum). Ready for bulk production dispatch.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>
                  Under MOQ: Need {tierResult.moqDeficit} more sets to meet minimum order threshold of {product.moq} sets.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Subtotal and Add to Cart Action */}
        <div className="bg-[#FAF9F6] px-6 py-4 border-t border-[#E8E6DF] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] text-neutral-500 uppercase tracking-wide">
                Total Sets Ordered
              </div>
              <div className="text-xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                {totalPieces} <span className="text-xs font-normal text-neutral-500">sets</span>
              </div>
            </div>

            <div className="h-8 w-px bg-neutral-300" />

            <div>
              <div className="text-[11px] text-neutral-500 uppercase tracking-wide">
                Active Unit Price
              </div>
              <div className="text-xl font-bold font-mono text-[#1E1E1E] tabular-nums">
                {formatCurrency(tierResult.unitPrice, currency)}{' '}
                <span className="text-xs font-normal text-neutral-500">/ set</span>
              </div>
            </div>

            <div className="h-8 w-px bg-neutral-300" />

            <div>
              <div className="text-[11px] text-neutral-500 uppercase tracking-wide">
                FOB Mill Subtotal
              </div>
              <div className="text-2xl font-bold font-mono text-[#D4AF37] tabular-nums">
                {formatCurrency(tierResult.subtotal, currency)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={totalPieces === 0}
              onClick={handleConfirmOrder}
              className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto ${
                totalPieces === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#D4AF37] hover:bg-[#ba9324] text-white active:scale-98'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              Add {totalPieces} Sets to Bulk Cart (${tierResult.subtotal.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
