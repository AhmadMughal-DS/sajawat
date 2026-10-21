import { ClothingProduct, BuyerAccount, WholesaleOrder, ImageProcessingPipelineJob } from '../types/index.ts';
import s3CatalogData from './s3CatalogData.json';

export const S3_BUCKET_INFO = {
  bucketName: s3CatalogData.s3Bucket || 'sajawat-wholesale-assets',
  awsRegion: s3CatalogData.awsRegion || 'us-east-1',
  mongoDatabase: s3CatalogData.mongoDatabase || 'sajawat_wholesale',
  brandAssets: s3CatalogData.brandAssets || {
    logoJpeg: 'https://sajawat-wholesale-assets.s3.us-east-1.amazonaws.com/brand/sajawat-logo.jpeg',
    logoWebp: 'https://sajawat-wholesale-assets.s3.us-east-1.amazonaws.com/brand/sajawat-logo.webp',
    ogBanner: 'https://sajawat-wholesale-assets.s3.us-east-1.amazonaws.com/brand/og-banner.jpg',
  },
};

export const INITIAL_PRODUCTS: ClothingProduct[] = (s3CatalogData.products as unknown as ClothingProduct[]) || [];

export const INITIAL_BUYERS: BuyerAccount[] = (s3CatalogData.buyers as unknown as BuyerAccount[]) || [];

export const INITIAL_ORDERS: WholesaleOrder[] = (s3CatalogData.orders as unknown as WholesaleOrder[]) || [];

export const INITIAL_PIPELINE_JOBS: ImageProcessingPipelineJob[] =
  (s3CatalogData.pipelineJobs as unknown as ImageProcessingPipelineJob[]) || [];

export const FACTORY_METRICS = {
  monthlyCapacity: '150,000 Finished Stitched Suits / Month',
  stitchQualityStandard: '14 SPI Boutique Lockstitch · AQL 1.5 Inspected',
  averageLeadTime: '24–72 Hours Domestic Bilti Dispatch across Pakistan',
  globalDestinations: 'All Pakistan (Karachi, Lahore, Faisalabad, RWP, Multan) + UK/USA/UAE Export',
  minOrderQuantityPolicy: '12 Sets (Women) / 18 Sets (Kids) Factory Wholesale Bundles',
  embroideryMachines: '42 Multi-head Tajima Zari, Tilla, Schiffli & Mirror-Work Units',
};
