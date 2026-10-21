import React, { useState } from 'react';
import { BuyerAccount, ClothingProduct, ImageProcessingPipelineJob } from '../types/index.ts';
import { AdminPanel } from './AdminPanel.tsx';
import { ArchitectureModal } from './ArchitectureModal.tsx';
import { ShieldCheck, Lock, KeyRound, ArrowLeft, Factory, Building2, CheckCircle2 } from 'lucide-react';

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
      setErrorMessage('Invalid Factory Security PIN. (Default demo PIN is 1234)');
    }
  };

  const handleQuickDemoUnlock = () => {
    onAuthenticateAdmin('1234');
  };

  // If not authenticated, render the secure factory admin lock screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#18181A] text-white flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-[#202024] border border-neutral-700 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#D4AF37]/15 text-[#D4AF37] rounded-2xl border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
              <Factory className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37]">
              Restricted Factory Route (/admin)
            </span>
            <h1 className="font-serif text-2xl font-bold text-white">
              Sutura Factory Operations Console
            </h1>
            <p className="text-xs text-neutral-400">
              Karachi Korangi Export Industrial Unit #2. Authorized management & dispatch access only.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                <span>Factory Security PIN / Passcode</span>
                <span className="text-[11px] text-neutral-500 font-normal">Demo PIN: 1234</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141416] border border-neutral-600 rounded-lg text-sm font-mono text-white tracking-widest focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#ba9324] text-[#1E1E1E] font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm active:scale-98"
            >
              Authenticate & Access Admin Console
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleQuickDemoUnlock}
              className="text-[#D4AF37] hover:underline"
            >
              1-Click Demo Unlock (PIN: 1234)
            </button>
            <button
              type="button"
              onClick={onExitAdminRoute}
              className="text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Once authenticated, render the full admin console with top control strip
  return (
    <div className="min-h-screen bg-[#F6F5F2] flex flex-col">
      {/* Factory Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-[#1E1E22] text-white border-b border-neutral-700 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg border border-[#D4AF37]/30">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white tracking-wide">
                  SUTURA FACTORY MANAGEMENT CONSOLE
                </span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800">
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Karachi Korangi Industrial Area & SITE Plant #2 · FBR NTN: 4892011-4 · Active ATL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowArchitecture(true)}
              className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              Inspect FastAPI & DevOps Source
            </button>
            <button
              type="button"
              onClick={onExitAdminRoute}
              className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#ba9324] text-[#1E1E1E] rounded transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit to Wholesale Storefront
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
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
