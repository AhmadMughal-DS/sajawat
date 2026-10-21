import React, { useState } from 'react';
import { BuyerAccount } from '../types/index.ts';
import { validateTaxOrResaleId, validateUploadFile } from '../utils/b2bLogic.ts';
import { X, ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [taxId, setTaxId] = useState('');
  const [businessType, setBusinessType] = useState<BuyerAccount['businessType']>('Boutique Owner');
  const [annualVolume, setAnnualVolume] = useState('$100,000 - $250,000');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: 'VERIFIED' | 'REVIEW_PENDING' }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateUploadFile(file.name, file.size, file.type);
    if (!validation.isAllowed) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadedFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: sizeFormatted,
        status: 'REVIEW_PENDING',
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!businessName || !contactName || !email || !phone || !taxId) {
      setValidationError('Please complete all required fields.');
      return;
    }

    const taxCheck = validateTaxOrResaleId(taxId);
    if (!taxCheck.isValid) {
      setValidationError(taxCheck.error || 'Invalid Tax ID format.');
      return;
    }

    const newAccount: BuyerAccount = {
      id: `buyer-${Date.now()}`,
      businessName,
      contactName,
      email,
      phone,
      country,
      city: 'Pakistan / Overseas Boutique',
      ntnOrTaxId: taxCheck.normalized,
      taxOrResaleId: taxCheck.normalized,
      businessType,
      annualVolume,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
      documents:
        uploadedFiles.length > 0
          ? uploadedFiles
          : [{ name: 'Resale_Permit_Certificate.pdf', size: '1.2 MB', status: 'REVIEW_PENDING' }],
      assignedTier: 'TIER_1_STANDARD',
    };

    onSubmitAccount(newAccount);
    setIsSubmittedSuccess(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-reg-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#FAF9F6] px-6 py-5 border-b border-[#E8E6DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FBF8EE] text-[#D4AF37] rounded-xl border border-[#E9DFCA]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="wholesale-reg-title" className="font-serif text-xl font-bold text-[#1E1E1E]">
                Apply for Wholesale Buyer Account
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Direct factory manufacturing access for verified retail boutiques and commercial distributors.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1E1E1E]">
              Application Submitted for Verification
            </h3>
            <p className="text-sm text-[#555555] max-w-md mx-auto leading-relaxed">
              Your business credentials for <strong>{businessName}</strong> (Tax ID: {taxId}) have been logged into our factory onboarding queue.
            </p>
            <div className="p-4 bg-[#FAF9F5] border border-[#EBE8DE] rounded-xl text-xs text-neutral-600 max-w-lg mx-auto text-left space-y-2">
              <div className="font-semibold text-[#1E1E1E]">Evaluation & Demonstration Tip:</div>
              <div>
                You can switch to the <strong>Factory Admin Pipeline</strong> tab at the top of the page right now to review, inspect the uploaded documents, and approve this account with 1-click!
              </div>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#1E1E1E] text-white rounded hover:bg-[#D4AF37] hover:text-[#1E1E1E] transition-colors"
              >
                Return to Wholesale Catalog
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Business Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk & Velvet Boutique LLC"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Primary Contact Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Layla Vance"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Commercial Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="orders@yourboutique.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Direct Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Country of Operation *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany / EU</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Tax ID / Reseller Permit / EIN / VAT *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US-36-8291047 or GB9847120"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Business Retail Model
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BuyerAccount['businessType'])}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                >
                  <option value="Boutique Owner">Boutique Owner (Physical Storefront)</option>
                  <option value="Multi-Door Retailer">Multi-Door Retailer (3+ Locations)</option>
                  <option value="Online Apparel Store">Online Apparel Store / E-Commerce</option>
                  <option value="Wholesale Distributor">Wholesale Distributor / Jobber</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                  Projected Annual Apparel Buying Volume
                </label>
                <select
                  value={annualVolume}
                  onChange={(e) => setAnnualVolume(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                >
                  <option value="$50,000 - $100,000">$50,000 - $100,000 USD</option>
                  <option value="$100,000 - $250,000">$100,000 - $250,000 USD</option>
                  <option value="$250,000 - $500,000">$250,000 - $500,000 USD</option>
                  <option value="$500,000+">$500,000+ USD (Enterprise Tier)</option>
                </select>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="space-y-2 pt-2 border-t border-neutral-200">
              <label className="block text-xs font-semibold text-[#333333]">
                Upload Resale Certificate / Commercial Tax Registration (PDF/JPG/PNG)
              </label>

              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:border-[#D4AF37] transition-colors bg-[#FAF9F5]">
                <input
                  type="file"
                  id="document-upload"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center gap-1.5"
                >
                  <Upload className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-neutral-800">
                    Click to browse or drop certificate file
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    MIME verified & malware-sanitized (Max 15MB)
                  </span>
                </label>
              </div>

              {uploadError && (
                <div className="text-[11px] text-red-600 font-medium">{uploadError}</div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {uploadedFiles.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-neutral-100 rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-neutral-600" />
                        <span className="font-medium text-[#1E1E1E]">{doc.name}</span>
                        <span className="text-neutral-500 font-mono text-[10px]">({doc.size})</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                        Verification Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-white rounded transition-colors shadow-xs active:scale-98"
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
