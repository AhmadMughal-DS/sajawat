import React, { useState } from 'react';
import { WholesaleOrder, ClothingProduct } from '../types/index.ts';
import { formatCurrency } from '../utils/b2bLogic.ts';
import {
  FileText,
  Download,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';

interface BuyerPortalProps {
  orders: WholesaleOrder[];
  products: ClothingProduct[];
  currency?: 'PKR' | 'USD';
  onOneClickReorder: (order: WholesaleOrder) => void;
  onOpenMatrix: (product: ClothingProduct) => void;
}

export const BuyerPortal: React.FC<BuyerPortalProps> = ({
  orders,
  products,
  currency = 'PKR',
  onOneClickReorder,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'ORDERS' | 'ASSETS' | 'TRACKING'>('ORDERS');
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<WholesaleOrder>(orders[0]);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const triggerDownload = (filename: string, s3Url?: string) => {
    if (s3Url && s3Url.startsWith('http')) {
      window.open(s3Url, '_blank', 'noopener,noreferrer');
    } else {
      const content = `SAJAWAT® STITCHED WOMEN & KIDS WHOLESALE PAKISTAN\nDocument: ${filename}\nVerified Wholesale Buyer Copy`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setDownloadNotice(`Opened / Downloaded: ${filename}`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-[#E6D6C1] p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5E1B42]">
                Verified Pakistani Wholesale Account
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-xs font-mono text-[#6B5360]">ID: SJW-PK-8841</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221A1F]">
              Al-Karam &amp; Gulberg Pret Emporium
            </h2>
            <p className="text-xs text-[#5E4A54]">
              Lahore (Azam Cloth Market &amp; Liberty) · FBR NTN: 7421890-3 · Primary Buyer: Haji Muhammad Usman Butt
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#FAF3E8] border border-[#E5D5C0] p-3 rounded-xl text-xs">
              <div className="text-[11px] text-[#6B5360]">Wholesale Pricing Tier:</div>
              <div className="font-bold text-[#5E1B42] text-sm mt-0.5">Tier 3 Master Bundle Rate</div>
            </div>
            <div className="bg-[#FAF3E8] border border-[#E5D5C0] p-3 rounded-xl text-xs">
              <div className="text-[11px] text-[#6B5360]">Payment &amp; Bilti Facility:</div>
              <div className="font-bold text-[#221A1F] text-sm mt-0.5">50% Advance / 50% on Bilti</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-[#EFE6D8]">
          <button
            type="button"
            onClick={() => setActivePortalTab('ORDERS')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activePortalTab === 'ORDERS'
                ? 'bg-[#5E1B42] text-white'
                : 'bg-[#FAF3E8]/70 text-[#5E4A54] hover:bg-[#FAF3E8]'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Purchase Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortalTab('ASSETS')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activePortalTab === 'ASSETS'
                ? 'bg-[#5E1B42] text-white'
                : 'bg-[#FAF3E8]/70 text-[#5E4A54] hover:bg-[#FAF3E8]'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>S3 Boutique Photos ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortalTab('TRACKING')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activePortalTab === 'TRACKING'
                ? 'bg-[#5E1B42] text-white'
                : 'bg-[#FAF3E8]/70 text-[#5E4A54] hover:bg-[#FAF3E8]'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Live Bilti Tracker</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {activePortalTab === 'ORDERS' && (
        <div className="bg-white rounded-2xl border border-[#E6D6C1] overflow-hidden shadow-2xs divide-y divide-[#EFE6D8]">
          {orders.map((order) => (
            <div key={order.id} className="p-4 sm:p-6 hover:bg-[#FDFBF7] transition-colors space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#5E1B42]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-[#6B5360]">· {order.date}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {order.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5E4A54] mt-1">
                    Bilti Carrier: <strong>{order.carrier}</strong> · Bilti No:{' '}
                    <span className="font-mono font-bold">{order.trackingNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[11px] text-[#6B5360]">Total Suits:</div>
                    <div className="font-mono font-bold text-sm text-[#221A1F]">
                      {order.totalPieces} sets
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B5360]">Total Invoice:</div>
                    <div className="font-mono font-bold text-base text-[#5E1B42]">
                      {formatCurrency(order.totalAmount, currency)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF6F0] rounded-xl p-3.5 sm:p-4 border border-[#E6D6C1] divide-y divide-[#EBE0D0] text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="font-semibold text-[#221A1F]">{item.productTitle}</span>
                      <span className="font-mono text-[11px] text-[#6B5360] ml-1.5">({item.sku})</span>
                    </div>
                    <div className="font-mono font-bold text-[#5E1B42] sm:text-[#221A1F] whitespace-nowrap">
                      {item.totalPieces} sets × {formatCurrency(item.unitPrice, currency)} ={' '}
                      {formatCurrency(item.subtotal, currency)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerDownload(`${order.orderNumber}_Bilti_Invoice.txt`)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#5E1B42] bg-[#FAF3E8] border border-[#E2D0B8] rounded-lg hover:bg-[#F3E5D0] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Bilti Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrackingOrder(order);
                      setActivePortalTab('TRACKING');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#5E1B42] bg-[#FDF4F8] border border-[#F3D1E2] rounded-lg flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Track Bilti
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOneClickReorder(order)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  1-Click Repeat Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activePortalTab === 'ASSETS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#E6D6C1] p-4 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="flex gap-3.5">
                <img
                  src={product.catalogImage}
                  alt={product.title}
                  className="w-20 h-24 rounded-xl object-cover border border-[#E2D0B8] shrink-0"
                />
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#5E1B42]">{product.sku}</span>
                  <h4 className="font-serif text-sm font-bold text-[#221A1F] line-clamp-2">
                    {product.title}
                  </h4>
                  <span className="inline-block text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    AWS S3 Master WebP
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => triggerDownload(`${product.sku}.webp`, product.catalogImage)}
                className="w-full py-2 text-xs font-bold bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Open S3 High-Res Photo
              </button>
            </div>
          ))}
        </div>
      )}

      {activePortalTab === 'TRACKING' && selectedTrackingOrder && (
        <div className="bg-white rounded-2xl border border-[#E6D6C1] p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE6D8]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5E1B42]">
                Pakistan Bilti &amp; Cargo Milestone Tracker
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#221A1F]">
                {selectedTrackingOrder.orderNumber} ({selectedTrackingOrder.trackingNumber})
              </h3>
            </div>
            <div className="font-mono font-bold text-sm text-emerald-700">
              {selectedTrackingOrder.estimatedDelivery}
            </div>
          </div>

          <div className="relative border-l-2 border-[#E5D5C0] ml-4 space-y-6 pl-6">
            {selectedTrackingOrder.milestones.map((ms, idx) => (
              <div key={idx} className="relative">
                <div
                  className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    ms.completed
                      ? 'bg-emerald-600 border-white text-white'
                      : 'bg-white border-neutral-300 text-neutral-400'
                  }`}
                >
                  {ms.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#221A1F]">{ms.step}</div>
                  <div className="text-[#6B5360]">
                    {ms.location} · {ms.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
