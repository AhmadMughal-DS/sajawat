import React, { useState } from 'react';
import { WholesaleOrder, ClothingProduct } from '../types/index.ts';
import {
  FileText,
  Download,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Package,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Plane,
} from 'lucide-react';

interface BuyerPortalProps {
  orders: WholesaleOrder[];
  products: ClothingProduct[];
  onOneClickReorder: (order: WholesaleOrder) => void;
  onOpenMatrix: (product: ClothingProduct) => void;
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  orders,
  products,
  onOneClickReorder,
  onOpenMatrix,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'ORDERS' | 'ASSETS' | 'TRACKING'>('ORDERS');
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<WholesaleOrder>(orders[0]);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const triggerMockDownload = (filename: string) => {
    // Generate simulated downloadable file
    const content = `SUTURA B2B WHOLESALE ATELIER\nEXPORT ASSET PACK: ${filename}\nGenerated for Verified Retailer\nContains: 4K Master RAW, 1200w Catalog, 1:1 Instagram Square, 9:16 Stories, Clean White E-com Cuts.`;
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Downloaded package: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Retailer Header Card */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#97731B]">
                Verified B2B Retailer Account
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-xs font-mono text-neutral-600">ID: SUT-RET-8841</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              Noor Modern Boutiques LLC
            </h2>
            <p className="text-xs text-[#666666]">
              Chicago & Dallas Retail Locations · Tax ID: US-IL-36-8291047 · Primary Buyer: Farah Al-Sabah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#FAF9F5] border border-[#E9DFCA] p-3 rounded-xl text-xs">
              <div className="text-[11px] text-neutral-500">Assigned Wholesale Tier:</div>
              <div className="font-bold text-[#1E1E1E] text-sm mt-0.5">Tier 2 Volume Discount</div>
            </div>
            <div className="bg-[#FAF9F5] border border-[#E9DFCA] p-3 rounded-xl text-xs">
              <div className="text-[11px] text-neutral-500">Commercial Credit Line:</div>
              <div className="font-bold text-[#1E1E1E] text-sm mt-0.5">Net 30 ($50,000 USD)</div>
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-[#F0F0F0] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActivePortalTab('ORDERS')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activePortalTab === 'ORDERS'
                ? 'bg-[#1E1E1E] text-white font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Purchase Orders & Invoices ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePortalTab('ASSETS')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activePortalTab === 'ASSETS'
                ? 'bg-[#1E1E1E] text-white font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Download Marketing Asset Packs (ZIP)
          </button>
          <button
            type="button"
            onClick={() => setActivePortalTab('TRACKING')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              activePortalTab === 'TRACKING'
                ? 'bg-[#1E1E1E] text-white font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Plane className="w-4 h-4" />
            Live Cargo Freight Tracker
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice} — High-resolution boutique assets ready for Shopify/Instagram!</span>
        </div>
      )}

      {/* TAB 1: ORDERS & INVOICES */}
      {activePortalTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-[#F0F0F0] flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-[#1E1E1E]">
              Commercial Invoices & Factory Purchase Orders
            </h3>
            <span className="text-xs text-neutral-500">
              Showing past consolidated air & sea consignments
            </span>
          </div>

          <div className="divide-y divide-[#EAEAEA]">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-[#FAF9F5] transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#1E1E1E]">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-neutral-500">· Placed on {order.date}</span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                          order.fulfillmentStatus === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.fulfillmentStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 mt-1">
                      Incoterm: <strong>{order.incoterm}</strong> · Carrier: {order.carrier} (Tracking: <span className="font-mono">{order.trackingNumber}</span>)
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[11px] text-neutral-500">Consignment Sets:</div>
                      <div className="font-mono font-bold text-sm text-[#1E1E1E] tabular-nums">
                        {order.totalPieces} sets
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-neutral-500">Invoice Total:</div>
                      <div className="font-mono font-bold text-base text-[#D4AF37] tabular-nums">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized Line Items */}
                <div className="bg-[#FAF9F6] rounded-xl p-4 border border-[#ECEAE2] space-y-2 text-xs">
                  <div className="font-semibold text-neutral-700 text-[11px] uppercase tracking-wide">
                    Consignment Breakdown:
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <div>
                        <span className="font-medium text-[#1E1E1E]">{item.productTitle}</span>
                        <span className="font-mono text-[11px] text-neutral-500 ml-2">({item.sku})</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-neutral-700">
                        <span>{item.totalPieces} sets @ ${item.unitPrice.toFixed(2)}</span>
                        <span className="font-bold text-[#1E1E1E]">${item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons: One Click Reorder & Invoices */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerMockDownload(`${order.orderNumber}_ProForma_Invoice.pdf`)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Pro-Forma PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerMockDownload(`${order.orderNumber}_Commercial_Packing_List.csv`)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Packing List (CSV)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrackingOrder(order);
                        setActivePortalTab('TRACKING');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-[#204080] bg-[#EEF4FF] rounded hover:bg-[#E0ECFF] flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Track Consignment
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOneClickReorder(order)}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#1E1E1E] hover:bg-[#D4AF37] hover:text-[#1E1E1E] text-white rounded transition-colors flex items-center gap-2 shadow-xs active:scale-98"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    One-Click Bulk Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOWNLOAD MARKETING ASSET PACKS */}
      {activePortalTab === 'ASSETS' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F5] border border-[#E8DFC9] rounded-2xl p-6">
            <h3 className="font-serif text-xl font-bold text-[#1E1E1E]">
              Retailer Social Media & E-Commerce Marketing Kits
            </h3>
            <p className="text-xs text-[#555555] mt-1 max-w-2xl leading-relaxed">
              Approved Sutura retailers gain unrestricted commercial distribution rights to our studio photography, lookbook shots, and pre-formatted social media assets to launch marketing campaigns for their boutiques immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-[#E8E8E8] p-5 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                    <img
                      src={product.catalogImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] text-neutral-500">{product.sku}</span>
                    <h4 className="font-serif text-base font-semibold text-[#1E1E1E] line-clamp-1">
                      {product.title}
                    </h4>
                    <p className="text-xs text-[#666666] line-clamp-2">{product.suitType}</p>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#EDEAE0] space-y-1 text-xs">
                  <div className="font-semibold text-neutral-700 text-[11px]">Included in Asset ZIP:</div>
                  <ul className="text-[11px] text-neutral-600 space-y-0.5 list-disc list-inside">
                    <li>4K Master RAW Lookbook Photography</li>
                    <li>1:1 Square (1080x1080) for Instagram & Facebook feeds</li>
                    <li>9:16 Vertical (1080x1920) for Instagram Stories & TikTok</li>
                    <li>Clean Pure White Background Cutouts for Shopify Catalog</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-neutral-500 font-mono">Archive Size: ~45 MB ZIP</span>
                  <button
                    type="button"
                    onClick={() => triggerMockDownload(`${product.sku}_Marketing_Asset_Pack.zip`)}
                    className="px-4 py-2 text-xs font-semibold bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded transition-colors flex items-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Asset Pack (ZIP)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE CARGO FREIGHT TRACKER */}
      {activePortalTab === 'TRACKING' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                Live Cargo Milestone Tracking
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1E1E1E]">
                Consignment {selectedTrackingOrder.orderNumber}
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Carrier: <strong>{selectedTrackingOrder.carrier}</strong> · Tracking No:{' '}
                <span className="font-mono font-medium">{selectedTrackingOrder.trackingNumber}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-neutral-500">Estimated Port/Airport Arrival:</div>
              <div className="font-mono font-bold text-lg text-emerald-700">
                {selectedTrackingOrder.estimatedDelivery}
              </div>
            </div>
          </div>

          {/* Shipment Milestone Progress Stepper */}
          <div className="space-y-6 pt-2">
            <div className="relative border-l-2 border-neutral-200 ml-4 space-y-8 pl-6">
              {selectedTrackingOrder.milestones.map((ms, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      ms.completed
                        ? 'bg-emerald-600 border-white text-white'
                        : 'bg-white border-neutral-300 text-neutral-400'
                    }`}
                  >
                    {ms.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4
                        className={`text-sm font-semibold ${
                          ms.completed ? 'text-[#1E1E1E]' : 'text-neutral-500'
                        }`}
                      >
                        {ms.step}
                      </h4>
                      <span className="text-xs font-mono text-neutral-400">{ms.date}</span>
                    </div>
                    <div className="text-xs text-neutral-600">
                      Checkpoint: <span className="font-medium">{ms.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
