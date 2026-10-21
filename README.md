# Sajawat® — Stitched Women & Kids Wholesale Pakistan

Pakistan’s #1 Factory-Direct B2B Wholesale Platform for **Women’s Stitched Suits** (3-Piece Chiffon, 9000 Shahi Velvet, Winter Dhanak Shawl, Organza & Mirror Pret) and **Kids’ Festive Stitched Garments** (Raw Silk Sharara 3-Pc, Velvet 2-Pc, Cutwork Chiffon & Koti Sets).

---

## ✨ Key Features

- **Minimalist Editorial Catalog + Dedicated Product Detail Page**:
  - Clean Alabaster Pearl (`#FAF9F6`) & Pure White (`#FFFFFF`) editorial design.
  - Clicking any suit in the catalog opens its dedicated **Product Detail Page** (`/?sku=SJW-...`) with interactive **Colorway Selection**, **Size Curve Quantity Builder**, **3 Volume Wholesale Pricing Tiers**, and **Complete Fabric & Bilti Specifications**.
- **AWS S3 + MongoDB Atlas Cloud Pipeline**:
  - **AWS S3 Bucket**: `s3://sajawat-wholesale-assets` (`us-east-1`) serving multi-scale WebP studio photos.
  - **MongoDB Atlas Database**: `sajawat_wholesale` (`products`, `pipeline_jobs`, `buyers`, `orders`).
  - **Client Auto Upload Pipeline**: Upload new suit photos directly via `/admin` (`PIN: 1234`) or run `npm run sync:s3`.
- **2026 Technical & Pakistan Wholesale SEO**:
  - Complete `Organization`, `WholesaleStore`, `WebSite`, `BreadcrumbList`, `FAQPage`, and dynamic `ItemList` / `Product` Schema.org JSON-LD in `PKR`.
  - Dynamic `/sitemap.xml` (with Google Image Sitemap `<image:image>` tags) and `/robots.txt`.

---

## 🚀 Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your AWS S3 & MongoDB Atlas credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start the full-stack Express + Vite + S3 + MongoDB server:**
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** (Admin Pipeline: **http://localhost:3000/admin**).

---

## ⚙️ GitHub Actions CI/CD Pipeline

This repository includes two automated GitHub Actions workflows in `.github/workflows/`:

1. **[`ci-cd.yml`](.github/workflows/ci-cd.yml)** — Runs on every `push` and `pull_request` to `main`:
   - Installs dependencies (`npm ci`)
   - Runs strict TypeScript checking (`npm run lint`)
   - Executes all B2B wholesale & S3 catalog unit tests (`npm test`)
   - Builds the production bundle (`npm run build`) and verifies SEO files (`robots.txt`, `sitemap.xml`)
   - Uploads the production artifact and syncs to AWS S3 / triggers cloud deployment hooks on `main`.

2. **[`client-s3-pipeline.yml`](.github/workflows/client-s3-pipeline.yml)** — Scheduled weekly & manual one-click workflow:
   - Processes studio photos into WebP, uploads them to `s3://sajawat-wholesale-assets`, and syncs product documents into MongoDB Atlas (`sajawat_wholesale`).

### Required GitHub Repository Secrets (`Settings → Secrets and variables → Actions`)

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key with S3 write permissions |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Key |
| `MONGODB_URI` | MongoDB Atlas connection string (`mongodb+srv://...`) |
| `DEPLOY_WEBHOOK_URL` | *(Optional)* Render / Railway / VPS deploy webhook URL |
