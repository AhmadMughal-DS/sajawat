import React, { useState, useMemo, useEffect } from 'react';
import { ClothingProduct, UserRole } from '../types/index.ts';
import { filterWholesaleProducts, formatCurrency } from '../utils/b2bLogic.ts';
import {
  Lock,
  Search,
  X,
  Sparkles,
  Filter,
  RefreshCcw,
  ArrowUpRight,
} from 'lucide-react';

interface BulkCatalogProps {
  products: ClothingProduct[];
  currentRole: UserRole;
  currency?: 'PKR' | 'USD';
  initialCategory?: 'ALL' | 'WOMENS_STITCHED' | 'KIDS_STITCHED';
  onOpenMatrix: (product: ClothingProduct) => void;
  onQuickAddBundle?: (product: ClothingProduct) => void;
  onOpenRegister: () => void;
  onUnlockWholesale?: () => void;
  onSelectProductDetails: (product: ClothingProduct) => void;
}

export const BulkCatalog: React.FC<BulkCatalogProps> = ({
  products,
  currentRole,
  currency = 'PKR',
  initialCategory = 'ALL',
  onSelectProductDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'WOMENS_STITCHED' | 'KIDS_STITCHED'>(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PROFIT_DESC'>('FEATURED');

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const womensCount = useMemo(
    () => products.filter((p) => p.category === 'WOMENS_STITCHED').length,
    [products]
  );
  const kidsCount = useMemo(
    () => products.filter((p) => p.category === 'KIDS_STITCHED').length,
    [products]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const base = filterWholesaleProducts(products, searchQuery, selectedCategory);
    return [...base].sort((a, b) => {
      const aMinPrice =
        a.pricingTiers[a.pricingTiers.length - 1]?.pricePerUnit || a.pricingTiers[0]?.pricePerUnit || 0;
      const bMinPrice =
        b.pricingTiers[b.pricingTiers.length - 1]?.pricePerUnit || b.pricingTiers[0]?.pricePerUnit || 0;

      if (sortBy === 'PRICE_ASC') {
        return aMinPrice - bMinPrice;
      }
      if (sortBy === 'PROFIT_DESC') {
        const aProfit = (a.retailBenchmarkPkr || aMinPrice * 1.6) - aMinPrice;
        const bProfit = (b.retailBenchmarkPkr || bMinPrice * 1.6) - bMinPrice;
        return bProfit - aProfit;
      }
      return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const quickSearchTags = [
    { label: 'Chiffon 3-Pc', query: 'Chiffon' },
    { label: '9000 Shahi Velvet', query: 'Velvet' },
    { label: 'Winter Dhanak Shawl', query: 'Dhanak' },
    { label: 'Girls Silk Sharara', query: 'Sharara' },
    { label: 'Mirror Work Pret', query: 'Mirror' },
    { label: 'Pure Organza', query: 'Organza' },
    { label: 'Kids Koti / Jacket', query: 'Jacket' },
    { label: 'Golden Tilla', query: 'Tilla' },
  ];

  return (
    <div className="space-y-8">
      {/* Category Filter and Search Toolbar */}
      <div className="space-y-5 pb-6 border-b border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#5E1B42] mb-1">
              Sajawat® Factory-Direct Wholesale Collection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
              Stitched Women &amp; Kids Wholesale Catalog
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Click any suit to open its full product page with color selection, size breakdown, and wholesale tier ordering.
            </p>
          </div>

          {/* Primary Category Segmented Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-stone-200 rounded-2xl self-start lg:self-auto shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-[#5E1B42] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Lots ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('WOMENS_STITCHED')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === 'WOMENS_STITCHED'
                  ? 'bg-[#5E1B42] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Women’s Stitched ({womensCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('KIDS_STITCHED')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === 'KIDS_STITCHED'
                  ? 'bg-[#5E1B42] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Kids’ Festive ({kidsCount})
            </button>
          </div>
        </div>

        {/* Search Input, Sort & Fabric Filter Bar */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Search Sajawat wholesale catalog by SKU, fabric, or suit style"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU (SJW-W-2026), fabric (Chiffon, Velvet, Dhanak, Sharara)..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:border-[#5E1B42] focus:ring-1 focus:ring-[#5E1B42] outline-none text-stone-900 placeholder:text-stone-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 min-w-0">
              <label htmlFor="catalog-sort" className="hidden sm:inline text-xs font-medium text-stone-500 whitespace-nowrap">
                Sort By:
              </label>
              <select
                id="catalog-sort"
                aria-label="Sort wholesale catalog"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 md:flex-none min-w-0 text-xs bg-stone-50/70 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900 focus:border-[#5E1B42] outline-none"
              >
                <option value="FEATURED">Top Selling in Pakistan</option>
                <option value="PRICE_ASC">Lowest Wholesale Rate First</option>
                <option value="PROFIT_DESC">Highest Boutique Margin First</option>
              </select>

              <div className="text-xs text-[#5E1B42] font-mono shrink-0 px-3 py-2.5 bg-stone-50/70 border border-stone-200 rounded-xl flex items-center gap-1.5">
                <span className="font-bold tabular-nums">{filteredProducts.length}</span>
                <span>of {products.length} Lots</span>
              </div>
            </div>
          </div>

          {/* Quick Fabric & Style Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-semibold text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#5E1B42]" />
              Quick Filter:
            </span>
            {quickSearchTags.map((tag) => {
              const isSelected = searchQuery.toLowerCase() === tag.query.toLowerCase();
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setSearchQuery(isSelected ? '' : tag.query)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${
                    isSelected
                      ? 'bg-[#5E1B42] text-white font-semibold shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border border-stone-200 hover:border-[#5E1B42] hover:text-[#5E1B42]'
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
                className="text-[11px] text-[#5E1B42] hover:text-red-700 font-semibold underline ml-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FDF4F8] text-[#5E1B42] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            No Wholesale Lots Match Your Filter
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            No stitched apparel lots matched &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching by SKU (SJW-W or SJW-K), Chiffon, Velvet, Dhanak, or Sharara.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#5E1B42] text-white hover:bg-[#732252] rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Minimalist Editorial Product Grid — Click Any Product to Open Full Detail Page */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => {
            const lowestWholesalePkr =
              product.pricingTiers[product.pricingTiers.length - 1]?.pricePerUnit ||
              product.pricingTiers[0]?.pricePerUnit ||
              2500;
            const startingWholesalePkr = product.pricingTiers[0]?.pricePerUnit || lowestWholesalePkr;
            const retailBenchmark = product.retailBenchmarkPkr || Math.round(startingWholesalePkr * 1.62);
            const savingsPercent = Math.round(((retailBenchmark - lowestWholesalePkr) / retailBenchmark) * 100);

            return (
              <article
                key={product.id}
                onClick={() => onSelectProductDetails(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProductDetails(product);
                  }
                }}
                aria-label={`View full details and color selection for ${product.title}`}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200/90 hover:border-[#5E1B42]/60 transition-all duration-300 overflow-hidden flex flex-col shadow-2xs hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#5E1B42]"
              >
                {/* Studio Portrait Image */}
                <div className="relative aspect-3/4 bg-stone-100 overflow-hidden">
                  <img
                    src={product.catalogImage}
                    alt={`${product.title} — ${product.sku}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Minimal Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <span className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-stone-900 border border-stone-200/80 shadow-2xs">
                      {product.sku}
                    </span>

                    <span className="bg-stone-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
                      MOQ {product.moq}
                    </span>
                  </div>

                  {product.bestSeller && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-[#5E1B42]/95 text-[#F5D77F] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-2xs inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Best Seller
                      </span>
                    </div>
                  )}
                </div>

                {/* Minimal Card Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {product.subCategory ||
                        (product.category === 'KIDS_STITCHED' ? "Kids' Festive Set" : "Women's Stitched Suit")}
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#5E1B42] transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                  </div>

                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    {currentRole === 'GUEST' ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#5E1B42]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Wholesale Price Locked</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                            {formatCurrency(lowestWholesalePkr, currency)}
                          </span>
                          <span className="text-[11px] text-stone-400 line-through font-mono">
                            {formatCurrency(retailBenchmark, currency)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700">
                          Save {savingsPercent}% · Wholesale
                        </span>
                      </div>
                    )}

                    {/* Minimal Color Dots + View Details Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex -space-x-1" title={`${product.colorways.length} Colors Available`}>
                        {product.colorways.slice(0, 4).map((c) => (
                          <span
                            key={c.id}
                            className="w-3.5 h-3.5 rounded-full border border-white ring-1 ring-stone-200"
                            style={{ backgroundColor: c.hexCode }}
                          />
                        ))}
                      </div>
                      <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#5E1B42] text-stone-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
