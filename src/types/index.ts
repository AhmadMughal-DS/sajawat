export type UserRole = 'GUEST' | 'RETAILER' | 'ADMIN';

export type BuyerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MatrixInput {
  [colorwayId: string]: {
    [sizeCode: string]: number;
  };
}

export interface BuyerAccount {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string; // e.g. Karachi, Lahore, Faisalabad, Rawalpindi, London, Chicago
  ntnOrTaxId: string; // FBR NTN (7 digits + 1 check digit) or Resale ID
  taxOrResaleId?: string; // alias for backwards compatibility
  strnNumber?: string; // Sales Tax Registration Number
  chamberMember?: string; // e.g. KCCI, LCCI, FCCI
  businessType: 'Boutique Owner' | 'Multi-Door Retailer' | 'Online Apparel Store' | 'Wholesale Distributor / Jobber' | 'Wholesale Distributor';
  annualVolume: string;
  status: BuyerStatus;
  appliedDate: string;
  approvedDate?: string;
  documents: { name: string; size: string; status: 'VERIFIED' | 'REVIEW_PENDING' }[];
  creditTerms?: string;
  assignedTier: 'TIER_1_STANDARD' | 'TIER_2_VOLUME' | 'TIER_3_ENTERPRISE';
}


export interface Colorway {
  id: string;
  name: string;
  hexCode: string;
  inStockPieces: number;
}

export interface ClothingProduct {
  id: string;
  sku: string;
  title: string;
  collection: string;
  category: 'WOMENS_STITCHED' | 'KIDS_STITCHED';
  suitType: string; // e.g. "3-Piece Stitched Luxury Lawn Suit", "2-Piece Embroidered Pret Set", "Kids 3-Piece Festive Gharara"
  fabric: {
    base: string; // e.g. "80/80 Combed Mercerized Lawn"
    dupattaOrBottom: string; // e.g. "Organza Zari Jacquard with Scalloped Borders"
    stitchDensity: string; // e.g. "12-14 Stitches Per Inch (Lockstitch)"
    embroidery: string; // e.g. "Multi-head Zari & Silk Threadwork with Schiffli Cutwork"
  };
  moq: number; // Minimum Order Quantity in total sets
  pricingTiers: {
    minQty: number;
    maxQty?: number;
    pricePerUnit: number;
  }[];
  colorways: Colorway[];
  sizeRange: string[]; // e.g. ['XS', 'S', 'M', 'L', 'XL'] or ['2Y-3Y', '4Y-5Y', '6Y-7Y', '8Y-9Y', '10Y-12Y']
  gramsPerPiece: number;
  piecesPerCarton: number;
  leadTimeDays: number;
  heroImage: string;
  catalogImage: string;
  assetPackZipUrl: string;
  readyToShipUnits: number;
  featured: boolean;
}

export interface BulkCartItem {
  product: ClothingProduct;
  matrix: {
    [colorwayId: string]: {
      [sizeCode: string]: number;
    };
  };
  totalPieces: number;
  unitPrice: number;
  subtotal: number;
  cartonCount: number;
  grossWeightKg: number;
}

export interface WholesaleOrder {
  id: string;
  orderNumber: string;
  date: string;
  buyerName: string;
  businessName: string;
  items: {
    productTitle: string;
    sku: string;
    totalPieces: number;
    unitPrice: number;
    subtotal: number;
  }[];
  totalPieces: number;
  subtotal: number;
  estimatedFreight: number;
  incoterm: 'FOB Karachi' | 'CIF New York' | 'CIF London' | 'DDP Express Air';
  totalAmount: number;
  paymentStatus: 'PAID' | 'PROFORMA_ISSUED' | 'LETTER_OF_CREDIT';
  fulfillmentStatus: 'QUEUED' | 'IN_PRODUCTION' | 'QUALITY_INSPECTED' | 'IN_TRANSIT' | 'CUSTOMS_CLEARED' | 'DELIVERED';
  trackingNumber: string;
  carrier: string;
  cargoType: 'Air Cargo Priority' | 'Ocean LCL Freight' | 'DHL Global Forwarding';
  estimatedDelivery: string;
  milestones: {
    step: string;
    location: string;
    date: string;
    completed: boolean;
  }[];
}

export interface ImageProcessingPipelineJob {
  id: string;
  fileName: string;
  originalSizeBytes: number;
  webpSizeBytes: number;
  compressionRatio: string;
  status: 'SANITIZING' | 'COMPRESSING' | 'GENERATING_ASSETS' | 'CDN_STORED';
  cdnUrls: {
    original: string;
    catalog1200: string;
    matrix600: string;
    thumb200: string;
  };
  assetZipUrl: string;
  uploadedAt: string;
  associatedSku: string;
}
