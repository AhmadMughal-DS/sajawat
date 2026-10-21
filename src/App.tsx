/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, ClothingProduct, BuyerAccount, BulkCartItem, WholesaleOrder, ImageProcessingPipelineJob, MatrixInput } from './types/index.ts';
import { INITIAL_PRODUCTS, INITIAL_BUYERS, INITIAL_ORDERS, INITIAL_PIPELINE_JOBS } from './data/mockB2BData.ts';
import { Header } from './components/Header.tsx';
import { GatedHomepage } from './components/GatedHomepage.tsx';
import { BulkCatalog } from './components/BulkCatalog.tsx';
import { BulkOrderMatrixModal } from './components/BulkOrderMatrixModal.tsx';
import { WholesaleRegistrationModal } from './components/WholesaleRegistrationModal.tsx';
import { BuyerPortal } from './components/BuyerPortal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { FactoryAdminRoute } from './components/FactoryAdminRoute.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import { ManufacturingMill } from './components/ManufacturingMill.tsx';
import { PehnavaaBenchmark } from './components/PehnavaaBenchmark.tsx';
import { ShieldCheck, ArrowRight, Lock, Grid3X3, Sparkles, MessageCircle } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('GUEST');
  const [activeTab, setActiveTab] = useState<'catalog' | 'manufacturing' | 'portal' | 'benchmark'>('catalog');
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');

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

  // Sync hash changes for deep linking to /admin
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

  // Core Data States
  const [products, setProducts] = useState<ClothingProduct[]>(INITIAL_PRODUCTS);
  const [buyers, setBuyers] = useState<BuyerAccount[]>(INITIAL_BUYERS);
  const [orders, setOrders] = useState<WholesaleOrder[]>(INITIAL_ORDERS);
  const [pipelineJobs, setPipelineJobs] = useState<ImageProcessingPipelineJob[]>(INITIAL_PIPELINE_JOBS);
  const [cartItems, setCartItems] = useState<BulkCartItem[]>([]);

  // Modals & Drawers
  const [activeMatrixProduct, setActiveMatrixProduct] = useState<ClothingProduct | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

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
    showNotification(`Added ${totalPieces} sets of ${product.sku} to Bulk Cart.`);
  };

  // Remove item from cart
  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Wholesale Buyer Application Submission
  const handleSubmitAccount = (newAccount: BuyerAccount) => {
    setBuyers((prev) => [newAccount, ...prev]);
    showNotification(`Wholesale application submitted for ${newAccount.businessName}.`);
  };

  // Handle Admin Approving Buyer
  const handleApproveBuyer = (buyerId: string, assignedTier: BuyerAccount['assignedTier']) => {
    setBuyers((prev) =>
      prev.map((b) =>
        b.id === buyerId
          ? {
              ...b,
              status: 'APPROVED',
              assignedTier,
              approvedDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );
    showNotification('Wholesale Buyer Account Approved successfully with assigned tier.');
  };

  // Handle Admin Rejecting Buyer
  const handleRejectBuyer = (buyerId: string) => {
    setBuyers((prev) =>
      prev.map((b) => (b.id === buyerId ? { ...b, status: 'REJECTED' } : b))
    );
    showNotification('Application rejected and notice sent to applicant.');
  };

  // Zero-Touch: Add newly published product from pipeline directly into catalog
  const handleAddProductFromPipeline = (
    newProduct: ClothingProduct,
    job: ImageProcessingPipelineJob
  ) => {
    setProducts((prev) => [newProduct, ...prev]);
    setPipelineJobs((prev) => [job, ...prev]);
    showNotification(`Product ${newProduct.sku} zero-touch synchronized to wholesale catalog!`);
  };

  // One-Click Bulk Reorder
  const handleOneClickReorder = (order: WholesaleOrder) => {
    // Find matching products or mock items
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
    showNotification(`Loaded ${order.totalPieces} sets from ${order.orderNumber} into cart.`);
  };

  // Handle Wholesale Order Placed
  const handleOrderPlaced = (newOrder: WholesaleOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    showNotification(`Purchase Order ${newOrder.orderNumber} created in Buyer Portal.`);
  };

  // Dedicated Factory Admin Route rendering (/admin or #admin)
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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-[#D4AF37]/20">
      {/* Header with Top Bar Contract & Role Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'admin') {
            setIsAdminRoute(true);
            window.location.hash = 'admin';
          } else {
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
      />

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-neutral-700 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Pakistani WhatsApp Floating Direct Inquiries Button */}
      <a
        href="https://wa.me/923008472910?text=Assalam-o-Alaikum%20Sutura%20Wholesale%20Team%2C%20I%20am%20a%20boutique%20owner%20inquiring%20about%20stitched%20apparel%20bulk%20volume."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group border border-emerald-400"
        title="Chat directly with Factory Sales Manager on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-current" />
        <span className="hidden sm:inline">WhatsApp Factory Desk</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>

      {/* Main Body */}
      <main className="flex-1">
        {/* If Guest and on Catalog: Show Gated Hero first, then the Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-12">
            <GatedHomepage
              currentRole={currentRole}
              onOpenRegister={() => setIsRegisterModalOpen(true)}
              onBrowseCatalog={() => {
                const catalogEl = document.getElementById('wholesale-catalog-section');
                catalogEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSwitchToRetailer={() => setCurrentRole('RETAILER')}
              onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
            />

            <section id="wholesale-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <BulkCatalog
                products={products}
                currentRole={currentRole}
                currency={currency}
                onOpenMatrix={(prod) => setActiveMatrixProduct(prod)}
                onOpenRegister={() => setIsRegisterModalOpen(true)}
                onSelectProductDetails={(prod) => setActiveMatrixProduct(prod)}
              />
            </section>
          </div>
        )}

        {/* Manufacturing Mill Tab */}
        {activeTab === 'manufacturing' && (
          <ManufacturingMill
            onBrowseCatalog={() => setActiveTab('catalog')}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
          />
        )}

        {/* Buyer Portal Tab */}
        {activeTab === 'portal' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {currentRole === 'GUEST' ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF5E6] text-[#D4AF37] flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1E1E1E]">
                  Buyer Portal Access Gated
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The Buyer Portal contains sensitive commercial invoices, proprietary marketing asset downloads, and live air/ocean cargo tracking for verified accounts.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded transition-colors"
                  >
                    Apply for Wholesale Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRole('RETAILER')}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                  >
                    Quick Switch to Retailer Role
                  </button>
                </div>
              </div>
            ) : (
              <BuyerPortal
                orders={orders}
                products={products}
                onOneClickReorder={handleOneClickReorder}
                onOpenMatrix={(prod) => setActiveMatrixProduct(prod)}
              />
            )}
          </section>
        )}

        {/* Pehnavaa.com Comparative Benchmark Tab */}
        {activeTab === 'benchmark' && (
          <PehnavaaBenchmark
            onExploreCatalog={() => setActiveTab('catalog')}
            onOpenMatrixWithSample={() => {
              setActiveMatrixProduct(products[0]);
            }}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <BulkOrderMatrixModal
        product={activeMatrixProduct}
        currency={currency}
        onClose={() => setActiveMatrixProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <WholesaleRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmitAccount={handleSubmitAccount}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderPlaced={handleOrderPlaced}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Clean B2B Footer */}
      <footer className="bg-[#18181A] text-neutral-400 text-xs py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-neutral-800">
            <div className="space-y-3">
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                SUTURA ATELIER
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Export-certified contract garment manufacturing & B2B wholesale platform for women’s luxury stitched pret and children's festive clothing.
              </p>
              <div className="text-[11px] text-[#D4AF37]">
                Sedex SMETA 4-Pillar · ISO 9001:2015 · OEKO-TEX 100
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Wholesale Operations
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>FOB Karachi Port Dispatch</li>
                <li>CIF New York & CIF London Sea Freight</li>
                <li>DDP Express Air Cargo Consolidation</li>
                <li>Retail Packaging & Barcode Polybags</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Security & Platform
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>Strict JWT Wholesale Gating</li>
                <li>Binary MIME & Malware Sanitization</li>
                <li>Pillow Multi-Scale WebP Pipeline</li>
                <li>NoSQL Injection Defense Middleware</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Full-Stack Architecture
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Next.js App Router, FastAPI asynchronous backend, and containerized Docker orchestrations.
              </p>
              <button
                type="button"
                onClick={() => setIsArchitectureModalOpen(true)}
                className="px-3 py-1.5 text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors"
              >
                View Production Code Files
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
            <div>
              © 2026 Sutura B2B Wholesale Atelier Ltd. All rights reserved. Strictly Business-to-Business.
            </div>
            <div className="flex items-center gap-4">
              <span>Terms of Wholesale Supply</span>
              <span>·</span>
              <span>Freight Incoterms 2020</span>
              <span>·</span>
              <span>Compliance Disclosures</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
