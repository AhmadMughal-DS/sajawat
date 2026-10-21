/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  ClothingProduct,
  BuyerAccount,
  BulkCartItem,
  WholesaleOrder,
  ImageProcessingPipelineJob,
  MatrixInput,
} from './types/index.ts';
import {
  INITIAL_PRODUCTS,
  INITIAL_BUYERS,
  INITIAL_ORDERS,
  INITIAL_PIPELINE_JOBS,
  S3_BUCKET_INFO,
} from './data/mockB2BData.ts';
import { calculateTierPrice, calculateLogisticsPackaging } from './utils/b2bLogic.ts';
import { Header } from './components/Header.tsx';
import { GatedHomepage } from './components/GatedHomepage.tsx';
import { BulkCatalog } from './components/BulkCatalog.tsx';
import { ProductDetailPage } from './components/ProductDetailPage.tsx';
import { BulkOrderMatrixModal } from './components/BulkOrderMatrixModal.tsx';
import { WholesaleRegistrationModal } from './components/WholesaleRegistrationModal.tsx';
import { BuyerPortal } from './components/BuyerPortal.tsx';
import { FactoryAdminRoute } from './components/FactoryAdminRoute.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import { ManufacturingMill } from './components/ManufacturingMill.tsx';
import { PehnavaaBenchmark } from './components/PehnavaaBenchmark.tsx';
import {
  Lock,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Truck,
  Database,
  Cloud,
} from 'lucide-react';

export default function App() {
  // Default to RETAILER so wholesale rates & matrix ordering are immediately usable,
  // while keeping the Guest Gate switcher in the header for B2B gating demos.
  const [currentRole, setCurrentRole] = useState<UserRole>('RETAILER');
  const [activeTab, setActiveTab] = useState<'catalog' | 'manufacturing' | 'portal' | 'benchmark'>(
    'catalog'
  );
  const [catalogCategory, setCatalogCategory] = useState<'ALL' | 'WOMENS_STITCHED' | 'KIDS_STITCHED'>(
    'ALL'
  );
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [cloudConnected, setCloudConnected] = useState(true);

  // Dedicated Factory Admin Route (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname === '/factory-admin' ||
      window.location.hash === '#admin' ||
      window.location.hash === '#factory-admin' ||
      window.location.search.includes('admin=true')
    );
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const handleHashOrPop = () => {
      if (
        window.location.hash === '#admin' ||
        window.location.hash === '#factory-admin' ||
        window.location.pathname === '/admin'
      ) {
        setIsAdminRoute(true);
      }
    };
    window.addEventListener('hashchange', handleHashOrPop);
    window.addEventListener('popstate', handleHashOrPop);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPop);
      window.removeEventListener('popstate', handleHashOrPop);
    };
  }, []);

  // Core Data States (Initialized from S3 Snapshot + Hydrated from Live MongoDB API)
  const [products, setProducts] = useState<ClothingProduct[]>(INITIAL_PRODUCTS);
  const [buyers, setBuyers] = useState<BuyerAccount[]>(INITIAL_BUYERS);
  const [orders, setOrders] = useState<WholesaleOrder[]>(INITIAL_ORDERS);
  const [pipelineJobs, setPipelineJobs] = useState<ImageProcessingPipelineJob[]>(INITIAL_PIPELINE_JOBS);
  const [cartItems, setCartItems] = useState<BulkCartItem[]>([]);

  // Hydrate from MongoDB Atlas + S3 backend on mount
  useEffect(() => {
    fetch('/api/bootstrap')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setCloudConnected(Boolean(data.mongoConnected));
        if (Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
        if (Array.isArray(data.buyers) && data.buyers.length > 0) setBuyers(data.buyers);
        if (Array.isArray(data.orders) && data.orders.length > 0) setOrders(data.orders);
        if (Array.isArray(data.pipelineJobs) && data.pipelineJobs.length > 0)
          setPipelineJobs(data.pipelineJobs);
      })
      .catch(() => {});
  }, []);

  // Dynamic SEO Title & Product ItemList JSON-LD Injection
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (activeTab === 'catalog') {
      document.title =
        catalogCategory === 'WOMENS_STITCHED'
          ? "Women's Stitched Wholesale Suits Pakistan (Chiffon, 9000 Velvet, Dhanak) | Sajawat®"
          : catalogCategory === 'KIDS_STITCHED'
          ? "Kids' Stitched Festive Wholesale Clothes Pakistan (Sharara, Velvet) | Sajawat®"
          : "Sajawat® Wholesale Pakistan — Women's & Kids' Stitched Clothes Factory Direct (2026)";
    } else if (activeTab === 'benchmark') {
      document.title = 'Sajawat® Wholesale vs. www.pehnavaa.com — Pakistan Boutique Margin Comparison';
    } else if (activeTab === 'manufacturing') {
      document.title = 'Stitching Mill & All-Pakistan Bilti Dispatch — Sajawat® Wholesale';
    } else if (activeTab === 'portal') {
      document.title = 'Verified Boutique Buyer Portal — Sajawat® Wholesale Pakistan';
    }

    // Inject dynamic ItemList JSON-LD for all 16 S3 products
    const scriptId = 'sajawat-dynamic-product-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Sajawat® Stitched Women & Kids Wholesale Catalog Pakistan',
      numberOfItems: products.length,
      itemListElement: products.map((p, idx) => {
        const lowPrice = p.pricingTiers[p.pricingTiers.length - 1]?.pricePerUnit || 1500;
        const highPrice = p.pricingTiers[0]?.pricePerUnit || 4500;
        return {
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: p.title,
            sku: p.sku,
            image: p.catalogImage,
            description: `${p.suitType} — ${p.fabric.base}. MOQ ${p.moq} sets. Factory wholesale in Pakistan.`,
            brand: { '@type': 'Brand', name: 'Sajawat®' },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'PKR',
              lowPrice,
              highPrice,
              offerCount: p.pricingTiers.length,
              availability: 'https://schema.org/InStock',
            },
          },
        };
      }),
    };
    scriptEl.textContent = JSON.stringify(itemListSchema);
  }, [activeTab, catalogCategory, products]);

  // Dedicated Product Detail Page state + URL ?sku=... sync
  const [selectedProductPage, setSelectedProductPage] = useState<ClothingProduct | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const skuParam = params.get('sku');
    if (!skuParam) return null;
    return INITIAL_PRODUCTS.find((p) => p.sku.toLowerCase() === skuParam.toLowerCase()) || null;
  });

  // Modals & Drawers
  const [activeMatrixProduct, setActiveMatrixProduct] = useState<ClothingProduct | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const openProductPage = (prod: ClothingProduct) => {
    setSelectedProductPage(prod);
    setActiveTab('catalog');
    if (typeof window !== 'undefined') {
      window.history.pushState({ sku: prod.sku }, '', `/?sku=${encodeURIComponent(prod.sku)}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeProductPage = () => {
    setSelectedProductPage(null);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const skuParam = params.get('sku');
      if (skuParam) {
        const found = products.find((p) => p.sku.toLowerCase() === skuParam.toLowerCase());
        setSelectedProductPage(found || null);
      } else {
        setSelectedProductPage(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [products]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Add to Bulk Cart from Matrix
  const handleAddToCart = (
    product: ClothingProduct,
    matrix: MatrixInput,
    totalPieces: number,
    unitPrice: number,
    subtotal: number,
    cartonCount: number,
    grossWeightKg: number
  ) => {
    const newItem: BulkCartItem = {
      product,
      matrix,
      totalPieces,
      unitPrice,
      subtotal,
      cartonCount,
      grossWeightKg,
    };
    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
    showNotification(`Added ${totalPieces} suits of ${product.sku} to Sajawat® Wholesale Cart.`);
  };

  // 1-Click Quick Add Standard MOQ Bundle
  const handleQuickAddBundle = (product: ClothingProduct) => {
    const matrix: MatrixInput = {};
    let remaining = product.moq;
    product.colorways.forEach((c) => {
      matrix[c.id] = {};
      product.sizeRange.forEach((s) => {
        matrix[c.id][s] = 0;
      });
    });

    while (remaining > 0) {
      for (const c of product.colorways) {
        for (const s of product.sizeRange) {
          if (remaining > 0) {
            matrix[c.id][s] += 1;
            remaining -= 1;
          }
        }
      }
    }

    const tierInfo = calculateTierPrice(product.moq, product.pricingTiers, product.moq);
    const pkg = calculateLogisticsPackaging(product.moq, product.gramsPerPiece, product.piecesPerCarton);
    handleAddToCart(
      product,
      matrix,
      product.moq,
      tierInfo.unitPrice,
      tierInfo.subtotal,
      pkg.cartonCount,
      pkg.totalWeightKg
    );
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAccount = (newAccount: BuyerAccount) => {
    setBuyers((prev) => [newAccount, ...prev]);
    fetch('/api/buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    }).catch(() => {});
    showNotification(`Wholesale shop registered for ${newAccount.businessName} in MongoDB.`);
  };

  const handleApproveBuyer = (buyerId: string, assignedTier: BuyerAccount['assignedTier']) => {
    const approvedDate = new Date().toISOString().split('T')[0];
    setBuyers((prev) =>
      prev.map((b) =>
        b.id === buyerId
          ? {
              ...b,
              status: 'APPROVED',
              assignedTier,
              approvedDate,
            }
          : b
      )
    );
    fetch(`/api/buyers/${buyerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED', assignedTier, approvedDate }),
    }).catch(() => {});
    showNotification('Wholesale Buyer Account Approved & updated in MongoDB.');
  };

  const handleRejectBuyer = (buyerId: string) => {
    setBuyers((prev) => prev.map((b) => (b.id === buyerId ? { ...b, status: 'REJECTED' } : b)));
    fetch(`/api/buyers/${buyerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    }).catch(() => {});
    showNotification('Application marked as rejected.');
  };

  const handleAddProductFromPipeline = (
    newProduct: ClothingProduct,
    job: ImageProcessingPipelineJob
  ) => {
    setProducts((prev) => [newProduct, ...prev]);
    setPipelineJobs((prev) => [job, ...prev]);
    showNotification(`Product ${newProduct.sku} synced to AWS S3 & MongoDB catalog!`);
  };

  const handleOneClickReorder = (order: WholesaleOrder) => {
    const reorderItems: BulkCartItem[] = order.items.map((item) => {
      const matched = products.find((p) => p.sku === item.sku) || products[0];
      return {
        product: matched,
        matrix: {
          [matched.colorways[0].id]: { [matched.sizeRange[0]]: item.totalPieces },
        },
        totalPieces: item.totalPieces,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        cartonCount: Math.ceil(item.totalPieces / (matched.piecesPerCarton || 24)),
        grossWeightKg: Number(((item.totalPieces * (matched.gramsPerPiece || 650)) / 1000).toFixed(1)),
      };
    });

    setCartItems((prev) => [...prev, ...reorderItems]);
    setIsCartOpen(true);
    showNotification(`Loaded ${order.totalPieces} suits from ${order.orderNumber} into cart.`);
  };

  const handleOrderPlaced = (newOrder: WholesaleOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});
    showNotification(`Wholesale PO ${newOrder.orderNumber} saved to MongoDB & queued for Bilti.`);
  };

  if (isAdminRoute) {
    return (
      <FactoryAdminRoute
        isAdminAuthenticated={isAdminAuthenticated}
        onAuthenticateAdmin={(pin) => {
          if (pin === '1234') {
            setIsAdminAuthenticated(true);
            setCurrentRole('ADMIN');
            return true;
          }
          return false;
        }}
        onExitAdminRoute={() => {
          setIsAdminRoute(false);
          setActiveTab('catalog');
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
        buyers={buyers}
        products={products}
        pipelineJobs={pipelineJobs}
        onApproveBuyer={handleApproveBuyer}
        onRejectBuyer={handleRejectBuyer}
        onAddProduct={handleAddProductFromPipeline}
        onSwitchToCatalog={() => {
          setIsAdminRoute(false);
          setActiveTab('catalog');
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans selection:bg-[#5E1B42]/15">
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'admin') {
            setIsAdminRoute(true);
            window.location.hash = 'admin';
          } else {
            setSelectedProductPage(null);
            if (typeof window !== 'undefined' && window.location.search.includes('sku=')) {
              window.history.pushState(null, '', '/');
            }
            setActiveTab(tab as any);
          }
        }}
        cartItemCount={cartItems.reduce((acc, i) => acc + i.totalPieces, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenAdminRoute={() => {
          setIsAdminRoute(true);
          window.location.hash = 'admin';
        }}
        currency={currency}
        onToggleCurrency={(c) => setCurrency(c)}
        cloudConnected={cloudConnected}
      />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-24 sm:max-w-sm z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-[#D4AF37]">
          <Sparkles className="w-4 h-4 text-[#F5D77F]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Pakistani WhatsApp Floating Wholesale Inquiry Button */}
      <a
        href="https://wa.me/923476128734?text=Assalam-o-Alaikum%20Sajawat%20Wholesale%20Pakistan%2C%20I%20want%20to%20order%20Women%20and%20Kids%20stitched%20wholesale%20bundles."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white h-12 w-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-emerald-300"
        title="Chat with Sajawat® Wholesale Desk on WhatsApp (+92 347 6128734)"
        aria-label="Chat with Sajawat Wholesale Desk on WhatsApp (+92 347 6128734)"
      >
        <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4 fill-current" />
        <span className="hidden sm:inline">WhatsApp: +92 347 6128734</span>
      </a>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'catalog' && selectedProductPage ? (
          <ProductDetailPage
            product={selectedProductPage}
            relatedProducts={products.filter(
              (p) => p.category === selectedProductPage.category && p.id !== selectedProductPage.id
            )}
            currentRole={currentRole}
            currency={currency}
            onBackToCatalog={closeProductPage}
            onSelectProduct={openProductPage}
            onAddToCart={handleAddToCart}
            onOpenMatrixModal={(prod) => setActiveMatrixProduct(prod)}
            onUnlockWholesale={() => setCurrentRole('RETAILER')}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
          />
        ) : activeTab === 'catalog' ? (
          <div className="space-y-10">
            <GatedHomepage
              currentRole={currentRole}
              onOpenRegister={() => setIsRegisterModalOpen(true)}
              onBrowseCatalog={(category) => {
                if (category) setCatalogCategory(category);
                const catalogEl = document.getElementById('wholesale-catalog-section');
                catalogEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSwitchToRetailer={() => setCurrentRole('RETAILER')}
              onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
            />

            <section
              id="wholesale-catalog-section"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
            >
              <BulkCatalog
                products={products}
                currentRole={currentRole}
                currency={currency}
                initialCategory={catalogCategory}
                onOpenMatrix={(prod) => setActiveMatrixProduct(prod)}
                onQuickAddBundle={handleQuickAddBundle}
                onOpenRegister={() => setIsRegisterModalOpen(true)}
                onUnlockWholesale={() => setCurrentRole('RETAILER')}
                onSelectProductDetails={openProductPage}
              />
            </section>

            {/* SEO-Rich Pakistan Wholesale FAQ & City Dispatch Guide Section */}
            <section className="bg-stone-100/70 border-t border-stone-200 py-14 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="max-w-3xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5E1B42]">
                    <HelpCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>Pakistan Stitched Garments Wholesale Guide &amp; FAQs</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    Frequently Asked Questions — Sajawat® Women &amp; Kids Wholesale
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Everything boutique owners, market wholesalers, and online resellers need to know about ordering factory-direct stitched clothes in Pakistan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200/90 space-y-2 shadow-2xs">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      1. What is the Minimum Order Quantity (MOQ) for Women’s &amp; Kids’ Stitched Suits?
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      For <strong>Women’s Stitched Suits</strong> (3-Piece Chiffon, 9000 Micro-Velvet, Winter Dhanak Shawl, Organza &amp; Mirror Pret), MOQ starts at just <strong>12 suits (1 standard set bundle)</strong> across sizes S, M, L, XL. For <strong>Kids’ Stitched Festive Suits</strong> (Ages 2Y–12Y), MOQ is <strong>18 sets</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200/90 space-y-2 shadow-2xs">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      2. How do I select colors and view full fabric specifications?
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Simply click any product in the catalog to open its dedicated <strong>Product Detail Page</strong>. There you can select individual colorways or full assorted bundles, adjust size quantities, and view complete fabric, embroidery, and Bilti packaging specifications.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200/90 space-y-2 shadow-2xs">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      3. How does Sajawat® compare to www.pehnavaa.com on price and quality?
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      While <strong>pehnavaa.com</strong> is a consumer retail storefront selling individual suits at Rs. 2,599–10,499, <strong>Sajawat®</strong> is a dedicated factory-direct B2B wholesale platform offering the same luxury fabric grades (9000 Micro-Velvet, Pure Crinkle Chiffon, Raw Silk Shararas, Dhanak Palachi Shawls) at <strong>35%–42% lower wholesale tier rates</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200/90 space-y-2 shadow-2xs">
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      4. How does Bilti delivery and payment work across Pakistan?
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      We dispatch strapped master cartons within 24–72 hours via <strong>TCS Overland Cargo, Daewoo FastEx Terminal Bilti, Leopard Cargo, and Truck Adda</strong> to Karachi, Lahore, Faisalabad, Rawalpindi, Islamabad, Multan, Gujranwala, Peshawar, and Sialkot. Payments are accepted via Meezan Bank, HBL, JazzCash Business, or 50% Advance + 50% on Bilti.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {activeTab === 'manufacturing' && (
          <ManufacturingMill
            onBrowseCatalog={() => setActiveTab('catalog')}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
          />
        )}

        {activeTab === 'portal' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {currentRole === 'GUEST' ? (
              <div className="bg-white rounded-2xl border border-[#E6D6C1] p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FDF4F8] text-[#5E1B42] flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#221A1F]">
                  Boutique Buyer Portal Gated
                </h3>
                <p className="text-xs text-[#5E4A54] leading-relaxed">
                  Unlock wholesale mode to view Bilti invoices, repeat past orders with 1 click, and download high-res photos from AWS S3.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentRole('RETAILER')}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] text-white rounded-xl"
                  >
                    1-Click Unlock Buyer Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-[#5E1B42] bg-[#FAF3E8] rounded-xl"
                  >
                    Register New Shop
                  </button>
                </div>
              </div>
            ) : (
              <BuyerPortal
                orders={orders}
                products={products}
                currency={currency}
                onOneClickReorder={handleOneClickReorder}
                onOpenMatrix={(prod) => setActiveMatrixProduct(prod)}
              />
            )}
          </section>
        )}

        {activeTab === 'benchmark' && (
          <PehnavaaBenchmark
            onExploreCatalog={() => setActiveTab('catalog')}
            onOpenMatrixWithSample={() => {
              setActiveMatrixProduct(products[0]);
            }}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      {activeMatrixProduct && (
        <BulkOrderMatrixModal
          key={activeMatrixProduct.id}
          product={activeMatrixProduct}
          currency={currency}
          onClose={() => setActiveMatrixProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <WholesaleRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmitAccount={handleSubmitAccount}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currency={currency}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderPlaced={handleOrderPlaced}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Sajawat® B2B Wholesale Footer */}
      <footer className="bg-stone-900 text-stone-300 text-xs py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/sajawat-logo.webp"
                  alt="Sajawat® Stitched Women & Kids"
                  className="w-24 h-14 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-stone-700"
                />
                <div>
                  <span className="font-serif text-lg font-bold text-white block">SAJAWAT®</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#F5D77F]">
                    Stitched Women &amp; Kids
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Pakistan’s #1 Factory-Direct Wholesale Platform for Women’s Stitched Suits &amp; Kids’ Festive Garments.
              </p>
              <div className="text-[11px] text-[#F5D77F] font-semibold">
                14 SPI Lockstitch · 9000 Micro-Velvet · Pure Crinkle Chiffon
              </div>
              <a
                href="https://wa.me/923476128734"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: +92 347 6128734</span>
              </a>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                Pakistan Wholesale Markets
              </div>
              <ul className="space-y-1.5 text-[11px] text-stone-400">
                <li>Lahore: Azam Cloth Market, Gulberg &amp; Liberty</li>
                <li>Karachi: Tariq Road, Bolton &amp; Jama Cloth</li>
                <li>Faisalabad: Karkhana Bazar &amp; D-Ground</li>
                <li>Rawalpindi / ISB: Raja Bazar &amp; Rabi Center</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                Stitched Wholesale Categories
              </div>
              <ul className="space-y-1.5 text-[11px] text-stone-400">
                <li>Women’s 3-Pc Embroidered Chiffon Suits</li>
                <li>Women’s 9000 Shahi Velvet &amp; Dhanak Shawls</li>
                <li>Girls’ Raw Silk &amp; Chiffon Sharara 3-Pc Sets</li>
                <li>Kids’ Winter Embroidered Velvet 2-Pc Suits</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                Cloud Infrastructure (AWS S3 + MongoDB)
              </div>
              <div className="space-y-1 text-[11px] font-mono text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-[#F5D77F]" />
                  <span>Bucket: {S3_BUCKET_INFO.bucketName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MongoDB: {S3_BUCKET_INFO.mongoDatabase}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdminRoute(true);
                  window.location.hash = 'admin';
                }}
                className="px-3.5 py-2 text-[11px] font-bold bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl transition-colors"
              >
                Open Client S3 Upload Pipeline
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <div>
              © 2026 Sajawat® Stitched Women &amp; Kids Wholesale Pakistan. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="/sitemap.xml" className="hover:text-white">
                XML Sitemap
              </a>
              <span>·</span>
              <a href="/robots.txt" className="hover:text-white">
                Robots.txt
              </a>
              <span>·</span>
              <span>TCS &amp; Daewoo Bilti Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
