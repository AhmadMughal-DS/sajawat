import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMatrixTotalPieces,
  calculateTierPrice,
  calculateLogisticsPackaging,
  validateTaxOrResaleId,
  validatePakistaniNtn,
  validateUploadFile,
  filterWholesaleProducts,
  formatCurrency,
  PricingTier,
} from './b2bLogic.ts';

test('calculateMatrixTotalPieces correctly aggregates non-zero quantities', () => {
  const matrix = {
    emerald: { S: 10, M: 20, L: 10, XL: 0 },
    ruby: { S: 5, M: 5, L: 10, XL: 5 },
  };
  const total = calculateMatrixTotalPieces(matrix);
  assert.equal(total, 65);
});

test('calculateTierPrice applies dynamic wholesale tiers and identifies next tier discount', () => {
  const tiers: PricingTier[] = [
    { minQty: 10, maxQty: 24, pricePerUnit: 42.0 },
    { minQty: 25, maxQty: 49, pricePerUnit: 36.0 },
    { minQty: 50, pricePerUnit: 31.0 },
  ];
  const moq = 20;

  // Case 1: Under MOQ (15 pieces)
  const result1 = calculateTierPrice(15, tiers, moq);
  assert.equal(result1.totalQty, 15);
  assert.equal(result1.unitPrice, 42.0);
  assert.equal(result1.subtotal, 630.0);
  assert.equal(result1.meetsMOQ, false);
  assert.equal(result1.moqDeficit, 5);
  assert.equal(result1.nextTier?.unitsNeeded, 10); // 25 - 15 = 10
  assert.equal(result1.nextTier?.savingsPerUnit, 6.0); // 42 - 36

  // Case 2: Above MOQ, qualifies for tier 2 (30 pieces)
  const result2 = calculateTierPrice(30, tiers, moq);
  assert.equal(result2.unitPrice, 36.0);
  assert.equal(result2.subtotal, 1080.0);
  assert.equal(result2.meetsMOQ, true);
  assert.equal(result2.moqDeficit, 0);
  assert.equal(result2.nextTier?.unitsNeeded, 20); // 50 - 30 = 20

  // Case 3: Volume Tier 3 (100 pieces)
  const result3 = calculateTierPrice(100, tiers, moq);
  assert.equal(result3.unitPrice, 31.0);
  assert.equal(result3.subtotal, 3100.0);
  assert.equal(result3.nextTier, null); // Highest tier reached
});

test('calculateLogisticsPackaging calculates cartons, gross weight and freight classification', () => {
  // 96 pieces, 650g each, 24 pcs per carton
  const estimate = calculateLogisticsPackaging(96, 650, 24);
  assert.equal(estimate.cartonCount, 4);
  assert.equal(estimate.piecesInLastCarton, 24);
  // Net weight: 96 * 0.65 = 62.4kg. Tare: 4 * 1.8 = 7.2kg. Total = 69.6kg
  assert.equal(estimate.totalWeightKg, 69.6);
  assert.equal(estimate.estimatedCbm, 0.336);
  assert.equal(estimate.recommendedFreightMethod, 'EXPRESS_AIR');

  // Heavy bulk order: 600 pieces
  const bulkEstimate = calculateLogisticsPackaging(600, 650, 24);
  assert.equal(bulkEstimate.cartonCount, 25);
  assert.equal(bulkEstimate.recommendedFreightMethod, 'OCEAN_LCL');
});

test('formatCurrency converts to PKR and USD accurately', () => {
  assert.equal(formatCurrency(8500, 'PKR'), 'Rs. 8,500');
  assert.equal(formatCurrency(28000, 'USD'), '$100.00');
});

test('validatePakistaniNtn validates FBR NTN format and normalization', () => {
  const valid = validatePakistaniNtn('4892011-4');
  assert.equal(valid.isValid, true);
  assert.equal(valid.normalized, '4892011-4');

  const tooShort = validatePakistaniNtn('12');
  assert.equal(tooShort.isValid, false);
});

test('validateTaxOrResaleId validates format and length', () => {
  const valid = validateTaxOrResaleId('12-3456789');
  assert.equal(valid.isValid, true);
  assert.equal(valid.normalized, '12-3456789');

  const tooShort = validateTaxOrResaleId('123');
  assert.equal(tooShort.isValid, false);
});

test('validateUploadFile guards against dangerous extensions and MIME types', () => {
  const allowed = validateUploadFile('sample_catalog.webp', 1024 * 1024, 'image/webp');
  assert.equal(allowed.isAllowed, true);

  const scriptAttack = validateUploadFile('malicious_payload.exe', 500, 'application/octet-stream');
  assert.equal(scriptAttack.isAllowed, false);
});

test('filterWholesaleProducts accurately filters by SKU, category, and colorway', () => {
  const dummyProducts = [
    {
      id: '1',
      sku: 'SUT-W-2026-EMB01',
      title: 'Emerald Zari Silk 3-Piece Stitched Formal Suit',
      collection: 'Royal Heritage',
      category: 'WOMENS_STITCHED',
      suitType: '3-Piece Stitched Formal',
      colorways: [
        { id: 'emerald', name: 'Imperial Emerald' },
        { id: 'ruby', name: 'Crimson Ruby' },
      ],
      fabric: { base: 'Pure Raw Silk' },
    },
    {
      id: '2',
      sku: 'SUT-K-2026-FEST02',
      title: 'Pastel Meadow Children Festive Kurta & Gharara Sets',
      collection: 'Junior Couture',
      category: 'KIDS_STITCHED',
      suitType: 'Coordinated Girls Gharara',
      colorways: [
        { id: 'blush_pink', name: 'Blush Rose' },
        { id: 'lavender', name: 'Lilac Dream' },
      ],
      fabric: { base: 'Combed Cotton Voile' },
    },
  ];

  // Search by SKU
  const bySku = filterWholesaleProducts(dummyProducts, 'EMB01');
  assert.equal(bySku.length, 1);
  assert.equal(bySku[0].id, '1');

  // Search by Colorway
  const byColorway = filterWholesaleProducts(dummyProducts, 'Lilac Dream');
  assert.equal(byColorway.length, 1);
  assert.equal(byColorway[0].id, '2');

  // Search by Category filter
  const byCategory = filterWholesaleProducts(dummyProducts, '', 'KIDS_STITCHED');
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].sku, 'SUT-K-2026-FEST02');

  // Search by Category keyword
  const byKeyword = filterWholesaleProducts(dummyProducts, 'women');
  assert.equal(byKeyword.length, 1);
  assert.equal(byKeyword[0].id, '1');

  // Unmatched query
  const unmatched = filterWholesaleProducts(dummyProducts, 'Denim Leather');
  assert.equal(unmatched.length, 0);
});
