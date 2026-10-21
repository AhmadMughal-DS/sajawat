import React, { useState } from 'react';
import { BulkCartItem, WholesaleOrder } from '../types/index.ts';
import { formatCurrency } from '../utils/b2bLogic.ts';
import { X, Trash2, Box, Truck, CheckCircle2, MessageCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: BulkCartItem[];
  currency?: 'PKR' | 'USD';
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: WholesaleOrder) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency = 'PKR',
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) => {
  if (!isOpen) return null;

  const [incoterm, setIncoterm] = useState<WholesaleOrder['incoterm']>('TCS Overland Bilti');
  const [cityName, setCityName] = useState('Lahore (Azam Cloth Market / Gulberg)');
  const [shopName, setShopName] = useState('Al-Noor Boutique & Garments');
  const [phoneNum, setPhoneNum] = useState('+92 300 ');
  const [orderConfirmed, setOrderConfirmed] = useState<WholesaleOrder | null>(null);

  const totalPieces = cartItems.reduce((acc, item) => acc + item.totalPieces, 0);
  const totalSubtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCartons = cartItems.reduce((acc, item) => acc + item.cartonCount, 0);
  const totalGrossWeightKg = Number(
    cartItems.reduce((acc, item) => acc + item.grossWeightKg, 0).toFixed(1)
  );

  // Realistic Pakistan Bilti & Export Freight estimation in PKR
  const getFreightEstimatePkr = () => {
    if (totalPieces === 0) return 0;
    if (incoterm === 'TCS Overland Bilti') return Math.round(totalCartons * 1250);
    if (incoterm === 'Daewoo FastEx Cargo') return Math.round(totalCartons * 1100);
    if (incoterm === 'Leopard Overland Bilti') return Math.round(totalCartons * 1150);
    if (incoterm === 'Truck Adda Cargo') return Math.round(totalCartons * 750);
    if (incoterm === 'FOB Karachi') return 0;
    if (incoterm === 'DDP Express Air') return Math.round(totalGrossWeightKg * 1950);
    return Math.round(totalCartons * 1200);
  };

  const estimatedFreight = getFreightEstimatePkr();
  const grandTotal = totalSubtotal + estimatedFreight;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    const newOrder: WholesaleOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `SJW-PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().split('T')[0],
      buyerName: shopName || 'Verified Wholesale Buyer',
      businessName: `${shopName} (${cityName})`,
      city: cityName,
      phone: phoneNum,
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
      paymentStatus: '50%_ADVANCE_BILTI',
      fulfillmentStatus: 'QUEUED',
      trackingNumber: `BILTI-${Math.floor(Math.random() * 9000000 + 1000000)}`,
      carrier: incoterm,
      cargoType: incoterm.includes('Air') ? 'Air Cargo Priority' : 'Domestic Overland Bilti',
      estimatedDelivery: '24–72 Hours All-Pakistan Bilti Dispatch',
      milestones: [
        {
          step: 'Wholesale Purchase Order Logged in Sajawat MongoDB',
          location: 'Sajawat® Wholesale Desk',
          date: new Date().toISOString().split('T')[0],
          completed: true,
        },
        {
          step: 'Master Cartons Packing & Bilti Receipt Issuance',
          location: 'Stitching & Dispatch Unit #1',
          date: 'Within 24 Hours',
          completed: false,
        },
      ],
    };

    onOrderPlaced(newOrder);
    setOrderConfirmed(newOrder);
    onClearCart();
  };

  const buildWhatsAppOrderUrl = () => {
    const lines = [
      `Assalam-o-Alaikum Sajawat® Wholesale Desk,`,
      `New Bulk Order from: *${shopName}* (${cityName})`,
      `--------------------------`,
      ...cartItems.map(
        (i) =>
          `• *${i.product.sku}* — ${i.totalPieces} suits @ Rs.${i.unitPrice.toLocaleString()} = Rs.${i.subtotal.toLocaleString()}`
      ),
      `--------------------------`,
      `Total Suits: *${totalPieces} Sets* (${totalCartons} Cartons)`,
      `Bilti Method: *${incoterm}*`,
      `Total Amount: *Rs. ${grandTotal.toLocaleString()} PKR*`,
    ];
    return `https://wa.me/923476128734?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E5D5C0]">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-[#2F0B20] to-[#471231] text-white px-6 py-4 border-b border-[#732252] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 id="cart-drawer-title" className="font-serif text-xl font-bold text-white">
              Sajawat® Wholesale Bulk Cart
            </h2>
            <span className="text-xs bg-[#F5D77F] text-[#221A1F] font-mono px-2.5 py-0.5 rounded-md font-bold">
              {totalPieces} Suits
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart drawer"
            className="p-1.5 text-[#E8CEDB] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {orderConfirmed ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#221A1F]">
                Wholesale Purchase Order Issued!
              </h3>
              <p className="text-xs text-[#5E4A54] leading-relaxed max-w-md mx-auto">
                Order <strong>{orderConfirmed.orderNumber}</strong> for {orderConfirmed.totalPieces} stitched sets (
                <strong>{formatCurrency(orderConfirmed.totalAmount, currency)}</strong>) has been saved to MongoDB and queued for Bilti dispatch.
              </p>
              <div className="p-4 bg-[#FAF3E8] border border-[#E5D5C0] rounded-xl text-left text-xs space-y-1.5">
                <div>
                  <strong>Shop / Boutique:</strong> {orderConfirmed.businessName}
                </div>
                <div>
                  <strong>Bilti / Cargo Carrier:</strong> {orderConfirmed.incoterm}
                </div>
                <div>
                  <strong>Estimated Dispatch:</strong> {orderConfirmed.estimatedDelivery}
                </div>
                <div>
                  <strong>Bilti Receipt ID:</strong>{' '}
                  <span className="font-mono font-bold text-[#5E1B42]">{orderConfirmed.trackingNumber}</span>
                </div>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOrderConfirmed(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] text-white rounded-xl hover:bg-[#732252] transition-colors"
                >
                  Close &amp; View in Buyer Portal
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FDF4F8] text-[#5E1B42] flex items-center justify-center mx-auto">
                <Box className="w-6 h-6" />
              </div>
              <p className="text-sm text-[#221A1F] font-semibold">Your Sajawat® wholesale cart is empty.</p>
              <p className="text-xs text-[#6B5360] max-w-xs mx-auto">
                Click &ldquo;+12 Set&rdquo; / &ldquo;+18 Set&rdquo; on any product card or open the Bulk Matrix to add stitched bundles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF6F0] border border-[#E6D6C1] rounded-xl p-4 space-y-3 relative"
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
                    <div className="w-16 h-20 rounded-lg bg-neutral-200 overflow-hidden shrink-0 border border-[#DED0BE]">
                      <img
                        src={item.product.catalogImage}
                        alt={item.product.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="space-y-0.5 pr-6">
                      <span className="font-mono text-[10px] font-bold text-[#5E1B42]">{item.product.sku}</span>
                      <h4 className="font-serif text-sm font-bold text-[#221A1F] line-clamp-1">
                        {item.product.title}
                      </h4>
                      <div className="text-xs text-[#5E4A54]">
                        {item.totalPieces} suits @ <strong>{formatCurrency(item.unitPrice, currency)}</strong>/suit
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5E4A54] bg-white p-2.5 rounded-lg border border-[#E6D6C1]">
                    <span className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-[#5E1B42]" />
                      {item.cartonCount} Master Cartons ({item.grossWeightKg} kg)
                    </span>
                    <span className="font-mono font-bold text-sm text-[#5E1B42] tabular-nums">
                      {formatCurrency(item.subtotal, currency)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pakistani Destination & Bilti Selector */}
              <div className="bg-[#FAF3E8] border border-[#E4D2BA] p-4 rounded-xl space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5E1B42] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#C59B27]" />
                  Pakistan Bilti &amp; Shop Dispatch Details:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#5E4A54] mb-1">
                      Boutique / Shop Name
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#D8C7B2] rounded-lg outline-none focus:border-[#5E1B42]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#5E4A54] mb-1">
                      Delivery City / Market
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#D8C7B2] rounded-lg outline-none focus:border-[#5E1B42]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#5E4A54] mb-1">
                    Preferred Bilti / Cargo Service
                  </label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value as WholesaleOrder['incoterm'])}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none font-medium"
                  >
                    <option value="TCS Overland Bilti">
                      TCS Overland Cargo Bilti (24–48 Hrs Nationwide Door Delivery)
                    </option>
                    <option value="Daewoo FastEx Cargo">
                      Daewoo FastEx Bus Terminal Bilti (Same / Next Day Pickup)
                    </option>
                    <option value="Leopard Overland Bilti">
                      Leopard Overland Bilti (All Pakistan Retail Markets)
                    </option>
                    <option value="Truck Adda Cargo">
                      Karachi / Lahore / Faisalabad Truck Adda Bilti (Lowest Cost Bulk)
                    </option>
                    <option value="DDP Express Air">
                      International DHL / SkyCargo Export (UK / USA / UAE / Canada)
                    </option>
                  </select>
                </div>

                <div className="text-[11px] text-[#5E4A54]">
                  Total Packaging: <strong>{totalCartons} Master Cartons</strong> · Gross Bilti Weight:{' '}
                  <strong>{totalGrossWeightKg} kg</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && !orderConfirmed && (
          <div className="bg-[#FAF3E8] p-5 border-t border-[#E5D5C0] space-y-3.5">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5E4A54]">
                <span>Factory Wholesale Subtotal ({totalPieces} Suits):</span>
                <span className="font-mono font-bold text-[#221A1F]">
                  {formatCurrency(totalSubtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#5E4A54]">
                <span>Est. Bilti / Cargo Charges ({incoterm}):</span>
                <span className="font-mono font-bold text-[#221A1F]">
                  {estimatedFreight === 0 ? 'Buyer Arranged' : formatCurrency(estimatedFreight, currency)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DFCBB2] flex justify-between text-base font-bold text-[#221A1F]">
                <span>Total Wholesale Payable:</span>
                <span className="font-mono text-xl text-[#5E1B42] tabular-nums">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={buildWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 text-xs font-bold uppercase tracking-wider bg-[#25D366] hover:bg-[#1fb858] text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Send PO on WhatsApp
              </a>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="py-3 px-3 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl transition-colors shadow-xs active:scale-98"
              >
                Confirm Wholesale PO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
