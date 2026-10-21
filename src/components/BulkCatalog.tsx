import React, { useState, useMemo } from 'react';
import { ClothingProduct, UserRole } from '../types/index.ts';
import { filterWholesaleProducts, formatCurrency } from '../utils/b2bLogic.ts';
import { Lock, Grid3X3, Search, X, Sparkles, Filter, RefreshCcw } from 'lucide-react';

interface BulkCatalogProps {
  products: ClothingProduct[];
  currentRole: UserRole;
  currency?: 'PKR' | 'USD';
  onOpenMatrix: (product: ClothingProduct) => void;
  onOpenRegister: () => void;
  onSelectProductDetails: (product: ClothingProduct) => void;
}

export const BulkCatalog: React.FC<BulkCatalogProps> = ({
  products,
  currentRole,
  currency = 'PKR',
  onOpenMatrix,
  onOpenRegister,
  onSelectProductDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'WOMENS_STITCHED' | 'KIDS_STITCHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Use the verified pure filter logic
  const filteredProducts = useMemo(() => {
    return filterWholesaleProducts(products, searchQuery, selectedCategory);
  }, [products, searchQuery, selectedCategory]);

  const quickSearchTags = [
    { label: 'SKU: SUT-W', query: 'SUT-W' },
    { label: 'SKU: SUT-K', query: 'SUT-K' },
    { label: 'Nayab Velvet', query: 'Velvet' },
    { label: 'Co-ord Sets', query: 'Co-ord' },
    { label: 'Festive Chiffon', query: 'Chiffon' },
    { label: 'Color: Emerald', query: 'Emerald' },
    { label: 'Color: Ruby', query: 'Ruby' },
    { label: 'Raw Silk', query: 'Raw Silk' },
  ];

  return (
    <div className="space-y-8">
      {/* Category Filter and Search Toolbar */}
      <div className="space-y-5 pb-6 border-b border-[#EAEAEA]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E1E1E]">
              Wholesale Stitched Collections
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              Factory-direct production lots with tiered volume pricing and matrix-entry ordering.
            </p>
          </div>

          {/* Filter Segmented Buttons (Functional interactive controls) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F0EFEA] rounded-lg self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-white text-[#1E1E1E] shadow-2xs font-semibold'
                : 'text-[#666666] hover:text-[#1E1E1E]'
              }`}
            >
              All Collections ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('WOMENS_STITCHED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                selectedCategory === 'WOMENS_STITCHED'
                  ? 'bg-white text-[#1E1E1E] shadow-2xs font-semibold'
                  : 'text-[#666666] hover:text-[#1E1E1E]'
              }`}
            >
              Women's Stitched
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('KIDS_STITCHED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                selectedCategory === 'KIDS_STITCHED'
                  ? 'bg-white text-[#1E1E1E] shadow-2xs font-semibold'
                  : 'text-[#666666] hover:text-[#1E1E1E]'
              }`}
            >
              Children's Festive
            </button>
          </div>
        </div>

        {/* Dedicated B2B Search Input Field & Quick SKU/Colorway Filters */}
        <div className="bg-[#FAF9F5] border border-[#E7E2D4] rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Search catalog by SKU, category, or colorway"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by SKU (e.g. SUT-W-2026), category, colorway (e.g. Emerald, Ruby), or fabric..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DCD6C7] rounded-lg focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-[#1E1E1E] placeholder:text-neutral-400 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Filter Count / Feedback */}
            <div className="text-xs text-neutral-600 font-mono shrink-0 px-2 py-1 bg-white border border-[#E0D9C8] rounded-md self-start sm:self-auto flex items-center gap-1.5">
              <span className="font-bold text-[#1E1E1E] tabular-nums">
                {filteredProducts.length}
              </span>
              <span>of {products.length} Lots</span>
            </div>
          </div>

          {/* Quick SKU & Colorway Search Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-neutral-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#D4AF37]" />
              Quick Searches:
            </span>
            {quickSearchTags.map((tag) => {
              const isSelected = searchQuery.toLowerCase() === tag.query.toLowerCase();
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(tag.query);
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    isSelected
                      ? 'bg-[#D4AF37] text-white font-semibold shadow-2xs'
                      : 'bg-white text-neutral-700 border border-[#E2DDCF] hover:border-[#D4AF37] hover:text-[#1E1E1E]'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-neutral-500 hover:text-red-600 underline ml-2"
              >
                Reset Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State when no items match search */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF5E6] text-[#D4AF37] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1E1E1E]">
            No Wholesale Lots Match Your Search
          </h3>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
            We couldn't find any stitched apparel lots matching &ldquo;<strong>{searchQuery}</strong>&rdquo; in the current collection. Try searching by SKU (e.g. SUT-W), colorway, or fabric spec.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#1E1E1E] text-white hover:bg-[#D4AF37] hover:text-[#1E1E1E] rounded transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            return (
              <div
                key={product.id}
                className="group bg-white rounded-xl border border-[#E8E8E8] hover:border-[#D4AF37]/50 transition-all duration-200 overflow-hidden flex flex-col shadow-2xs hover:shadow-md"
              >
                {/* Product Image Lead (65-75% card emphasis) */}
                <div className="relative aspect-4/3 bg-[#F5F4EE] overflow-hidden">
                  <img
                    src={product.catalogImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* SKU & Category unboxed overlay */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-mono font-medium text-[#1E1E1E] border border-neutral-200 shadow-2xs">
                    {product.sku}
                  </div>

                  <div className="absolute top-3 right-3 bg-[#1E1E1E]/80 text-[#D4AF37] px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase">
                    MOQ: {product.moq} Sets
                  </div>
                </div>

                {/* Card Body & Technical Specs */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] text-[#888888] font-sans tracking-wide uppercase">
                      {product.collection}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#1E1E1E] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                      {product.suitType}
                    </p>

                    {/* Colorway Swatches Preview */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-neutral-400 font-medium">Colorways:</span>
                      <div className="flex items-center gap-1">
                        {product.colorways.map((c) => (
                          <span
                            key={c.id}
                            title={c.name}
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                            style={{ backgroundColor: c.hexCode }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400 ml-1">
                        ({product.colorways.length} Dyes)
                      </span>
                    </div>

                    {/* Fabric & Technical Stitch Specs (B2B Precision) */}
                    <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#EDECE8] space-y-1 text-[11px] text-[#666666]">
                      <div>
                        <span className="font-medium text-[#333333]">Base Fabric:</span> {product.fabric.base}
                      </div>
                      <div>
                        <span className="font-medium text-[#333333]">Stitch Spec:</span> {product.fabric.stitchDensity}
                      </div>
                      <div>
                        <span className="font-medium text-[#333333]">Available Sizes:</span>{' '}
                        <span className="font-mono text-[#1E1E1E]">{product.sizeRange.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Block: Gated vs Unlocked */}
                  <div className="pt-2 border-t border-[#F0F0F0]">
                    {currentRole === 'GUEST' ? (
                      <div className="bg-[#FAF8F2] border border-[#EADFC7] rounded-lg p-3 text-center space-y-2">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#97731B]">
                          <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Wholesale Pricing Locked</span>
                        </div>
                        <p className="text-[11px] text-[#777777]">
                          Verified retail account required to view volume tier pricing ($/set) & MOQ breaks.
                        </p>
                        <button
                          type="button"
                          onClick={onOpenRegister}
                          className="w-full py-1.5 text-xs font-semibold text-white bg-[#D4AF37] hover:bg-[#ba9324] rounded transition-colors active:scale-98"
                        >
                          Apply for Wholesale Access
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Tiered Pricing Table */}
                        <div>
                          <div className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                            Volume Tier Pricing (FOB Mill):
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            {product.pricingTiers.map((tier, idx) => (
                              <div
                                key={idx}
                                className="p-1.5 bg-[#FAF9F5] border border-[#EAE6DC] rounded text-xs"
                              >
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {tier.maxQty ? `${tier.minQty}-${tier.maxQty} sets` : `${tier.minQty}+ sets`}
                                </div>
                                <div className="font-mono font-bold text-[#1E1E1E] text-xs tabular-nums mt-0.5">
                                  {formatCurrency(tier.pricePerUnit, currency)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Primary Action Button: Open Bulk Order Matrix */}
                        <button
                          type="button"
                          onClick={() => onOpenMatrix(product)}
                          className="w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase bg-[#1E1E1E] hover:bg-[#D4AF37] hover:text-[#1E1E1E] text-white rounded transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-98"
                        >
                          <Grid3X3 className="w-4 h-4" />
                          Open Bulk Order Matrix
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
