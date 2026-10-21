import React, { useState } from 'react';
import { BuyerAccount, ClothingProduct, ImageProcessingPipelineJob } from '../types/index.ts';
import { validateUploadFile } from '../utils/b2bLogic.ts';
import {
  Users,
  UploadCloud,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  ExternalLink,
  Layers,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface AdminPanelProps {
  buyers: BuyerAccount[];
  products: ClothingProduct[];
  pipelineJobs: ImageProcessingPipelineJob[];
  onApproveBuyer: (buyerId: string, assignedTier: BuyerAccount['assignedTier']) => void;
  onRejectBuyer: (buyerId: string) => void;
  onAddProduct: (newProduct: ClothingProduct, job: ImageProcessingPipelineJob) => void;
  onSwitchToCatalog: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  buyers,
  products,
  pipelineJobs,
  onApproveBuyer,
  onRejectBuyer,
  onAddProduct,
  onSwitchToCatalog,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'BUYERS' | 'PIPELINE'>('BUYERS');

  // Upload Pipeline Form State
  const [newTitle, setNewTitle] = useState('Crimson Raw Silk 3-Piece Stitched Formal Suit');
  const [newSku, setNewSku] = useState(`SUT-W-2026-RUBY${Math.floor(Math.random() * 90 + 10)}`);
  const [newCategory, setNewCategory] = useState<'WOMENS_STITCHED' | 'KIDS_STITCHED'>('WOMENS_STITCHED');
  const [newSuitType, setNewSuitType] = useState('3-Piece Stitched Formal (Embroidered Shirt, Cigarette Trouser & Pure Chiffon Dupatta)');
  const [newBaseFabric, setNewBaseFabric] = useState('100% Pure Raw Silk 80 GSM with Zari Threadwork');
  const [newMoq, setNewMoq] = useState(24);
  const [newPriceTier1, setNewPriceTier1] = useState(42.0);
  const [newPriceTier2, setNewPriceTier2] = useState(36.0);
  const [newPriceTier3, setNewPriceTier3] = useState(31.0);

  // Upload Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  const pendingBuyers = buyers.filter((b) => b.status === 'PENDING');
  const approvedBuyers = buyers.filter((b) => b.status === 'APPROVED');

  const handleSimulateAutomatedPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep(1); // Sanitization
    setUploadSuccessNotice(null);

    setTimeout(() => {
      setProcessingStep(2); // WebP Compression & Multiscale renditions
    }, 900);

    setTimeout(() => {
      setProcessingStep(3); // Zip archive creation & S3/R2 CDN upload
    }, 1800);

    setTimeout(() => {
      setProcessingStep(4); // Database insertion & Zero-Touch live sync

      const jobId = `job-${Date.now()}`;
      const originalBytes = 42150000; // ~42MB raw
      const webpBytes = 345000; // 345KB
      const timestamp = Date.now();

      const newJob: ImageProcessingPipelineJob = {
        id: jobId,
        fileName: `${newSku}_Studio_Master.tiff`,
        originalSizeBytes: originalBytes,
        webpSizeBytes: webpBytes,
        compressionRatio: '99.2%',
        status: 'CDN_STORED',
        cdnUrls: {
          original: `https://cdn.sutura-wholesale.com/assets/2026/${newSku}_orig.webp`,
          catalog1200: `https://cdn.sutura-wholesale.com/assets/2026/${newSku}_1200w.webp`,
          matrix600: `https://cdn.sutura-wholesale.com/assets/2026/${newSku}_600w.webp`,
          thumb200: `https://cdn.sutura-wholesale.com/assets/2026/${newSku}_200w.webp`,
        },
        assetZipUrl: `https://cdn.sutura-wholesale.com/downloads/${newSku}_Retailer_Asset_Pack.zip`,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        associatedSku: newSku,
      };

      const productToAdd: ClothingProduct = {
        id: `prod-${timestamp}`,
        sku: newSku,
        title: newTitle,
        collection: 'Atelier Runway Stitched Festive 2026',
        category: newCategory,
        suitType: newSuitType,
        fabric: {
          base: newBaseFabric,
          dupattaOrBottom: 'Pure Organza Border Dupatta with Scalloped Zari Edge',
          stitchDensity: '14 Stitches/Inch (Reinforced Seams)',
          embroidery: 'Multi-head Resham Needlework with Micro-pearl highlights',
        },
        moq: newMoq,
        pricingTiers: [
          { minQty: newMoq, maxQty: newMoq * 2 - 1, pricePerUnit: newPriceTier1 },
          { minQty: newMoq * 2, maxQty: newMoq * 4 - 1, pricePerUnit: newPriceTier2 },
          { minQty: newMoq * 4, pricePerUnit: newPriceTier3 },
        ],
        colorways: [
          { id: 'crimson', name: 'Crimson Scarlet', hexCode: '#990000', inStockPieces: 350 },
          { id: 'champagne', name: 'Champagne Gold', hexCode: '#e5d3b3', inStockPieces: 420 },
          { id: 'sapphire', name: 'Royal Sapphire', hexCode: '#0f204b', inStockPieces: 280 },
        ],
        sizeRange:
          newCategory === 'WOMENS_STITCHED'
            ? ['XS', 'S', 'M', 'L', 'XL', 'XXL']
            : ['2Y-3Y', '4Y-5Y', '6Y-7Y', '8Y-9Y', '10Y-12Y'],
        gramsPerPiece: newCategory === 'WOMENS_STITCHED' ? 660 : 380,
        piecesPerCarton: newCategory === 'WOMENS_STITCHED' ? 24 : 36,
        leadTimeDays: 7,
        heroImage: '/src/assets/images/product_womens_stitched_suit_1792570275122.jpg',
        catalogImage: '/src/assets/images/product_womens_stitched_suit_1792570275122.jpg',
        assetPackZipUrl: `/downloads/${newSku}_Retailer_Asset_Pack.zip`,
        readyToShipUnits: 1050,
        featured: true,
      };

      onAddProduct(productToAdd, newJob);
      setIsProcessing(false);
      setUploadSuccessNotice(`Product ${newSku} zero-touch synchronized to wholesale catalog & S3 CDN!`);
      // Generate next suggested SKU
      setNewSku(`SUT-W-2026-LOT${Math.floor(Math.random() * 90 + 10)}`);
    }, 2800);
  };

  return (
    <div className="space-y-8">
      {/* Admin Panel Header */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                Factory Operations Console
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-xs font-mono text-neutral-600">SUTURA-ADMIN-v2</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              Wholesale Accounts & Automated Catalog Pipeline
            </h2>
            <p className="text-xs text-[#666666]">
              Verify commercial retail buyers, approve resale permits, and process multi-resolution S3/CDN media pipelines with zero-touch catalog sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveAdminTab('BUYERS')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeAdminTab === 'BUYERS'
                  ? 'bg-[#1E1E1E] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Buyer Onboarding ({pendingBuyers.length} Pending)
            </button>
            <button
              type="button"
              onClick={() => setActiveAdminTab('PIPELINE')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeAdminTab === 'PIPELINE'
                  ? 'bg-[#1E1E1E] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Automated Upload Pipeline
            </button>
          </div>
        </div>
      </div>

      {uploadSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{uploadSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={onSwitchToCatalog}
            className="px-3 py-1 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
          >
            Inspect in Live Catalog
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: BUYER ACCOUNT MANAGEMENT & VERIFICATION */}
      {activeAdminTab === 'BUYERS' && (
        <div className="space-y-6">
          {/* Pending Verification Section */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-lg font-semibold text-[#1E1E1E]">
                  Pending Wholesale Buyer Verifications ({pendingBuyers.length})
                </h3>
              </div>
              <span className="text-xs text-neutral-500">
                Action required: Review tax certificates & assign pricing tier
              </span>
            </div>

            {pendingBuyers.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                All buyer applications have been audited and verified.
              </div>
            ) : (
              <div className="divide-y divide-[#EAEAEA]">
                {pendingBuyers.map((buyer) => (
                  <div key={buyer.id} className="p-6 space-y-4 hover:bg-[#FAF9F6] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-serif text-base font-bold text-[#1E1E1E]">
                            {buyer.businessName}
                          </h4>
                          <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                            PENDING REVIEW
                          </span>
                        </div>
                        <div className="text-xs text-[#555555]">
                          Contact: <strong>{buyer.contactName}</strong> · Email: {buyer.email} · Phone: {buyer.phone}
                        </div>
                        <div className="text-xs text-neutral-600">
                          Location: {buyer.country} · Model: {buyer.businessType} · Projected Annual: {buyer.annualVolume}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-neutral-500">Tax ID / Reseller Permit:</div>
                        <div className="font-mono font-bold text-sm text-[#1E1E1E] uppercase">
                          {buyer.taxOrResaleId}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Applied: {buyer.appliedDate}</div>
                      </div>
                    </div>

                    {/* Uploaded Verification Documents */}
                    <div className="bg-[#F6F5EE] p-3 rounded-lg border border-[#E8E5D7] space-y-2">
                      <div className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                        Attached Tax & Entity Credentials:
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {buyer.documents.map((doc, dIdx) => (
                          <div
                            key={dIdx}
                            className="bg-white border border-neutral-300 rounded px-3 py-1.5 text-xs flex items-center gap-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="font-medium text-[#1E1E1E]">{doc.name}</span>
                            <span className="text-neutral-400 font-mono text-[10px]">({doc.size})</span>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                              Malware Safe
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-neutral-500 font-medium">Assign Wholesale Tier:</span>
                        <select
                          defaultValue={buyer.assignedTier}
                          id={`tier-select-${buyer.id}`}
                          className="bg-white border border-neutral-300 rounded px-2.5 py-1 text-xs font-medium text-neutral-800 outline-none"
                        >
                          <option value="TIER_1_STANDARD">Tier 1: Standard MOQ (24 sets)</option>
                          <option value="TIER_2_VOLUME">Tier 2: Volume Buyer (50+ sets)</option>
                          <option value="TIER_3_ENTERPRISE">Tier 3: Enterprise Distributor (100+ sets)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onRejectBuyer(buyer.id)}
                          className="px-3.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Reject Application
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const select = document.getElementById(
                              `tier-select-${buyer.id}`
                            ) as HTMLSelectElement | null;
                            const tier = (select?.value || 'TIER_2_VOLUME') as BuyerAccount['assignedTier'];
                            onApproveBuyer(buyer.id, tier);
                          }}
                          className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Wholesale Account
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Wholesale Accounts List */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-[#F0F0F0] flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#1E1E1E]">
                Active Verified Retailer Accounts ({approvedBuyers.length})
              </h3>
              <span className="text-xs text-neutral-500">Unrestricted matrix ordering enabled</span>
            </div>

            <div className="divide-y divide-[#EAEAEA]">
              {approvedBuyers.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between text-xs hover:bg-neutral-50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#1E1E1E] text-sm">{b.businessName}</div>
                    <div className="text-neutral-500">
                      {b.contactName} · {b.email} · {b.country}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-mono text-neutral-700">{b.taxOrResaleId}</div>
                      <div className="text-emerald-700 font-semibold text-[10px]">APPROVED & ACTIVE</div>
                    </div>
                    <span className="bg-[#FAF7EE] text-[#97731B] border border-[#E6DCBF] font-mono px-2.5 py-1 rounded text-xs font-semibold">
                      {b.assignedTier.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED UPLOAD PIPELINE & ZERO-TOUCH RENDERING */}
      {activeAdminTab === 'PIPELINE' && (
        <div className="space-y-8">
          {/* Automated Upload Form */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-2xs space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1E1E1E]">
                  Bulk Product & High-Res Image Ingestion Pipeline
                </h3>
                <p className="text-xs text-[#666666] mt-1 max-w-2xl leading-relaxed">
                  Upload raw garment studio imagery. The engine automatically executes MIME sanitization, WebP compression, multi-size responsive derivation (4K, 1200w, 600w, 200w), ZIP social asset generation for retailers, and direct S3/Cloudflare R2 push with zero-touch catalog sync.
                </p>
              </div>
              <div className="p-2.5 bg-[#FAF7EE] text-[#D4AF37] rounded-xl border border-[#E7DCBF]">
                <Cpu className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSimulateAutomatedPipeline} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Product Title (Stitched Apparel) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Master SKU Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as 'WOMENS_STITCHED' | 'KIDS_STITCHED')
                    }
                    className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] outline-none"
                  >
                    <option value="WOMENS_STITCHED">Women's Stitched Suits</option>
                    <option value="KIDS_STITCHED">Children's Stitched Festive Sets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Minimum Order Quantity (MOQ Sets)
                  </label>
                  <input
                    type="number"
                    min="12"
                    step="6"
                    value={newMoq}
                    onChange={(e) => setNewMoq(parseInt(e.target.value, 10) || 24)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Tier 1 FOB Mill Price ($/set)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPriceTier1}
                    onChange={(e) => setNewPriceTier1(parseFloat(e.target.value) || 42)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-[#333333] mb-1">
                    Fabric Composition & Stitching Specifications
                  </label>
                  <input
                    type="text"
                    value={newBaseFabric}
                    onChange={(e) => setNewBaseFabric(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAFAFA] border border-neutral-300 rounded focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              {/* Pipeline File Dropzone */}
              <div className="border-2 border-dashed border-[#D4AF37]/50 rounded-xl p-6 text-center bg-[#FDFCF9] space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#FAF5E6] text-[#D4AF37] flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-[#1E1E1E]">
                  Studio RAW Image Batch (Simulated: {newSku}_Studio_Master.tiff)
                </div>
                <div className="text-[11px] text-neutral-500 max-w-md mx-auto">
                  Pillow multi-thread processor converts to lossless WebP, strips EXIF tags, generates responsive breakpoints, and builds retailer ZIP packs.
                </div>
              </div>

              {/* Live Automated Execution Stepper */}
              {isProcessing && (
                <div className="bg-[#FAF9F5] border border-[#E7DFCC] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1E1E1E]">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                      Executing Pipeline Execution Sequence...
                    </span>
                    <span className="font-mono text-neutral-500">Stage {processingStep} of 4</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className={`flex items-center gap-2 ${processingStep >= 1 ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stage 1: MIME Type Verification & Binary ClamAV Malware Sanitization [PASS]</span>
                    </div>
                    <div className={`flex items-center gap-2 ${processingStep >= 2 ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stage 2: Pillow WebP Compression & Multiscale (4K, 1200w, 600w, 200w) Generation [PASS]</span>
                    </div>
                    <div className={`flex items-center gap-2 ${processingStep >= 3 ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stage 3: ZipArchive Generation for Retailers & AWS S3 / Cloudflare R2 Upload [PASS]</span>
                    </div>
                    <div className={`flex items-center gap-2 ${processingStep >= 4 ? 'text-emerald-700 font-medium' : 'text-neutral-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Stage 4: MongoDB Document Push & Zero-Touch Frontend Catalog Sync [PASS]</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center gap-2 shadow-xs ${
                    isProcessing
                      ? 'bg-neutral-300 text-neutral-500 cursor-wait'
                      : 'bg-[#D4AF37] hover:bg-[#ba9324] text-white active:scale-98'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  {isProcessing ? 'Executing Pipeline...' : 'Run Automated Ingestion & Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>

          {/* Historical Pipeline Logs */}
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-[#F0F0F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif text-lg font-semibold text-[#1E1E1E]">
                  Ingestion Pipeline History & CDN Registry
                </h3>
              </div>
              <span className="text-xs text-neutral-500">Real-time edge cache endpoints</span>
            </div>

            <div className="divide-y divide-[#EAEAEA]">
              {pipelineJobs.map((job) => (
                <div key={job.id} className="p-5 space-y-3 hover:bg-neutral-50 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-[#1E1E1E]">{job.fileName}</span>
                      <span className="text-neutral-500 ml-2">SKU: {job.associatedSku}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        COMPRESSION: {job.compressionRatio} REDUCTION
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px]">{job.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#FAF9F6] p-3 rounded-lg border border-neutral-200 text-[11px]">
                    <div>
                      <span className="text-neutral-500">RAW Original:</span>{' '}
                      <span className="font-mono font-medium">
                        {(job.originalSizeBytes / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">WebP 1200w Catalog:</span>{' '}
                      <span className="font-mono font-bold text-emerald-700">
                        {Math.round(job.webpSizeBytes / 1024)} KB
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Retailer ZIP Pack:</span>{' '}
                      <span className="font-mono font-medium">Auto-generated</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-600 font-mono truncate">
                    CDN: {job.cdnUrls.catalog1200}
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
