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
  city: string;
  ntnOrTaxId: string;
  taxOrResaleId?: string;
  strnNumber?: string;
  chamberMember?: string;
  businessType:
    | 'Boutique Owner'
    | 'Multi-Door Retailer'
    | 'Online Apparel Store'
    | 'Wholesale Distributor / Jobber'
    | 'Wholesale Distributor';
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
  slug?: string;
  title: string;
  collection: string;
  category: 'WOMENS_STITCHED' | 'KIDS_STITCHED';
  subCategory?: string;
  suitType: string;
  fabric: {
    base: string;
    dupattaOrBottom: string;
    stitchDensity: string;
    embroidery: string;
  };
  moq: number;
  retailBenchmarkPkr?: number;
  pricingTiers: {
    minQty: number;
    maxQty?: number;
    pricePerUnit: number;
  }[];
  colorways: Colorway[];
  colorSwatchesClickable?: boolean;
  sizeRange: string[];
  gramsPerPiece: number;
  piecesPerCarton: number;
  leadTimeDays: number;
  heroImage: string;
  catalogImage: string;
  thumbnailImage?: string;
  s3Bucket?: string;
  s3Key?: string;
  sourceImageOrigin?: string;
  pipelineMode?: string;
  assetPackZipUrl: string;
  readyToShipUnits: number;
  featured: boolean;
  bestSeller?: boolean;
  cityDemand?: string;
  updatedAt?: string;
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
  city?: string;
  phone?: string;
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
  incoterm:
    | 'TCS Overland Bilti'
    | 'Daewoo FastEx Cargo'
    | 'Leopard Overland Bilti'
    | 'Truck Adda Cargo'
    | 'FOB Karachi'
    | 'CIF New York'
    | 'CIF London'
    | 'DDP Express Air';
  totalAmount: number;
  paymentStatus: 'PAID' | 'PROFORMA_ISSUED' | 'LETTER_OF_CREDIT' | '50%_ADVANCE_BILTI';
  fulfillmentStatus:
    | 'QUEUED'
    | 'IN_PRODUCTION'
    | 'QUALITY_INSPECTED'
    | 'IN_TRANSIT'
    | 'CUSTOMS_CLEARED'
    | 'DELIVERED';
  trackingNumber: string;
  carrier: string;
  cargoType: 'Domestic Overland Bilti' | 'Air Cargo Priority' | 'Ocean LCL Freight' | 'DHL Global Forwarding';
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
  s3Bucket?: string;
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
