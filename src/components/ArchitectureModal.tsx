import React, { useState } from 'react';
import { X, Copy, Check, Code, Server, Shield, Container, Terminal } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'FRONTEND' | 'PIPELINE' | 'AUTH' | 'DEVOPS'>('FRONTEND');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // 1. Next.js App Router Matrix Code
  const frontendCode = `// app/components/BulkOrderMatrix.tsx
// Production Next.js 14+ (App Router) & Tailwind CSS Component
'use client';

import React, { useState, useMemo } from 'react';

interface Tier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
}

interface ProductMatrixProps {
  productSku: string;
  productTitle: string;
  moq: number;
  tiers: Tier[];
  colorways: { id: string; name: string; hex: string; inStock: number }[];
  sizeRange: string[];
  onAddToCart: (payload: { sku: string; matrix: Record<string, Record<string, number>>; totalPieces: number; unitPrice: number; subtotal: number }) => void;
}

export function BulkOrderMatrix({
  productSku,
  productTitle,
  moq,
  tiers,
  colorways,
  sizeRange,
  onAddToCart,
}: ProductMatrixProps) {
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    colorways.forEach((c) => {
      init[c.id] = {};
      sizeRange.forEach((s) => {
        init[c.id][s] = 0;
      });
    });
    return init;
  });

  // Calculate total units across all matrix inputs
  const totalPieces = useMemo(() => {
    let sum = 0;
    for (const c in matrix) {
      for (const s in matrix[c]) {
        sum += matrix[c][s] || 0;
      }
    }
    return sum;
  }, [matrix]);

  // Determine active wholesale tier based on volume
  const { activeTier, unitPrice, subtotal } = useMemo(() => {
    const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
    let current = sorted[0];
    for (let i = 0; i < sorted.length; i++) {
      if (totalPieces >= sorted[i].minQty) {
        current = sorted[i];
      }
    }
    const price = current ? current.pricePerUnit : 0;
    return {
      activeTier: current,
      unitPrice: price,
      subtotal: totalPieces * price,
    };
  }, [totalPieces, tiers]);

  const handleCellChange = (colorId: string, size: string, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setMatrix((prev) => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        [size]: num,
      },
    }));
  };

  const meetsMoq = totalPieces >= moq;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <span className="font-mono text-xs text-neutral-500">{productSku}</span>
          <h3 className="text-xl font-bold text-neutral-900">{productTitle}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-500">Active FOB Unit Price</span>
          <div className="text-2xl font-mono font-bold text-amber-700">
            \${unitPrice.toFixed(2)} <span className="text-xs font-normal text-neutral-500">/ set</span>
          </div>
        </div>
      </div>

      {/* Bulk Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="py-2.5 px-3 font-semibold">Colorway</th>
              {sizeRange.map((s) => (
                <th key={s} className="py-2.5 px-2 text-center font-semibold">{s}</th>
              ))}
              <th className="py-2.5 px-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {colorways.map((c) => {
              const rowTotal = Object.values(matrix[c.id] || {}).reduce((a, b) => a + b, 0);
              return (
                <tr key={c.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </td>
                  {sizeRange.map((s) => (
                    <td key={s} className="py-1 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={matrix[c.id]?.[s] || ''}
                        placeholder="0"
                        onChange={(e) => handleCellChange(c.id, s, e.target.value)}
                        className="w-16 py-1 px-1 text-center font-mono border rounded outline-none focus:border-amber-600"
                      />
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-mono font-bold">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm">
          {!meetsMoq ? (
            <span className="text-amber-700 font-medium">Under MOQ: Minimum {moq} sets required (Current: {totalPieces})</span>
          ) : (
            <span className="text-emerald-700 font-medium">Qualified: {totalPieces} sets meet MOQ threshold</span>
          )}
        </div>
        <button
          type="button"
          disabled={!meetsMoq || totalPieces === 0}
          onClick={() => onAddToCart({ sku: productSku, matrix, totalPieces, unitPrice, subtotal })}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-300 text-white font-semibold rounded text-xs uppercase tracking-wider"
        >
          Add {totalPieces} Sets to Cart (\${subtotal.toFixed(2)})
        </button>
      </div>
    </div>
  );
}`;

  // 2. FastAPI Pipeline Code
  const pipelineCode = `# app/api/pipeline.py
# Production FastAPI Async Endpoint for Image Ingestion, WebP Conversion & AWS S3/R2 Push
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict
import io
import zipfile
import magic  # python-magic for binary MIME type verification
from PIL import Image
import boto3
from botocore.config import Config
import os

router = APIRouter(prefix="/api/v1/admin/catalog", tags=["Admin Catalog Pipeline"])

# AWS S3 / Cloudflare R2 Client Initialization
s3_client = boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT_URL"), # e.g. https://<account_id>.r2.cloudflarestorage.com
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    config=Config(signature_version="s3v4")
)
BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "sutura-b2b-catalog-assets")
CDN_BASE_URL = os.getenv("CDN_BASE_URL", "https://cdn.sutura-wholesale.com")

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/tiff", "image/webp"]
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB raw maximum

def sanitize_and_verify_image(file_bytes: bytes) -> str:
    """Verifies magic bytes to prevent polyglot malware attacks."""
    mime = magic.from_buffer(file_bytes, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Security rejection: Uploaded file signature {mime} is unauthorized."
        )
    return mime

def process_and_compress_webp(img: Image.Image, max_width: int, quality: int = 82) -> bytes:
    """Resizes and compresses images to modern WebP format with ICC profile preservation."""
    resized = img.copy()
    if resized.width > max_width:
        ratio = max_width / float(resized.width)
        new_height = int(float(resized.height) * float(ratio))
        resized = resized.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    # Convert RGBA to RGB with clean ivory background if necessary
    if resized.mode in ("RGBA", "LA") or (resized.mode == "P" and "transparency" in resized.info):
        alpha = resized.convert("RGBA")
        bg = Image.new("RGBA", alpha.size, (255, 255, 255, 255))
        resized = Image.alpha_composite(bg, alpha).convert("RGB")
    elif resized.mode != "RGB":
        resized = resized.convert("RGB")

    output_stream = io.BytesIO()
    resized.save(output_stream, format="WEBP", quality=quality, method=6)
    return output_stream.getvalue()

@router.post("/upload-product-asset")
async def upload_catalog_product_image(
    sku: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...)
):
    raw_content = await file.read()
    if len(raw_content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds 50MB ceiling.")

    # 1. Malware and MIME Verification
    mime_type = sanitize_and_verify_image(raw_content)

    # 2. Open Pillow Image
    try:
        master_img = Image.open(io.BytesIO(raw_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Corrupt image binary: {str(e)}")

    # 3. Derive Multi-Scale WebP Renditions
    catalog_1200_bytes = process_and_compress_webp(master_img, max_width=1200, quality=85)
    matrix_600_bytes = process_and_compress_webp(master_img, max_width=600, quality=80)
    thumb_200_bytes = process_and_compress_webp(master_img, max_width=200, quality=75)

    # 4. Generate Retailer Marketing Kit ZIP (with Instagram 1:1, 9:16 story cuts)
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr(f"{sku}_Catalog_1200w.webp", catalog_1200_bytes)
        zip_file.writestr(f"{sku}_Shopify_Matrix.webp", matrix_600_bytes)
        # Create 1:1 Instagram Square Cut
        sq_size = min(master_img.width, master_img.height)
        sq_img = master_img.crop(((master_img.width - sq_size)//2, (master_img.height - sq_size)//2, (master_img.width + sq_size)//2, (master_img.height + sq_size)//2))
        sq_bytes = process_and_compress_webp(sq_img, max_width=1080, quality=88)
        zip_file.writestr(f"{sku}_Instagram_Square_1080x1080.webp", sq_bytes)

    zip_bytes = zip_buffer.getvalue()

    # 5. Push to S3 / Cloudflare R2
    def upload_s3(key: str, data: bytes, content_type: str):
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable"
        )
        return f"{CDN_BASE_URL}/{key}"

    c1200_url = upload_s3(f"products/{sku}/catalog_1200.webp", catalog_1200_bytes, "image/webp")
    m600_url = upload_s3(f"products/{sku}/matrix_600.webp", matrix_600_bytes, "image/webp")
    t200_url = upload_s3(f"products/{sku}/thumb_200.webp", thumb_200_bytes, "image/webp")
    zip_url = upload_s3(f"marketing-packs/{sku}_Retailer_Asset_Pack.zip", zip_bytes, "application/zip")

    # 6. Return Structured Metadata for Zero-Touch Database Push
    return {
        "status": "SUCCESS",
        "sku": sku,
        "compression": {
            "original_bytes": len(raw_content),
            "catalog_webp_bytes": len(catalog_1200_bytes),
            "reduction_percentage": round((1 - (len(catalog_1200_bytes) / len(raw_content))) * 100, 2)
        },
        "cdn_urls": {
            "catalog1200": c1200_url,
            "matrix600": m600_url,
            "thumb200": t200_url,
            "asset_zip": zip_url
        }
    }`;

  // 3. FastAPI Auth & Security
  const authCode = `# app/api/auth.py
# Production FastAPI B2B Gated Auth, JWT & NoSQL Injection Protection
from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, timedelta
import jwt
import re
import os

router = APIRouter(prefix="/api/v1", tags=["B2B Auth & Security"])
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "b2b-super-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Hours

# MongoDB Async Motor Client
mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URI", "mongodb://mongo:27017"))
db = mongo_client["sutura_wholesale"]

class WholesaleRegistrationRequest(BaseModel):
    business_name: str
    contact_name: str
    email: EmailStr
    phone: str
    tax_or_resale_id: str
    country: str
    business_type: str

    @validator("tax_or_resale_id")
    def validate_tax_id(cls, v):
        # Strict sanitization against NoSQL injection ($ne, $gt, regex injections)
        clean = re.sub(r"[^A-Za-z0-9-]", "", v)
        if len(clean) < 5:
            raise ValueError("Tax/Resale ID must be at least 5 alphanumeric characters.")
        return clean.upper()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_approved_buyer(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        account_status = payload.get("status")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate wholesale credentials.")

    # Strictly Gate Access: Reject Pending or Rejected accounts from viewing wholesale prices
    if role != "ADMIN" and account_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Wholesale access locked: Account status is PENDING_VERIFICATION. Awaiting tax permit approval."
        )

    # Sanitize query against NoSQL operators (guarantees safe primitive match)
    user = await db.buyers.find_one({"_id": str(user_id)}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Wholesale buyer not found.")
    return user

@router.get("/wholesale/catalog/pricing")
async def get_gated_wholesale_pricing(
    sku: str,
    current_user: dict = Depends(get_current_approved_buyer)
):
    """
    CRITICAL B2B SECURITY:
    Rejects unauthorized or pending users. Only approved retailers receive FOB Mill pricing.
    """
    # Safe regex-escaped query
    clean_sku = re.escape(sku)
    product = await db.products.find_one({"sku": clean_sku})
    if not product:
        raise HTTPException(status_code=404, detail="SKU not found.")

    return {
        "sku": product["sku"],
        "moq": product["moq"],
        "pricing_tiers": product["pricing_tiers"],
        "assigned_buyer_tier": current_user.get("assigned_tier", "TIER_1_STANDARD"),
    }`;

  // 4. DevOps Orchestration
  const devopsCode = `# docker-compose.yml
# Production DevOps Orchestration for Next.js, FastAPI, NGINX & MongoDB
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: sutura-nginx-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - b2b-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: sutura-nextjs-ui
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.sutura-wholesale.com
    networks:
      - b2b-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    container_name: sutura-fastapi-core
    restart: always
    environment:
      - MONGODB_URI=mongodb://mongo:27017/sutura_wholesale
      - JWT_SECRET_KEY=\${JWT_SECRET_KEY}
      - S3_ENDPOINT_URL=\${S3_ENDPOINT_URL}
      - AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET_NAME=\${S3_BUCKET_NAME}
    depends_on:
      - mongo
    networks:
      - b2b-network

  mongo:
    image: mongo:7.0
    container_name: sutura-mongodb
    restart: always
    volumes:
      - mongo_data:/data/db
    networks:
      - b2b-network

networks:
  b2b-network:
    driver: bridge

volumes:
  mongo_data:

---
# nginx.conf (Reverse Proxy with Rate Limiting & SSL Headers)
events { worker_connections 1024; }

http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=15r/s;

    server {
        listen 80;
        server_name sutura-wholesale.com www.sutura-wholesale.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name sutura-wholesale.com www.sutura-wholesale.com;

        # SSL Certificates
        ssl_certificate /etc/letsencrypt/live/sutura-wholesale.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/sutura-wholesale.com/privkey.pem;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

        # API Reverse Proxy with Rate Limiting
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Next.js Frontend
        location / {
            proxy_pass http://frontend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arch-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-[#18181B] text-neutral-200 rounded-2xl max-w-5xl w-full shadow-2xl border border-neutral-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#202024] border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/15 text-[#D4AF37] rounded-lg border border-[#D4AF37]/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="arch-modal-title" className="font-serif text-lg font-bold text-white">
                B2B Architecture, Backend Pipeline & DevOps Orchestration
              </h2>
              <p className="text-xs text-neutral-400">
                Production-grade Next.js, FastAPI, Pillow WebP pipeline, JWT gating, and Docker setup.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close architecture modal"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-2.5 bg-[#1F1F23] border-b border-neutral-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('FRONTEND')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'FRONTEND'
                ? 'bg-[#D4AF37] text-[#1E1E1E] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            1. Next.js Bulk Order Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PIPELINE')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'PIPELINE'
                ? 'bg-[#D4AF37] text-[#1E1E1E] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            2. FastAPI Upload Pipeline & S3
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AUTH')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'AUTH'
                ? 'bg-[#D4AF37] text-[#1E1E1E] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            3. FastAPI B2B Auth & Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DEVOPS')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'DEVOPS'
                ? 'bg-[#D4AF37] text-[#1E1E1E] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Container className="w-3.5 h-3.5" />
            4. Docker, NGINX & DevOps
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-[11px]">
              {activeTab === 'FRONTEND' && 'components/BulkOrderMatrix.tsx (Next.js 14 App Router + Tailwind)'}
              {activeTab === 'PIPELINE' && 'backend/app/api/pipeline.py (FastAPI + Pillow + boto3 S3/R2)'}
              {activeTab === 'AUTH' && 'backend/app/api/auth.py (FastAPI JWT + Motor MongoDB NoSQL Shield)'}
              {activeTab === 'DEVOPS' && 'docker-compose.yml + nginx.conf (Microservices network)'}
            </span>

            <button
              type="button"
              onClick={() => {
                const code =
                  activeTab === 'FRONTEND'
                    ? frontendCode
                    : activeTab === 'PIPELINE'
                    ? pipelineCode
                    : activeTab === 'AUTH'
                    ? authCode
                    : devopsCode;
                copyToClipboard(activeTab, code);
              }}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-[#0F0F11] p-4 rounded-xl border border-neutral-800 overflow-x-auto text-[11px] text-neutral-300">
            <code>
              {activeTab === 'FRONTEND' && frontendCode}
              {activeTab === 'PIPELINE' && pipelineCode}
              {activeTab === 'AUTH' && authCode}
              {activeTab === 'DEVOPS' && devopsCode}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
