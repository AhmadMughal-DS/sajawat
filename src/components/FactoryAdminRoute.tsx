import React, { useState } from 'react';
import { BuyerAccount, ClothingProduct, ImageProcessingPipelineJob } from '../types/index.ts';
import { AdminPanel } from './AdminPanel.tsx';
import { ArchitectureModal } from './ArchitectureModal.tsx';
import { KeyRound, ArrowLeft, Factory } from 'lucide-react';

interface FactoryAdminRouteProps {
  isAdminAuthenticated: boolean;
  onAuthenticateAdmin: (pin: string) => boolean;
  onExitAdminRoute: () => void;
  buyers: BuyerAccount[];
  products: ClothingProduct[];
  pipelineJobs: ImageProcessingPipelineJob[];
  onApproveBuyer: (buyerId: string, assignedTier: BuyerAccount['assignedTier']) => void;
  onRejectBuyer: (buyerId: string) => void;
  onAddProduct: (newProduct: ClothingProduct, job: ImageProcessingPipelineJob) => void;
  onSwitchToCatalog: () => void;
}

export const FactoryAdminRoute: React.FC<FactoryAdminRouteProps> = ({
  isAdminAuthenticated,
  onAuthenticateAdmin,
  onExitAdminRoute,
  buyers,
  products,
  pipelineJobs,
  onApproveBuyer,
  onRejectBuyer,
  onAddProduct,
  onSwitchToCatalog,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const success = onAuthenticateAdmin(pinInput);
    if (!success) {
      setErrorMessage('Invalid Security PIN. (Default PIN is 1234)');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2F0B20] text-white flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-[#3D102A] border border-[#732252] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/sajawat-logo.webp"
              alt="Sajawat® Logo"
              className="w-36 h-20 object-contain mx-auto rounded-xl bg-[#F7E8D4] p-1 border border-[#D4AF37]"
            />
            <span className="block text-[11px] font-mono uppercase tracking-widest text-[#F5D77F] pt-2">
              Protected Client S3 + MongoDB Pipeline (/admin)
            </span>
            <h1 className="font-serif text-2xl font-bold text-white">
              Sajawat® Wholesale Admin Console
            </h1>
            <p className="text-xs text-[#E8CEDB]">
              Upload new stitched suit photos to AWS S3 (`sajawat-wholesale-assets`) &amp; MongoDB (`sajawat_wholesale`).
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#F3DCE8] mb-1.5 flex items-center justify-between">
                <span>Admin Security PIN</span>
                <span className="text-[11px] text-[#F5D77F] font-mono">PIN: 1234</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 1234"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#230818] border border-[#732252] rounded-xl text-sm font-mono text-white tracking-widest focus:border-[#F5D77F] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#c59b27] text-[#221A1F] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              Unlock Client S3 + MongoDB Console
            </button>
          </form>

          <div className="pt-2 border-t border-[#732252] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onAuthenticateAdmin('1234')}
              className="text-[#F5D77F] font-semibold hover:underline"
            >
              1-Click Instant Unlock (PIN: 1234)
            </button>
            <button
              type="button"
              onClick={onExitAdminRoute}
              className="text-[#E8CEDB] hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#2F0B20] to-[#471231] text-white border-b border-[#732252] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F5D77F]/20 text-[#F5D77F] rounded-xl border border-[#F5D77F]/30">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white tracking-wide">
                  SAJAWAT® S3 + MONGODB PIPELINE CONSOLE
                </span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-700">
                  LIVE CLOUD SYNC
                </span>
              </div>
              <p className="text-[11px] text-[#E6CEDB]">
                AWS S3 Bucket: sajawat-wholesale-assets · MongoDB Atlas: sajawat_wholesale
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowArchitecture(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              View Pipeline Code
            </button>
            <button
              type="button"
              onClick={onExitAdminRoute}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#F5D77F] hover:bg-[#D4AF37] text-[#221A1F] rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Wholesale Website
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <AdminPanel
          buyers={buyers}
          products={products}
          pipelineJobs={pipelineJobs}
          onApproveBuyer={onApproveBuyer}
          onRejectBuyer={onRejectBuyer}
          onAddProduct={onAddProduct}
          onSwitchToCatalog={onSwitchToCatalog}
        />
      </main>

      <ArchitectureModal isOpen={showArchitecture} onClose={() => setShowArchitecture(false)} />
    </div>
  );
};
