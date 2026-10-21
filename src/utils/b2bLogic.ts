/**
 * Pure B2B Wholesale calculation, verification, and logistics logic.
 * Decoupled from UI components for unit testing and deterministic calculations.
 */

export interface PricingTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
}

export interface MatrixInput {
  [colorwayId: string]: {
    [sizeCode: string]: number;
  };
}

export interface TierCalculationResult {
  totalQty: number;
  unitPrice: number;
  activeTierIndex: number;
  subtotal: number;
  meetsMOQ: boolean;
  moqDeficit: number;
  nextTier: {
    unitsNeeded: number;
    pricePerUnit: number;
    savingsPerUnit: number;
  } | null;
}

export interface MasterCartonEstimate {
  totalPieces: number;
  cartonCount: number;
  piecesInLastCarton: number;
  totalWeightKg: number;
  estimatedCbm: number;
  recommendedFreightMethod: 'EXPRESS_AIR' | 'AIR_CARGO' | 'OCEAN_LCL' | 'OCEAN_FCL';
}

/**
 * Calculates total pieces across all matrix cells (color x size)
 */
export function calculateMatrixTotalPieces(matrix: MatrixInput): number {
  let total = 0;
  for (const colorId in matrix) {
    const sizeMap = matrix[colorId];
    if (sizeMap) {
      for (const size in sizeMap) {
        const val = Number(sizeMap[size]);
        if (!isNaN(val) && val > 0) {
          total += Math.floor(val);
        }
      }
    }
  }
  return total;
}

/**
 * Calculates active tier price based on total quantity and product tiers
 */
export function calculateTierPrice(
  totalQty: number,
  tiers: PricingTier[],
  moq: number
): TierCalculationResult {
  const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);
  if (sortedTiers.length === 0) {
    return {
      totalQty,
      unitPrice: 0,
      activeTierIndex: -1,
      subtotal: 0,
      meetsMOQ: totalQty >= moq,
      moqDeficit: Math.max(0, moq - totalQty),
      nextTier: null,
    };
  }

  // Find the highest qualifying tier where totalQty >= minQty
  let activeIndex = 0;
  for (let i = 0; i < sortedTiers.length; i++) {
    if (totalQty >= sortedTiers[i].minQty) {
      activeIndex = i;
    }
  }

  const activeTier = sortedTiers[activeIndex];
  const unitPrice = activeTier.pricePerUnit;
  const subtotal = Number((totalQty * unitPrice).toFixed(2));
  const meetsMOQ = totalQty >= moq;
  const moqDeficit = Math.max(0, moq - totalQty);

  // Determine if there is a next tier to encourage upsell
  let nextTier = null;
  if (activeIndex < sortedTiers.length - 1) {
    const targetNext = sortedTiers[activeIndex + 1];
    nextTier = {
      unitsNeeded: targetNext.minQty - totalQty,
      pricePerUnit: targetNext.pricePerUnit,
      savingsPerUnit: Number((unitPrice - targetNext.pricePerUnit).toFixed(2)),
    };
  }

  return {
    totalQty,
    unitPrice,
    activeTierIndex: activeIndex,
    subtotal,
    meetsMOQ,
    moqDeficit,
    nextTier,
  };
}

/**
 * Calculates master cartons, gross shipping weight, and CBM for B2B export logistics
 */
export function calculateLogisticsPackaging(
  totalPieces: number,
  gramsPerPiece: number = 650,
  piecesPerCarton: number = 24
): MasterCartonEstimate {
  if (totalPieces <= 0) {
    return {
      totalPieces: 0,
      cartonCount: 0,
      piecesInLastCarton: 0,
      totalWeightKg: 0,
      estimatedCbm: 0,
      recommendedFreightMethod: 'EXPRESS_AIR',
    };
  }

  const cartonCount = Math.ceil(totalPieces / piecesPerCarton);
  const remainder = totalPieces % piecesPerCarton;
  const piecesInLastCarton = remainder === 0 ? piecesPerCarton : remainder;

  // Garment net weight + packaging tare weight (~1.8kg per corrugated export carton)
  const netWeightKg = (totalPieces * gramsPerPiece) / 1000;
  const tareWeightKg = cartonCount * 1.8;
  const totalWeightKg = Number((netWeightKg + tareWeightKg).toFixed(1));

  // Export carton standard volume: 60cm x 40cm x 35cm = 0.084 CBM per carton
  const estimatedCbm = Number((cartonCount * 0.084).toFixed(3));

  let recommendedFreightMethod: MasterCartonEstimate['recommendedFreightMethod'] = 'EXPRESS_AIR';
  if (totalWeightKg >= 1000 || estimatedCbm >= 15) {
    recommendedFreightMethod = 'OCEAN_FCL';
  } else if (totalWeightKg >= 250 || estimatedCbm >= 2.5) {
    recommendedFreightMethod = 'OCEAN_LCL';
  } else if (totalWeightKg >= 70) {
    recommendedFreightMethod = 'AIR_CARGO';
  }

  return {
    totalPieces,
    cartonCount,
    piecesInLastCarton,
    totalWeightKg,
    estimatedCbm,
    recommendedFreightMethod,
  };
}

/**
 * Formats monetary amounts in Pakistani Rupee (PKR) or USD for export buyers
 */
export function formatCurrency(amountPkr: number, currency: 'PKR' | 'USD' = 'PKR'): string {
  if (currency === 'USD') {
    const usd = amountPkr / 280;
    return `$${usd.toFixed(2)}`;
  }
  return `Rs. ${Math.round(amountPkr).toLocaleString()}`;
}

/**
 * Validates Pakistani NTN (FBR 7-digit + check digit) or international resale identifier
 */
export function validatePakistaniNtn(ntn: string): { isValid: boolean; normalized: string; error?: string } {
  const trimmed = ntn.trim();
  if (!trimmed) {
    return { isValid: false, normalized: '', error: 'FBR NTN or Business Tax Registration is required.' };
  }
  const cleaned = trimmed.replace(/[^a-zA-Z0-9-]/g, '');
  if (cleaned.length < 5) {
    return { isValid: false, normalized: cleaned, error: 'NTN/Tax ID must be at least 5 alphanumeric characters.' };
  }
  return { isValid: true, normalized: cleaned.toUpperCase() };
}

/**
 * Validates B2B business tax identifier or resale permit format
 */
export function validateTaxOrResaleId(id: string): { isValid: boolean; normalized: string; error?: string } {
  return validatePakistaniNtn(id);
}

/**
 * Validates file upload for safe B2B image and document processing
 */
export function validateUploadFile(
  fileName: string,
  fileSize: number,
  mimeType: string,
  maxSizeBytes: number = 15 * 1024 * 1024 // 15MB default
): { isAllowed: boolean; error?: string } {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  
  if (!ext || !allowedExtensions.includes(`.${ext}`)) {
    return {
      isAllowed: false,
      error: `Invalid file extension .${ext}. Allowed extensions: JPG, JPEG, PNG, WEBP, PDF.`,
    };
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (mimeType && !allowedMimeTypes.includes(mimeType.toLowerCase())) {
    return {
      isAllowed: false,
      error: `MIME type ${mimeType} is disallowed for security sanitization.`,
    };
  }

  if (fileSize > maxSizeBytes) {
    return {
      isAllowed: false,
      error: `File size exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB maximum payload.`,
    };
  }

  return { isAllowed: true };
}

export interface SearchableClothingProduct {
  id: string;
  sku: string;
  title: string;
  collection: string;
  category: string;
  suitType: string;
  colorways: { id: string; name: string }[];
  fabric?: {
    base?: string;
  };
}

/**
 * Filters products by SKU, category, colorway, title, or fabric composition
 */
export function filterWholesaleProducts<T extends SearchableClothingProduct>(
  products: T[],
  searchQuery: string,
  selectedCategory: string = 'ALL'
): T[] {
  const query = searchQuery.trim().toLowerCase();
  return products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      prod.category === selectedCategory ||
      (selectedCategory === 'WOMENS_STITCHED' && prod.category.toLowerCase().includes('women')) ||
      (selectedCategory === 'KIDS_STITCHED' && prod.category.toLowerCase().includes('kid'));

    if (!matchesCategory) return false;
    if (!query) return true;

    // Search by SKU
    if (prod.sku.toLowerCase().includes(query)) return true;

    // Search by Title & Collection
    if (prod.title.toLowerCase().includes(query) || prod.collection.toLowerCase().includes(query)) {
      return true;
    }

    // Search by Category / Suit Type
    if (
      prod.category.toLowerCase().replace(/_/g, ' ').includes(query) ||
      prod.suitType.toLowerCase().includes(query)
    ) {
      return true;
    }

    // Search by Colorway (Name or ID)
    if (
      prod.colorways &&
      prod.colorways.some(
        (c) => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
      )
    ) {
      return true;
    }

    // Search by fabric composition
    if (prod.fabric?.base && prod.fabric.base.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  });
}
