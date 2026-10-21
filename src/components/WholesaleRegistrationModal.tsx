import React, { useState } from 'react';
import { BuyerAccount } from '../types/index.ts';
import { validateTaxOrResaleId } from '../utils/b2bLogic.ts';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface WholesaleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAccount: (account: BuyerAccount) => void;
}

export const WholesaleRegistrationModal: React.FC<WholesaleRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitAccount,
}) => {
  if (!isOpen) return null;

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+92 3');
  const [city, setCity] = useState('Lahore (Azam Cloth Market / Gulberg)');
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState<BuyerAccount['businessType']>('Boutique Owner');
  const [annualVolume, setAnnualVolume] = useState('Rs. 10M - 25M PKR');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!businessName || !contactName || !phone || !taxId) {
      setValidationError('Please complete all required shop and contact fields.');
      return;
    }

    const taxCheck = validateTaxOrResaleId(taxId);
    if (!taxCheck.isValid) {
      setValidationError(taxCheck.error || 'Enter a valid FBR NTN, CNIC, or Shop Registration No.');
      return;
    }

    const newAccount: BuyerAccount = {
      id: `buyer-${Date.now()}`,
      businessName,
      contactName,
      email: email || 'wholesale@boutique.pk',
      phone,
      country: 'Pakistan',
      city,
      ntnOrTaxId: taxCheck.normalized,
      taxOrResaleId: taxCheck.normalized,
      businessType,
      annualVolume,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
      documents: [{ name: 'Shop_Visiting_Card_or_NTN.pdf', size: '850 KB', status: 'REVIEW_PENDING' }],
      assignedTier: 'TIER_2_VOLUME',
    };

    onSubmitAccount(newAccount);
    setIsSubmittedSuccess(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-reg-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#E5D5C0] overflow-hidden">
        <div className="bg-gradient-to-r from-[#2F0B20] to-[#471231] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F5D77F]/20 text-[#F5D77F] rounded-xl border border-[#F5D77F]/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="wholesale-reg-title" className="font-serif text-xl font-bold text-white">
                Register Boutique / Wholesale Shop
              </h2>
              <p className="text-xs text-[#EAD2DF] mt-0.5">
                Get factory-direct Sajawat® rate lists &amp; priority Bilti dispatch across Pakistan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#EAD2DF] hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#221A1F]">
              Wholesale Account Registered in MongoDB!
            </h3>
            <p className="text-xs text-[#5E4A54] max-w-md mx-auto leading-relaxed">
              Your boutique <strong>{businessName}</strong> ({city}) has been saved to our MongoDB Atlas database (`sajawat_wholesale.buyers`).
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] text-white rounded-xl hover:bg-[#732252]"
            >
              Start Wholesale Ordering
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#221A1F] mb-1">
                  Shop / Boutique Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Haram Garments & Boutique"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF6F0] border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#221A1F] mb-1">
                  Owner / Buyer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Bilal"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF6F0] border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#221A1F] mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF6F0] border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#221A1F] mb-1">
                  City &amp; Wholesale Market *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF6F0] border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none"
                >
                  <option value="Lahore (Azam Cloth Market / Gulberg)">Lahore (Azam Cloth Market / Gulberg)</option>
                  <option value="Karachi (Tariq Road / Bolton / Jama Cloth)">Karachi (Tariq Road / Bolton / Jama Cloth)</option>
                  <option value="Faisalabad (Karkhana Bazar / D-Ground)">Faisalabad (Karkhana Bazar / D-Ground)</option>
                  <option value="Rawalpindi / Islamabad (Raja Bazar / Rabi Center)">Rawalpindi / Islamabad (Raja Bazar / Rabi Center)</option>
                  <option value="Multan / Gujranwala / Sialkot">Multan / Gujranwala / Sialkot</option>
                  <option value="Peshawar / Quetta / Hyderabad">Peshawar / Quetta / Hyderabad</option>
                  <option value="Overseas Pakistani Boutique (UK / USA / UAE)">Overseas Pakistani Boutique (UK / USA / UAE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#221A1F] mb-1">
                  FBR NTN / CNIC / Shop Reg No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4892011-4 or 35202-1234567-1"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#FAF6F0] border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#221A1F] mb-1">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BuyerAccount['businessType'])}
                  className="w-full text-xs px-3 py-2 bg-[#FAF6F0] border border-[#D8C7B2] rounded-lg focus:border-[#5E1B42] outline-none"
                >
                  <option value="Boutique Owner">Boutique / Retail Shop Owner</option>
                  <option value="Wholesale Distributor / Jobber">Market Wholesaler / Arhti</option>
                  <option value="Online Apparel Store">Online Store (Shopify / Instagram / Daraz)</option>
                  <option value="Multi-Door Retailer">Multi-Branch Garment Store</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE6D8]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#6B5360]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#5E1B42] hover:bg-[#732252] text-white rounded-xl transition-colors"
              >
                Submit Wholesale Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
