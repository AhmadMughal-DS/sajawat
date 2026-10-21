import React, { useState, useMemo, useEffect } from 'react';
import { ClothingProduct, MatrixInput, UserRole } from '../types/index.ts';
import {
  calculateMatrixTotalPieces,
  calculateTierPrice,
  calculateLogisticsPackaging,
  formatCurrency,
} from '../utils/b2bLogic.ts';
import {
  ArrowLeft,
  Check,
  Sparkles,
  ShoppingBag,
  Grid3X3,
  Truck,
  ShieldCheck,
  PackageCheck,
  TrendingUp,
  Layers,
  MapPin,
  Download,
  MessageCircle,
  Box,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: ClothingProduct;
  relatedProducts: ClothingProduct[];
  currentRole: UserRole;
  currency: 'PKR' | 'USD';
  onBackToCatalog: () => void;
  onSelectProduct: (product: ClothingProduct) => void;
  onAddToCart: (
    product: ClothingProduct,
    matrix: MatrixInput,
    totalPieces: number,
    unitPrice: number,
    subtotal: number,
    cartonCount: number,
    grossWeightKg: number
  ) => void;
  onOpenMatrixModal: (product: ClothingProduct) => void;
  onUnlockWholesale: () => void;
  onOpenRegister: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  relatedProducts,
  currentRole,
  currency,
  onBackToCatalog,
  onSelectProduct,
  onAddToCart,
  onOpenMatrixModal,
  onUnlockWholesale,
  onOpenRegister,
}) => {
  // Interactive selected colorway state
  const [selectedColorId, setSelectedColorId] = useState<string>(
    product.colorways[0]?.id || 'default'
  );
  const [orderMode, setOrderMode] = useState<'SINGLE_COLOR' | 'ALL_COLORS_BUNDLE'>('ALL_COLORS_BUNDLE');

  // Quantity matrix across all colors & sizes
  const [matrix, setMatrix] = useState<MatrixInput>(() => {
    const initial: MatrixInput = {};
    let remaining = product.moq;
    product.colorways.forEach((c) => {
      initial[c.id] = {};
      product.sizeRange.forEach((s) => {
        initial[c.id][s] = 0;
      });
    });
    // Pre-fill 1 standard MOQ bundle so buyer can order immediately or customize
    while (remaining > 0) {
      for (const c of product.colorways) {
        for (const s of product.sizeRange) {
          if (remaining > 0) {
            initial[c.id][s] += 1;
            remaining -= 1;
          }
        }
      }
    }
    return initial;
  });

  // Reset state when switching to another product page
  useEffect(() => {
    setSelectedColorId(product.colorways[0]?.id || 'default');
    const initial: MatrixInput = {};
    let remaining = product.moq;
    product.colorways.forEach((c) => {
      initial[c.id] = {};
      product.sizeRange.forEach((s) => {
        initial[c.id][s] = 0;
      });
    });
    while (remaining > 0) {
      for (const c of product.colorways) {
        for (const s of product.sizeRange) {
          if (remaining > 0) {
            initial[c.id][s] += 1;
            remaining -= 1;
          }
        }
      }
    }
    setMatrix(initial);
  }, [product]);

  const selectedColor = useMemo(
    () => product.colorways.find((c) => c.id === selectedColorId) || product.colorways[0],
    [product.colorways, selectedColorId]
  );

  const totalPieces = useMemo(() => calculateMatrixTotalPieces(matrix), [matrix]);

  const tierResult = useMemo(
    () => calculateTierPrice(totalPieces, product.pricingTiers, product.moq),
    [totalPieces, product.pricingTiers, product.moq]
  );

  const packaging = useMemo(
    () => calculateLogisticsPackaging(totalPieces, product.gramsPerPiece, product.piecesPerCarton),
    [totalPieces, product.gramsPerPiece, product.piecesPerCarton]
  );

  const lowestWholesalePkr =
    product.pricingTiers[product.pricingTiers.length - 1]?.pricePerUnit ||
    product.pricingTiers[0]?.pricePerUnit ||
    2500;
  const startingWholesalePkr = product.pricingTiers[0]?.pricePerUnit || lowestWholesalePkr;
  const retailBenchmark = product.retailBenchmarkPkr || Math.round(startingWholesalePkr * 1.62);
  const profitPerSuitPkr = Math.max(500, retailBenchmark - tierResult.unitPrice);
  const totalEstimatedBoutiqueProfit = Math.max(0, totalPieces * profitPerSuitPkr);
  const savingsPercent = Math.round(((retailBenchmark - lowestWholesalePkr) / retailBenchmark) * 100);

  const handleSizeQtyChange = (colorId: string, sizeCode: string, deltaOrVal: number, isDelta = false) => {
    setMatrix((prev) => {
      const current = prev[colorId]?.[sizeCode] || 0;
      const nextVal = isDelta ? Math.max(0, current + deltaOrVal) : Math.max(0, deltaOrVal);
      return {
        ...prev,
        [colorId]: {
          ...(prev[colorId] || {}),
          [sizeCode]: nextVal,
        },
      };
    });
  };

  // Fill only the currently selected color with a full MOQ set
  const fillSelectedColorSet = (targetTotal: number) => {
    if (!selectedColor) return;
    setOrderMode('SINGLE_COLOR');
    const updated: MatrixInput = {};
    product.colorways.forEach((c) => {
      updated[c.id] = {};
      product.sizeRange.forEach((s) => {
        updated[c.id][s] = 0;
      });
    });
    let rem = targetTotal;
    while (rem > 0) {
      for (const s of product.sizeRange) {
        if (rem > 0) {
          updated[selectedColor.id][s] += 1;
          rem -= 1;
        }
      }
    }
    setMatrix(updated);
  };

  // Fill all colors evenly (Assorted Gaddi Set)
  const fillAssortedBundle = (multiplier: number) => {
    setOrderMode('ALL_COLORS_BUNDLE');
    const updated: MatrixInput = {};
    product.colorways.forEach((c) => {
      updated[c.id] = {};
      product.sizeRange.forEach((s) => {
        updated[c.id][s] = 0;
      });
    });
    let rem = product.moq * multiplier;
    while (rem > 0) {
      for (const c of product.colorways) {
        for (const s of product.sizeRange) {
          if (rem > 0) {
            updated[c.id][s] += 1;
            rem -= 1;
          }
        }
      }
    }
    setMatrix(updated);
  };

  const clearQuantities = () => {
    const empty: MatrixInput = {};
    product.colorways.forEach((c) => {
      empty[c.id] = {};
      product.sizeRange.forEach((s) => {
        empty[c.id][s] = 0;
      });
    });
    setMatrix(empty);
  };

  const handleAddCurrentSelectionToCart = () => {
    if (totalPieces <= 0) return;
    onAddToCart(
      product,
      matrix,
      totalPieces,
      tierResult.unitPrice,
      tierResult.subtotal,
      packaging.cartonCount,
      packaging.totalWeightKg
    );
  };

  const colorSubtotals = useMemo(() => {
    const map: Record<string, number> = {};
    product.colorways.forEach((c) => {
      map[c.id] = product.sizeRange.reduce((acc, s) => acc + (matrix[c.id]?.[s] || 0), 0);
    });
    return map;
  }, [matrix, product.colorways, product.sizeRange]);

  const whatsappDirectUrl = useMemo(() => {
    const colorBreakdown = product.colorways
      .map((c) => {
        const qty = colorSubtotals[c.id] || 0;
        return qty > 0 ? `${c.name}: ${qty} pcs` : null;
      })
      .filter(Boolean)
      .join(', ');

    const text = `Assalam-o-Alaikum Sajawat® Wholesale Desk,\nI want to order:\n• Product: *${product.title}*\n• SKU: *${product.sku}*\n• Selected Colors: ${colorBreakdown || selectedColor?.name}\n• Total Quantity: *${totalPieces} Suits*\n• Wholesale Rate: *Rs. ${tierResult.unitPrice.toLocaleString()}/suit*\n• Total Amount: *Rs. ${tierResult.subtotal.toLocaleString()} PKR*`;
    return `https://wa.me/923476128734?text=${encodeURIComponent(text)}`;
  }, [product, colorSubtotals, selectedColor, totalPieces, tierResult]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-16">
      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="bg-white border-b border-stone-200/90 sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#5E1B42] text-stone-800 hover:text-white text-xs font-bold transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </button>

            <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-xs text-stone-500 truncate">
              <button type="button" onClick={onBackToCatalog} className="hover:text-[#5E1B42]">
                Wholesale Catalog
              </button>
              <span>/</span>
              <span className="text-stone-700 font-medium">
                {product.category === 'KIDS_STITCHED' ? "Kids' Festive Stitched" : "Women's Stitched Suits"}
              </span>
              <span>/</span>
              <span className="font-mono font-bold text-[#5E1B42] truncate">{product.sku}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {product.readyToShipUnits.toLocaleString()} Suits Ready for Bilti
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Detail Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: High-Resolution Studio Image Gallery */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-4">
            <div className="relative aspect-3/4 rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-md group">
              <img
                src={product.catalogImage}
                alt={`${product.title} — ${product.sku}`}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
              />

              {/* Top Left Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono font-bold text-stone-900 border border-stone-200 shadow-xs">
                  {product.sku}
                </span>
                {product.bestSeller && (
                  <span className="bg-[#5E1B42] text-[#F5D77F] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Best Selling Lot
                  </span>
                )}
              </div>

              {/* Top Right Savings Badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-emerald-700 text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
                  Save {savingsPercent}% vs Retail
                </span>
              </div>

              {/* Active Colorway Indicator Pill on Image */}
              {selectedColor && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200/90 shadow-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0 ring-1 ring-stone-300"
                      style={{ backgroundColor: selectedColor.hexCode }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Selected Colorway
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {selectedColor.name}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                    {selectedColor.inStockPieces} pcs ready
                  </span>
                </div>
              )}
            </div>

            {/* Colorway Quick-Select Strip under Photo */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">
                  Available Colors in Lot ({product.colorways.length})
                </span>
                <a
                  href={product.catalogImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-[#5E1B42] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download S3 Master Photo
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.colorways.map((c) => {
                  const active = c.id === selectedColorId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColorId(c.id)}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        active
                          ? 'border-[#5E1B42] bg-[#FDF4F8] ring-2 ring-[#5E1B42]/15'
                          : 'border-stone-200 bg-stone-50/60 hover:border-stone-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: c.hexCode }}
                      />
                      <span className="text-[11px] font-semibold text-stone-800 truncate">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Factory Quality & Bilti Guarantee Strip */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white p-3 rounded-2xl border border-stone-200/80 space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#5E1B42] mx-auto" />
                <div className="text-[11px] font-bold text-stone-800">14 SPI Lockstitch</div>
                <div className="text-[10px] text-stone-500">Boutique Finishing</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200/80 space-y-1">
                <Truck className="w-4 h-4 text-[#5E1B42] mx-auto" />
                <div className="text-[11px] font-bold text-stone-800">24–72 Hr Bilti</div>
                <div className="text-[10px] text-stone-500">TCS · Daewoo · Leopard</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200/80 space-y-1">
                <Layers className="w-4 h-4 text-[#5E1B42] mx-auto" />
                <div className="text-[11px] font-bold text-stone-800">MOQ {product.moq} Suits</div>
                <div className="text-[10px] text-stone-500">Size-Graded Bundles</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Complete Product Details, Color Selection, Size Builder & Specs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title, Collection & Suit Type Header Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-semibold">
                  {product.collection}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#FDF4F8] text-[#5E1B42] font-bold">
                  {product.subCategory ||
                    (product.category === 'KIDS_STITCHED' ? "Kids' Festive 3-Pc" : "Women's Luxury Stitched")}
                </span>
                <span className="font-mono text-stone-500">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
                {product.title}
              </h1>

              <p className="text-sm text-stone-600 leading-relaxed">{product.suitType}</p>

              {product.cityDemand && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{product.cityDemand}</span>
                </div>
              )}

              {/* Wholesale Pricing Tiers Block */}
              {currentRole === 'GUEST' ? (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      Market / Pehnavaa Retail Price:{' '}
                      <strong className="line-through">{formatCurrency(retailBenchmark, currency)}</strong>
                    </span>
                    <span className="font-bold text-emerald-700">Save up to {savingsPercent}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#5E1B42]">
                    <Lock className="w-4 h-4" />
                    <span>Wholesale Factory Tier Rates Locked in Guest Mode</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={onUnlockWholesale}
                      className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] text-white rounded-xl hover:bg-[#732252]"
                    >
                      1-Click Unlock Wholesale Rates
                    </button>
                    <button
                      type="button"
                      onClick={onOpenRegister}
                      className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-xl hover:bg-stone-100"
                    >
                      Register Boutique Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-stone-700">
                      Factory Wholesale Volume Tiers (Per Suit)
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Retail: <span className="line-through font-normal">{formatCurrency(retailBenchmark, currency)}</span>
                        {' · '}Your Profit: +{formatCurrency(profitPerSuitPkr, currency)}/suit
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {product.pricingTiers.map((tier, idx) => {
                      const isActive = tierResult.activeTierIndex === idx && totalPieces > 0;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isActive
                              ? 'bg-[#FDF4F8] border-[#5E1B42] ring-2 ring-[#5E1B42]/15 shadow-xs'
                              : 'bg-stone-50/80 border-stone-200/90'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-semibold text-stone-600">
                              {tier.maxQty
                                ? `${tier.minQty}–${tier.maxQty} suits`
                                : `${tier.minQty}+ suits (Master)`}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#5E1B42] text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xl font-bold text-stone-900 mt-1 tabular-nums">
                            {formatCurrency(tier.pricePerUnit, currency)}
                            <span className="text-xs font-normal text-stone-500"> / pc</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 1: Interactive Color Selection & Bundle Mode Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E1B42]">
                    Step 1 · Color Selection &amp; Bundle Type
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Select Colorway or Full Assorted Bundle
                  </h2>
                </div>

                {/* Bundle Mode Switcher */}
                <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 self-start">
                  <button
                    type="button"
                    onClick={() => fillAssortedBundle(1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderMode === 'ALL_COLORS_BUNDLE'
                        ? 'bg-[#5E1B42] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Assorted Set (All Colors)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillSelectedColorSet(product.moq)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderMode === 'SINGLE_COLOR'
                        ? 'bg-[#5E1B42] text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Single Color Set
                  </button>
                </div>
              </div>

              {/* Interactive Color Swatch Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.colorways.map((c) => {
                  const isSelected = c.id === selectedColorId;
                  const colorQty = colorSubtotals[c.id] || 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorId(c.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#5E1B42] bg-[#FDF4F8]/90 ring-2 ring-[#5E1B42]/20 shadow-xs'
                          : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0 flex items-center justify-center ring-1 ring-stone-300"
                          style={{ backgroundColor: c.hexCode }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-900 truncate">{c.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {c.inStockPieces} suits in stock
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                            colorQty > 0
                              ? 'bg-[#5E1B42] text-white'
                              : 'bg-stone-200/70 text-stone-600'
                          }`}
                        >
                          {colorQty} pcs
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* STEP 2: Size Breakdown Editor for Selected Color (plus Quick Bundle Presets) */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E1B42]">
                      Step 2 · Size Curve Quantities ({selectedColor?.name})
                    </span>
                    <p className="text-xs text-stone-500">
                      Adjust piece count per size for <strong>{selectedColor?.name}</strong> or choose a quick bundle preset below:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenMatrixModal(product)}
                    className="text-xs font-bold text-[#5E1B42] hover:underline flex items-center gap-1"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    Open Full Matrix Table
                  </button>
                </div>

                {/* Size Inputs for Currently Selected Color */}
                {selectedColor && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {product.sizeRange.map((size) => {
                      const val = matrix[selectedColor.id]?.[size] || 0;
                      return (
                        <div
                          key={size}
                          className="p-3 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col items-center gap-2"
                        >
                          <span className="text-xs font-bold text-stone-800 font-mono">
                            Size {size}
                          </span>
                          <div className="flex items-center gap-1.5 w-full justify-center">
                            <button
                              type="button"
                              onClick={() => handleSizeQtyChange(selectedColor.id, size, -1, true)}
                              className="w-7 h-7 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-sm flex items-center justify-center"
                              aria-label={`Decrease ${selectedColor.name} size ${size}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={val}
                              onChange={(e) =>
                                handleSizeQtyChange(
                                  selectedColor.id,
                                  size,
                                  parseInt(e.target.value, 10) || 0,
                                  false
                                )
                              }
                              aria-label={`${selectedColor.name} size ${size} quantity`}
                              className="w-12 text-center font-mono font-bold text-xs py-1 bg-white border border-stone-300 rounded-lg focus:border-[#5E1B42] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSizeQtyChange(selectedColor.id, size, 1, true)}
                              className="w-7 h-7 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-sm flex items-center justify-center"
                              aria-label={`Increase ${selectedColor.name} size ${size}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Bundle Preset Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => fillAssortedBundle(1)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-[#5E1B42] hover:text-white text-stone-800 transition-colors"
                    >
                      1 MOQ Assorted Set ({product.moq} Suits)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillAssortedBundle(2)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-[#5E1B42] hover:text-white text-stone-800 transition-colors"
                    >
                      2 Bundles ({product.moq * 2} Suits)
                    </button>
                    <button
                      type="button"
                      onClick={() => fillSelectedColorSet(product.moq)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-[#5E1B42] hover:text-white text-stone-800 transition-colors"
                    >
                      Only {selectedColor?.name.split(' ')[0]} ({product.moq} Suits)
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={clearQuantities}
                    className="text-xs text-stone-500 hover:text-red-600 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Summary & Primary Order Actions */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/90 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Total Selected
                    </div>
                    <div className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                      {totalPieces} Suits
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Wholesale Rate
                    </div>
                    <div className="font-mono text-lg font-bold text-stone-900 tabular-nums">
                      {formatCurrency(tierResult.unitPrice, currency)}/pc
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Total Payable
                    </div>
                    <div className="font-mono text-lg font-bold text-[#5E1B42] tabular-nums">
                      {formatCurrency(tierResult.subtotal, currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      Est. Boutique Profit
                    </div>
                    <div className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
                      +{formatCurrency(totalEstimatedBoutiqueProfit, currency)}
                    </div>
                  </div>
                </div>

                {/* MOQ Validation Notice */}
                <div className="text-xs">
                  {totalPieces >= product.moq ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Meets factory MOQ ({totalPieces} suits · {packaging.cartonCount} master cartons · {packaging.totalWeightKg} kg). Ready for immediate Bilti!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        Add {tierResult.moqDeficit} more suits to meet the standard {product.moq}-suit wholesale bundle MOQ.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    disabled={totalPieces === 0}
                    onClick={handleAddCurrentSelectionToCart}
                    className={`flex-1 py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                      totalPieces === 0
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : 'bg-[#5E1B42] hover:bg-[#732252] text-white active:scale-98'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#F5D77F]" />
                    Add {totalPieces} Suits to Wholesale Cart ({formatCurrency(tierResult.subtotal, currency)})
                  </button>

                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#25D366] hover:bg-[#1fb858] text-white transition-colors flex items-center justify-center gap-2 shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order via WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* COMPLETE TECHNICAL & FABRIC SPECIFICATIONS CARD */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E1B42]">
                  Complete Product Specifications
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Fabric Composition, Embroidery &amp; Bilti Packaging Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Shirt / Base Fabric
                  </div>
                  <div className="font-semibold text-stone-900 leading-relaxed">
                    {product.fabric.base}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Dupatta &amp; Trouser / Bottom
                  </div>
                  <div className="font-semibold text-stone-900 leading-relaxed">
                    {product.fabric.dupattaOrBottom}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Embroidery &amp; Embellishment
                  </div>
                  <div className="font-semibold text-stone-900 leading-relaxed">
                    {product.fabric.embroidery}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Stitching &amp; Quality Standard
                  </div>
                  <div className="font-semibold text-stone-900 leading-relaxed">
                    {product.fabric.stitchDensity}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Size Curve Included
                  </div>
                  <div className="font-mono font-bold text-stone-900">
                    {product.sizeRange.join(' · ')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Master Carton &amp; Unit Weight
                  </div>
                  <div className="font-semibold text-stone-900">
                    {product.piecesPerCarton} Suits / Carton · {product.gramsPerPiece}g per suit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Wholesale Lots Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-stone-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5E1B42]">
                  More From This Collection
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Related Wholesale Stitched Lots
                </h2>
              </div>
              <button
                type="button"
                onClick={onBackToCatalog}
                className="text-xs font-bold text-[#5E1B42] hover:underline"
              >
                View All 16 Lots →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.slice(0, 4).map((rel) => {
                const relLowest =
                  rel.pricingTiers[rel.pricingTiers.length - 1]?.pricePerUnit ||
                  rel.pricingTiers[0]?.pricePerUnit ||
                  2000;
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectProduct(rel)}
                    className="group bg-white rounded-2xl border border-stone-200/90 hover:border-[#5E1B42] overflow-hidden text-left transition-all shadow-2xs hover:shadow-md flex flex-col"
                  >
                    <div className="relative aspect-3/4 bg-stone-100 overflow-hidden w-full">
                      <img
                        src={rel.catalogImage}
                        alt={rel.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-stone-800">
                        {rel.sku}
                      </span>
                    </div>
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between w-full">
                      <h3 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#5E1B42] line-clamp-1">
                        {rel.title}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-xs font-bold text-[#5E1B42]">
                          From {formatCurrency(relLowest, currency)}
                        </span>
                        <span className="text-[11px] text-stone-500">MOQ {rel.moq}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
