import React, { useState } from 'react';
import { BulkCartItem, WholesaleOrder } from '../types/index.ts';
import { X, Trash2, Box, Truck, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: BulkCartItem[];
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: WholesaleOrder) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) => {
  if (!isOpen) return null;

  const [incoterm, setIncoterm] = useState<WholesaleOrder['incoterm']>('DDP Express Air');
  const [orderConfirmed, setOrderConfirmed] = useState<WholesaleOrder | null>(null);

  // Totals
  const totalPieces = cartItems.reduce((acc, item) => acc + item.totalPieces, 0);
  const totalSubtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCartons = cartItems.reduce((acc, item) => acc + item.cartonCount, 0);
  const totalGrossWeightKg = Number(
    cartItems.reduce((acc, item) => acc + item.grossWeightKg, 0).toFixed(1)
  );

  // Freight estimation based on incoterm and weight
  const getFreightEstimate = () => {
    if (totalPieces === 0) return 0;
    if (incoterm === 'FOB Karachi') return 0; // Buyer pays freight
    if (incoterm === 'CIF New York') return Number((totalPieces * 2.2).toFixed(2));
    if (incoterm === 'CIF London') return Number((totalPieces * 2.0).toFixed(2));
    if (incoterm === 'DDP Express Air') return Number((totalGrossWeightKg * 6.5).toFixed(2));
    return 0;
  };

  const estimatedFreight = getFreightEstimate();
  const grandTotal = totalSubtotal + estimatedFreight;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    const newOrder: WholesaleOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `B2B-PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().split('T')[0],
      buyerName: 'Farah Al-Sabah',
      businessName: 'Noor Modern Boutiques LLC',
      items: cartItems.map((item) => ({
        productTitle: item.product.title,
        sku: item.product.sku,
        totalPieces: item.totalPieces,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      totalPieces,
      subtotal: totalSubtotal,
      estimatedFreight,
      incoterm,
      totalAmount: grandTotal,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'QUEUED',
      trackingNumber: `CARGO-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      carrier: incoterm === 'DDP Express Air' ? 'Emirates SkyCargo Priority' : 'Maersk Line Ocean LCL',
      cargoType: incoterm === 'DDP Express Air' ? 'Air Cargo Priority' : 'Ocean LCL Freight',
      estimatedDelivery: '10-14 Business Days',
      milestones: [
        {
          step: 'Consolidated Bulk Order Logged',
          location: 'Sutura Atelier Factory HQ',
          date: new Date().toISOString().split('T')[0],
          completed: true,
        },
        {
          step: 'Scheduled for Cutting & Multi-head Embroidery',
          location: 'Production Unit #1',
          date: 'Pending',
          completed: false,
        },
      ],
    };

    onOrderPlaced(newOrder);
    setOrderConfirmed(newOrder);
    onClearCart();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200">
        {/* Drawer Header */}
        <div className="bg-[#FAF9F6] px-6 py-4 border-b border-[#E8E6DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 id="cart-drawer-title" className="font-serif text-xl font-bold text-[#1E1E1E]">
              B2B Wholesale Bulk Cart
            </h2>
            <span className="text-xs bg-[#FAF5E6] text-[#97731B] border border-[#E9DFCA] font-mono px-2 py-0.5 rounded font-bold">
              {totalPieces} Sets
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {orderConfirmed ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1E1E1E]">
                Wholesale Purchase Order Issued!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
                Order <strong>{orderConfirmed.orderNumber}</strong> for {orderConfirmed.totalPieces} sets (${orderConfirmed.totalAmount.toFixed(2)}) has been queued into manufacturing dispatch.
              </p>
              <div className="p-4 bg-[#FAF9F6] border border-neutral-200 rounded-xl text-left text-xs space-y-1.5">
                <div>
                  <strong>Incoterm:</strong> {orderConfirmed.incoterm}
                </div>
                <div>
                  <strong>Estimated Delivery:</strong> {orderConfirmed.estimatedDelivery}
                </div>
                <div>
                  <strong>Tracking / Airway Bill:</strong>{' '}
                  <span className="font-mono">{orderConfirmed.trackingNumber}</span>
                </div>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOrderConfirmed(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#1E1E1E] text-white rounded hover:bg-[#D4AF37] hover:text-[#1E1E1E] transition-colors"
                >
                  Close & View in Buyer Portal
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <Box className="w-6 h-6" />
              </div>
              <p className="text-sm text-neutral-500 font-medium">Your bulk cart is currently empty.</p>
              <p className="text-xs text-neutral-400">
                Select a stitched collection from the catalog and open the Bulk Order Matrix to enter quantities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF9F6] border border-[#EBE8DE] rounded-xl p-4 space-y-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    aria-label="Remove item"
                    className="absolute top-3 right-3 text-neutral-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
                      <img
                        src={item.product.catalogImage}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-0.5 pr-6">
                      <span className="font-mono text-[10px] text-neutral-500">{item.product.sku}</span>
                      <h4 className="font-serif text-sm font-semibold text-[#1E1E1E] line-clamp-1">
                        {item.product.title}
                      </h4>
                      <div className="text-xs text-neutral-600">
                        {item.totalPieces} sets @ ${item.unitPrice.toFixed(2)}/set
                      </div>
                    </div>
                  </div>

                  {/* Packaging Estimate */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-600 bg-white p-2 rounded border border-neutral-200">
                    <span className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {item.cartonCount} Master Cartons ({item.grossWeightKg} kg)
                    </span>
                    <span className="font-mono font-bold text-sm text-[#1E1E1E] tabular-nums">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Incoterm and Global Logistics Selector */}
              <div className="bg-[#FAF9F5] border border-[#E9DFCA] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    Incoterm & Freight Method:
                  </span>
                </div>

                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value as WholesaleOrder['incoterm'])}
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 rounded focus:border-[#D4AF37] outline-none"
                >
                  <option value="DDP Express Air">
                    DDP Express Air (Door-to-door, customs cleared, 5-7 days)
                  </option>
                  <option value="CIF New York">
                    CIF New York (Ocean LCL / Palletized to Port of NY/NJ)
                  </option>
                  <option value="CIF London">
                    CIF London (Ocean LCL to Port of London / Southampton)
                  </option>
                  <option value="FOB Karachi">
                    FOB Karachi (Port of origin dispatch; buyer nominates forwarder)
                  </option>
                </select>

                <div className="text-[11px] text-neutral-600">
                  Total Packaging: <strong>{totalCartons} Export Master Cartons</strong> · Gross Cargo Weight: <strong>{totalGrossWeightKg} kg</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && !orderConfirmed && (
          <div className="bg-[#FAF9F6] p-6 border-t border-[#E8E6DF] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>FOB Mill Subtotal:</span>
                <span className="font-mono font-bold text-[#1E1E1E]">${totalSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated International Freight ({incoterm}):</span>
                <span className="font-mono font-bold text-[#1E1E1E]">
                  {estimatedFreight === 0 ? 'FOB (Buyer Arranged)' : `$${estimatedFreight.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-300 flex justify-between text-base font-bold text-[#1E1E1E]">
                <span>Total Wholesale Order Amount:</span>
                <span className="font-mono text-xl text-[#D4AF37] tabular-nums">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full py-3 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded transition-colors shadow-xs active:scale-98"
              >
                Submit Wholesale Purchase Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
