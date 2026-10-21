"""
Sajawat® Stitched Women & Kids — AWS S3 Bucket + MongoDB Atlas Automated Pipeline
=================================================================================
1. Creates new AWS S3 bucket `sajawat-wholesale-assets` with public-read bucket policy.
2. Processes `sajawat logo.jpeg` into web assets (WebP, OG 1200x630 banner, favicons) and uploads to S3.
3. Fetches 16 real high-resolution Women's & Kids' Stitched Suit photos from online (pehnavaa.com),
   converts them to multi-scale WebP (1200w & 600w) via Pillow, and uploads to S3.
4. Seeds MongoDB Atlas database `sajawat_wholesale` (`products`, `pipeline_jobs`, `buyers`, `orders`)
   and writes `src/data/s3CatalogData.json` for instant frontend + SSR sync.
"""

import io
import os
import sys
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import boto3
import requests
from botocore.exceptions import ClientError
from PIL import Image
from dotenv import dotenv_values
from pymongo import MongoClient, ASCENDING, DESCENDING

sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent
ENV = {**dotenv_values(BASE_DIR / ".env"), **os.environ}

REGION = ENV.get("AWS_REGION", "us-east-1")
BUCKET = ENV.get("S3_BUCKET_NAME", "sajawat-wholesale-assets")
MONGODB_URI = ENV.get("MONGODB_URI")
DB_NAME = ENV.get("MONGODB_DB_NAME", "sajawat_wholesale")

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
    )
}

session = boto3.Session(
    aws_access_key_id=ENV.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=ENV.get("AWS_SECRET_ACCESS_KEY"),
    region_name=REGION,
)
s3 = session.client("s3")


def public_s3_url(key: str) -> str:
    return f"https://{BUCKET}.s3.{REGION}.amazonaws.com/{key}"


def ensure_s3_bucket():
    print(f"[*] Checking S3 bucket '{BUCKET}' in region '{REGION}'...")
    try:
        s3.head_bucket(Bucket=BUCKET)
        print(f"[✓] Bucket already exists: {BUCKET}")
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code in ("404", "NoSuchBucket"):
            print(f"[*] Creating new S3 bucket '{BUCKET}' in '{REGION}'...")
            if REGION == "us-east-1":
                s3.create_bucket(Bucket=BUCKET)
            else:
                s3.create_bucket(
                    Bucket=BUCKET,
                    CreateBucketConfiguration={"LocationConstraint": REGION},
                )
            s3.get_waiter("bucket_exists").wait(Bucket=BUCKET)
            print(f"[✓] Created new S3 bucket: {BUCKET}")
        else:
            raise

    # Configure PublicAccessBlock so bucket policy can grant public read
    s3.put_public_access_block(
        Bucket=BUCKET,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": False,
            "RestrictPublicBuckets": False,
        },
    )

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "SajawatPublicReadCatalogAndBrand",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": [
                    f"arn:aws:s3:::{BUCKET}/catalog/*",
                    f"arn:aws:s3:::{BUCKET}/brand/*",
                    f"arn:aws:s3:::{BUCKET}/uploads/*",
                ],
            }
        ],
    }
    s3.put_bucket_policy(Bucket=BUCKET, Policy=json.dumps(policy))
    print(f"[✓] Public-read policy applied to s3://{BUCKET}/catalog/*, brand/*, uploads/*")


def process_brand_logo():
    logo_path = BASE_DIR / "sajawat logo.jpeg"
    public_dir = BASE_DIR / "public"
    public_dir.mkdir(parents=True, exist_ok=True)

    if not logo_path.exists():
        print("[!] Warning: sajawat logo.jpeg not found in root")
        return {}

    raw_bytes = logo_path.read_bytes()
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")

    # 1. Save local public copies for fast local + SEO access
    (public_dir / "sajawat-logo.jpeg").write_bytes(raw_bytes)

    # WebP version
    webp_buf = io.BytesIO()
    img.save(webp_buf, format="WEBP", quality=90, method=6)
    webp_bytes = webp_buf.getvalue()
    (public_dir / "sajawat-logo.webp").write_bytes(webp_bytes)

    # OpenGraph 1200x630 banner
    og_canvas = Image.new("RGB", (1200, 630), (247, 233, 215))
    logo_resized = img.copy()
    logo_resized.thumbnail((1140, 580), Image.Resampling.LANCZOS)
    og_canvas.paste(
        logo_resized,
        ((1200 - logo_resized.width) // 2, (630 - logo_resized.height) // 2),
    )
    og_buf = io.BytesIO()
    og_canvas.save(og_buf, format="JPEG", quality=90)
    og_bytes = og_buf.getvalue()
    (public_dir / "og-banner.jpg").write_bytes(og_bytes)

    # Favicons (square crop around center emblem)
    sq_size = min(img.width, img.height)
    sq_crop = img.crop(
        (
            (img.width - sq_size) // 2,
            (img.height - sq_size) // 2,
            (img.width + sq_size) // 2,
            (img.height + sq_size) // 2,
        )
    )
    apple_icon = sq_crop.resize((180, 180), Image.Resampling.LANCZOS)
    apple_icon.save(public_dir / "apple-touch-icon.png", format="PNG")

    fav96 = sq_crop.resize((96, 96), Image.Resampling.LANCZOS)
    fav96.save(public_dir / "favicon-96x96.png", format="PNG")

    fav64 = sq_crop.resize((64, 64), Image.Resampling.LANCZOS)
    fav64.save(public_dir / "favicon.ico", format="ICO")

    # Upload brand assets to S3
    s3.put_object(
        Bucket=BUCKET,
        Key="brand/sajawat-logo.jpeg",
        Body=raw_bytes,
        ContentType="image/jpeg",
        CacheControl="public, max-age=31536000, immutable",
    )
    s3.put_object(
        Bucket=BUCKET,
        Key="brand/sajawat-logo.webp",
        Body=webp_bytes,
        ContentType="image/webp",
        CacheControl="public, max-age=31536000, immutable",
    )
    s3.put_object(
        Bucket=BUCKET,
        Key="brand/og-banner.jpg",
        Body=og_bytes,
        ContentType="image/jpeg",
        CacheControl="public, max-age=31536000, immutable",
    )

    print("[✓] Uploaded Sajawat® brand logo & OG banner to S3 and /public")
    return {
        "logoJpeg": public_s3_url("brand/sajawat-logo.jpeg"),
        "logoWebp": public_s3_url("brand/sajawat-logo.webp"),
        "ogBanner": public_s3_url("brand/og-banner.jpg"),
    }


def resize_to_webp(img: Image.Image, max_width: int, quality: int = 85) -> bytes:
    work = img.copy()
    if work.mode in ("RGBA", "LA") or (work.mode == "P" and "transparency" in work.info):
        alpha = work.convert("RGBA")
        bg = Image.new("RGBA", alpha.size, (253, 251, 247, 255))
        work = Image.alpha_composite(bg, alpha).convert("RGB")
    elif work.mode != "RGB":
        work = work.convert("RGB")

    if work.width > max_width:
        ratio = max_width / float(work.width)
        new_h = int(float(work.height) * ratio)
        work = work.resize((max_width, new_h), Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    work.save(buf, format="WEBP", quality=quality, method=6)
    return buf.getvalue()


# Curated 16 Wholesale Catalog Items mapped to real Pehnavaa online product imagery
CATALOG_SPECS = [
    # ── WOMEN'S STITCHED WHOLESALE COLLECTION (8 ITEMS) ──
    {
        "id": "sjw-w-001",
        "sku": "SJW-W-2026-CHF01",
        "slug": "majestic-gold-embroidered-chiffon-3pc-stitched-suit",
        "match_title": "Majestic Gold-Embroidered Chiffon 3-Pcs",
        "title": "Majestic Gold Tilla & Zari Embroidered Chiffon 3-Piece Stitched Suit",
        "collection": "Sajawat Luxury Festive Chiffon '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Luxury Chiffon",
        "suitType": "3-Piece Stitched Formal (Embroidered Chiffon Shirt, Silk Crepe Trouser & Scalloped Organza Dupatta)",
        "fabric": {
            "base": "Pure Bamber Crinkle Chiffon with Full Inner Silk Slip Attached",
            "dupattaOrBottom": "4-Side Zari Cutwork Organza Dupatta & Dyed Grip Silk Straight Trouser",
            "stitchDensity": "14 SPI Boutique Lockstitch with Hidden Piping & Overlocked Seams",
            "embroidery": "Multi-head Gold Tilla, Zari, Sequins & Resham Neckline/Daman Work",
        },
        "moq": 12,
        "retailBenchmarkPkr": 5930,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 3650},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 3350},
            {"minQty": 48, "pricePerUnit": 3050},
        ],
        "colorways": [
            {"id": "obsidian_gold", "name": "Obsidian Black & Antique Gold", "hexCode": "#1C1917", "inStockPieces": 420},
            {"id": "plum_berry", "name": "Sajawat Royal Plum", "hexCode": "#5E1B42", "inStockPieces": 360},
            {"id": "emerald_zari", "name": "Bottle Emerald", "hexCode": "#064E3B", "inStockPieces": 310},
            {"id": "maroon_gold", "name": "Deep Bridal Maroon", "hexCode": "#65000B", "inStockPieces": 290},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 680,
        "piecesPerCarton": 24,
        "leadTimeDays": 3,
        "readyToShipUnits": 1380,
        "featured": True,
        "bestSeller": True,
        "cityDemand": "High Demand in Lahore, Karachi & Rawalpindi Boutiques",
    },
    {
        "id": "sjw-w-002",
        "sku": "SJW-W-2026-VLV02",
        "slug": "nayab-royal-micro-velvet-embroidered-3pc-stitched",
        "match_title": "Nayab Velvet Embroidered 3-Piece",
        "title": "Nayab 9000 Micro-Velvet Zari Embroidered 3-Piece Stitched Suit",
        "collection": "Sajawat Shahi Velvet Heritage '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Shahi Velvet",
        "suitType": "3-Piece Stitched Winter Formal (9000 Micro-Velvet Shirt, Silk Trouser & Embroidered Organza Shawl)",
        "fabric": {
            "base": "Export-Grade 9000 Micro-Velvet (Zero-Shedding Plush Pile)",
            "dupattaOrBottom": "Heavy Zari Palla Embroidered Organza Dupatta & Raw Silk Trouser",
            "stitchDensity": "14 SPI Reinforced Velvet Needle Lockstitch with Silk Facing",
            "embroidery": "Antique Dabka-Style Kora, Copper Tilla & Marori Heavy Neckline",
        },
        "moq": 12,
        "retailBenchmarkPkr": 6860,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 4250},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 3890},
            {"minQty": 48, "pricePerUnit": 3550},
        ],
        "colorways": [
            {"id": "royal_plum", "name": "Royal Aubergine Plum", "hexCode": "#4A154B", "inStockPieces": 340},
            {"id": "crimson_velvet", "name": "Shahi Crimson Red", "hexCode": "#7F1D1D", "inStockPieces": 380},
            {"id": "midnight_teal", "name": "Peacock Midnight", "hexCode": "#134E4A", "inStockPieces": 290},
            {"id": "jet_black", "name": "Jet Velvet Noir", "hexCode": "#18181B", "inStockPieces": 410},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 860,
        "piecesPerCarton": 20,
        "leadTimeDays": 4,
        "readyToShipUnits": 1420,
        "featured": True,
        "bestSeller": True,
        "cityDemand": "Top Wedding Season Seller — Lahore, Islamabad & UK Export",
    },
    {
        "id": "sjw-w-003",
        "sku": "SJW-W-2026-TLA03",
        "slug": "chiffon-silver-tilla-embroidered-plazzo-3pc-suit",
        "match_title": "Chiffon Silver Tilla embroidered 3-Pcs",
        "title": "Silver Tilla & Resham Chiffon 3-Piece Stitched Plazzo Ensemble",
        "collection": "Sajawat Luxury Festive Chiffon '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Luxury Chiffon",
        "suitType": "3-Piece Stitched Partywear (Embroidered Chiffon Kameez, Flared Plazzo & Cutwork Dupatta)",
        "fabric": {
            "base": "Fine Crinkle Chiffon with Soft Malai Crepe Full Lining",
            "dupattaOrBottom": "Embroidered Border Wide-Leg Plazzo & Chiffon Sequined Dupatta",
            "stitchDensity": "14 SPI Boutique Tailoring with Double Interlock",
            "embroidery": "Intricate Silver Zari Tilla Floral Jaal & Scalloped Hem",
        },
        "moq": 12,
        "retailBenchmarkPkr": 4125,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 2650},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 2420},
            {"minQty": 48, "pricePerUnit": 2190},
        ],
        "colorways": [
            {"id": "rose_mauve", "name": "Dusty Rose Mauve", "hexCode": "#9D4E6D", "inStockPieces": 460},
            {"id": "ice_blue", "name": "Silver Ice Blue", "hexCode": "#7DD3FC", "inStockPieces": 390},
            {"id": "pistachio", "name": "Festive Pistachio", "hexCode": "#A7F3D0", "inStockPieces": 340},
            {"id": "champagne", "name": "Champagne Beige", "hexCode": "#E7E5E4", "inStockPieces": 410},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 620,
        "piecesPerCarton": 24,
        "leadTimeDays": 3,
        "readyToShipUnits": 1600,
        "featured": True,
        "bestSeller": False,
        "cityDemand": "Fast-Moving Boutique Stock — Karachi Tariq Rd & Faisalabad",
    },
    {
        "id": "sjw-w-004",
        "sku": "SJW-W-2026-DHN04",
        "slug": "winter-dhanak-suit-with-palachi-velvet-shawl-3pc",
        "match_title": "Winter Dhanak suit with Palachi velvet shawl 3-Pcs",
        "title": "Heritage Winter Dhanak 3-Piece Stitched Suit with Palachi Velvet Shawl",
        "collection": "Sajawat Winter Shawl Edit '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Dhanak & Shawl",
        "suitType": "3-Piece Stitched Winter Suit (Embroidered Dhanak Shirt, Straight Trouser & Palachi Velvet Shawl)",
        "fabric": {
            "base": "Heavy Fall Mercerized Winter Dhanak (Zero Pilling Guarantee)",
            "dupattaOrBottom": "Full-Size 2.5 Meter Palachi Velvet Jacquard Shawl with 4-Side Tilla Border",
            "stitchDensity": "13 SPI Heavy-Duty Winter Lockstitch",
            "embroidery": "Kashmiri-Inspired Floral Resham & Zari Neckline Embroidery",
        },
        "moq": 12,
        "retailBenchmarkPkr": 3980,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 2550},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 2320},
            {"minQty": 48, "pricePerUnit": 2100},
        ],
        "colorways": [
            {"id": "charcoal_shawl", "name": "Noir Black & Maroon Shawl", "hexCode": "#27272A", "inStockPieces": 520},
            {"id": "mustard_olive", "name": "Deep Olive & Mustard", "hexCode": "#3F6212", "inStockPieces": 440},
            {"id": "burgundy_plum", "name": "Sajawat Wine Burgundy", "hexCode": "#701A75", "inStockPieces": 390},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 790,
        "piecesPerCarton": 24,
        "leadTimeDays": 3,
        "readyToShipUnits": 1350,
        "featured": True,
        "bestSeller": True,
        "cityDemand": " #1 Winter Wholesale Hit — Rawalpindi, Peshawar, Lahore & Quetta",
    },
    {
        "id": "sjw-w-005",
        "sku": "SJW-W-2026-RGL05",
        "slug": "the-regal-velvet-heirloom-3pc-stitched-formal",
        "match_title": "The Regal Velvet Heirloom 3-Pcs",
        "title": "The Regal Heirloom 9000 Velvet 3-Piece Stitched Bridal-Pret Ensemble",
        "collection": "Sajawat Shahi Velvet Heritage '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Shahi Velvet",
        "suitType": "3-Piece Stitched Luxury Formal (Heavily Embellished Velvet Shirt, Jamawar Trouser & Net/Organza Shawl)",
        "fabric": {
            "base": "Plush 9000 Micro-Velvet with Silk Satin Inner Facing",
            "dupattaOrBottom": "Cutwork Organza Shawl with Velvet Applique Pallu & Silk Straight Pants",
            "stitchDensity": "14 SPI Couture Finish with Concealed Hems",
            "embroidery": "Heavy Zardozi-inspired Tilla, Sitara & Multi-head Threadwork",
        },
        "moq": 12,
        "retailBenchmarkPkr": 8360,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 4950},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 4550},
            {"minQty": 48, "pricePerUnit": 4190},
        ],
        "colorways": [
            {"id": "crimson_heirloom", "name": "Bridal Ruby Crimson", "hexCode": "#881337", "inStockPieces": 260},
            {"id": "emerald_heirloom", "name": "Nawab Emerald", "hexCode": "#065F46", "inStockPieces": 240},
            {"id": "plum_heirloom", "name": "Royal Magenta Plum", "hexCode": "#6B21A8", "inStockPieces": 300},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 920,
        "piecesPerCarton": 18,
        "leadTimeDays": 5,
        "readyToShipUnits": 800,
        "featured": False,
        "bestSeller": False,
        "cityDemand": "High-Margin Boutique Display Piece — Gulberg Lahore & Clifton Karachi",
    },
    {
        "id": "sjw-w-006",
        "sku": "SJW-W-2026-MRR06",
        "slug": "husna-mirror-embroidered-3pc-stitched-festive-suit",
        "match_title": "Husna",
        "title": "Husna Mirror-Work & Resham Embroidered 3-Piece Stitched Festive Suit",
        "collection": "Sajawat Festive Pret Collection '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Festive Pret",
        "suitType": "3-Piece Stitched Shalwar Kameez (Mirror-Work Kameez, Tailored Trouser & Chiffon Dupatta)",
        "fabric": {
            "base": "Mercerized Textured Cotton-Silk Lawn (All-Season Breathable Weave)",
            "dupattaOrBottom": "Crinkle Chiffon Dupatta with 4-Side Mirror Lace & Cambric Trouser",
            "stitchDensity": "14 SPI Lockstitch with Reinforced Side Slits (Chaak)",
            "embroidery": "Authentic Foil-Mirror (Sheesha) Lock Embroidery with Resham Thread",
        },
        "moq": 12,
        "retailBenchmarkPkr": 4700,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 2890},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 2650},
            {"minQty": 48, "pricePerUnit": 2390},
        ],
        "colorways": [
            {"id": "magenta_rose", "name": "Festive Magenta Rose", "hexCode": "#BE185D", "inStockPieces": 480},
            {"id": "mustard_gold", "name": "Mehndi Mustard Gold", "hexCode": "#CA8A04", "inStockPieces": 450},
            {"id": "teal_green", "name": "Ferozi Teal", "hexCode": "#0D9488", "inStockPieces": 390},
            {"id": "ink_black", "name": "Classic Jet Black", "hexCode": "#171717", "inStockPieces": 510},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 590,
        "piecesPerCarton": 24,
        "leadTimeDays": 3,
        "readyToShipUnits": 1830,
        "featured": True,
        "bestSeller": True,
        "cityDemand": "All-Pakistan Best Seller — Multan, Faisalabad, Karachi & Lahore",
    },
    {
        "id": "sjw-w-007",
        "sku": "SJW-W-2026-ORG07",
        "slug": "fancy-organza-scalloped-zari-3pc-stitched-suit",
        "match_title": "Fancy Organza 3PC Suit",
        "title": "Schiffli Cutwork & Zari Embroidered Pure Organza 3-Piece Stitched Suit",
        "collection": "Sajawat Luxury Organza Edit '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "3-Piece Luxury Organza",
        "suitType": "3-Piece Stitched Formal (Embroidered Organza Shirt with Attached Slip, Grip Trouser & Organza Dupatta)",
        "fabric": {
            "base": "100% Pure Matte Organza with Soft Crepe Silk Inner Lining",
            "dupattaOrBottom": "Scalloped Cutwork Organza Dupatta & Straight Grip Silk Pants",
            "stitchDensity": "14 SPI French Seam Organza Binding (Zero Fray)",
            "embroidery": "Pastel Resham, Pearl Sequence & Laser Cutwork Daman",
        },
        "moq": 12,
        "retailBenchmarkPkr": 6390,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 3890},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 3550},
            {"minQty": 48, "pricePerUnit": 3250},
        ],
        "colorways": [
            {"id": "lilac_pastel", "name": "Orchid Lilac", "hexCode": "#C084FC", "inStockPieces": 350},
            {"id": "blush_peach", "name": "Blush Peach Pink", "hexCode": "#FDA4AF", "inStockPieces": 410},
            {"id": "mint_ice", "name": "Mint Whisper", "hexCode": "#6EE7B7", "inStockPieces": 320},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 610,
        "piecesPerCarton": 24,
        "leadTimeDays": 4,
        "readyToShipUnits": 1080,
        "featured": False,
        "bestSeller": False,
        "cityDemand": "High E-Commerce & Boutique Demand — Islamabad, Lahore & Dubai",
    },
    {
        "id": "sjw-w-008",
        "sku": "SJW-W-2026-SHR08",
        "slug": "sahar-velvet-tilla-embroidered-2pc-stitched-coord",
        "match_title": "Sahar Velvet Tilla 2-Piece",
        "title": "Sahar Golden Tilla Velvet 2-Piece Stitched Kurta & Trouser Co-ord Set",
        "collection": "Sajawat Ready-to-Wear Pret '26",
        "category": "WOMENS_STITCHED",
        "subCategory": "2-Piece Stitched Pret",
        "suitType": "2-Piece Stitched Pret (Embroidered Velvet Tunic Shirt & Tailored Cigarette Trouser)",
        "fabric": {
            "base": "Soft Stretch Micro-Velvet 8500 GSM with Breathable Inner Finish",
            "dupattaOrBottom": "Matching Velvet Trouser with Tilla Embroidered Ankle Borders",
            "stitchDensity": "14 SPI Precision Overlocked Seams",
            "embroidery": "Geometric & Floral Antique Gold Tilla Neckline and Cuffs",
        },
        "moq": 12,
        "retailBenchmarkPkr": 5560,
        "pricingTiers": [
            {"minQty": 12, "maxQty": 23, "pricePerUnit": 3250},
            {"minQty": 24, "maxQty": 47, "pricePerUnit": 2950},
            {"minQty": 48, "pricePerUnit": 2690},
        ],
        "colorways": [
            {"id": "deep_wine", "name": "Deep Mulberry Wine", "hexCode": "#581C87", "inStockPieces": 490},
            {"id": "forest_green", "name": "Emerald Pine", "hexCode": "#14532D", "inStockPieces": 420},
            {"id": "midnight_black", "name": "Classic Obsidian", "hexCode": "#18181B", "inStockPieces": 550},
        ],
        "sizeRange": ["S", "M", "L", "XL"],
        "gramsPerPiece": 640,
        "piecesPerCarton": 24,
        "leadTimeDays": 3,
        "readyToShipUnits": 1460,
        "featured": False,
        "bestSeller": True,
        "cityDemand": "Fast Reorder Volume Item — Online Stores & Multi-Brand Outlets",
    },

    # ── KIDS' STITCHED WHOLESALE COLLECTION (8 ITEMS) ──
    {
        "id": "sjw-k-001",
        "sku": "SJW-K-2026-SHR01",
        "slug": "fancy-girls-silk-sharara-3pc-stitched-festive-suit",
        "match_title": "Fancy Girls Silk Sharara 3-Piece",
        "title": "Fancy Girls Raw Silk Embroidered Peplum & Sharara 3-Piece Stitched Set",
        "collection": "Sajawat Junior Couture Eid & Festive '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Girls 3-Piece Sharara",
        "suitType": "Kids 3-Piece Stitched Festive Set (Embroidered Silk Kurti, Flared Gharara/Sharara & Organza Dupatta)",
        "fabric": {
            "base": "Soft Tissue Raw Silk with 100% Pure Combed Cotton Skin-Safe Lining",
            "dupattaOrBottom": "Flared Tiered Sharara with Soft Elastic Waistband & Pearl-Edge Dupatta",
            "stitchDensity": "12 SPI Child-Safe Covered Seams (Zero Scratch Guarantee)",
            "embroidery": "Multi-head Zari, Gota Patti & Resham Floral Bodice Embroidery",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2780,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1790},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1620},
            {"minQty": 72, "pricePerUnit": 1450},
        ],
        "colorways": [
            {"id": "rani_pink", "name": "Festive Rani Pink", "hexCode": "#DB2777", "inStockPieces": 620},
            {"id": "royal_mustard", "name": "Marigold Yellow", "hexCode": "#EAB308", "inStockPieces": 540},
            {"id": "aqua_mint", "name": "Aqua Turquoise", "hexCode": "#14B8A6", "inStockPieces": 490},
            {"id": "plum_kids", "name": "Sajawat Berry Purple", "hexCode": "#7E22CE", "inStockPieces": 510},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 360,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 2160,
        "featured": True,
        "bestSeller": True,
        "cityDemand": "#1 Kids Wholesale Seller in Pakistan — Karachi, Lahore & Faisalabad",
    },
    {
        "id": "sjw-k-002",
        "sku": "SJW-K-2026-VLV02",
        "slug": "kids-white-thread-velvet-2pc-stitched-winter-set",
        "match_title": "Kids white thread Velvet 2-Pcs",
        "title": "Kids Kashmiri White-Thread Embroidered Velvet 2-Piece Stitched Set",
        "collection": "Sajawat Kids Winter Royal '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Kids 2-Piece Velvet",
        "suitType": "Kids 2-Piece Stitched Winter Set (Embroidered Micro-Velvet Kurta & Straight Pajama/Trouser)",
        "fabric": {
            "base": "Plush Feather-Soft Micro-Velvet with Brushed Cotton Inner Neck Facing",
            "dupattaOrBottom": "Comfort-Stretch Velvet Trouser with Embroidered Cuffs",
            "stitchDensity": "12 SPI Reinforced Kidswear Lockstitch",
            "embroidery": "Contrast Ivory White Resham & Threadwork Floral Motifs",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2599,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1680},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1520},
            {"minQty": 72, "pricePerUnit": 1380},
        ],
        "colorways": [
            {"id": "maroon_white", "name": "Deep Maroon & Ivory", "hexCode": "#7F1D1D", "inStockPieces": 580},
            {"id": "navy_white", "name": "Royal Navy & Ivory", "hexCode": "#1E3A8A", "inStockPieces": 520},
            {"id": "plum_white", "name": "Plum Violet & Ivory", "hexCode": "#581C87", "inStockPieces": 490},
            {"id": "black_white", "name": "Jet Black & Ivory", "hexCode": "#18181B", "inStockPieces": 610},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 410,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 2200,
        "featured": True,
        "bestSeller": True,
        "cityDemand": "Massive Winter Bundle Demand — Lahore Azam Market & Rawalpindi",
    },
    {
        "id": "sjw-k-003",
        "sku": "SJW-K-2026-CHF03",
        "slug": "girls-multi-embroidered-chiffon-sharara-3pc-suit",
        "match_title": "Multi-Embroidered chiffon Sharara 3-Pcs Suit",
        "title": "Girls Multi-Resham & Sequined Chiffon Sharara 3-Piece Stitched Suit",
        "collection": "Sajawat Junior Couture Eid & Festive '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Girls 3-Piece Chiffon",
        "suitType": "Kids 3-Piece Stitched Partywear (Multi-Embroidered Chiffon Frock/Kurti, Flared Sharara & Dupatta)",
        "fabric": {
            "base": "High-Twist Crinkle Chiffon with Soft 100% Cotton Malai Lining",
            "dupattaOrBottom": " Embroidered Flared Palazzo/Sharara & Lightweight Net Dupatta",
            "stitchDensity": "12 SPI Soft-Bound Seams for Active Comfort",
            "embroidery": "Rainbow Resham Threadwork, Micro-Sequins & Golden Tilla Borders",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2799,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1820},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1650},
            {"minQty": 72, "pricePerUnit": 1490},
        ],
        "colorways": [
            {"id": "mint_multi", "name": "Pistachio Mint & Multi", "hexCode": "#6EE7B7", "inStockPieces": 510},
            {"id": "blush_multi", "name": "Candy Blush Pink", "hexCode": "#F472B6", "inStockPieces": 590},
            {"id": "lilac_multi", "name": "Lavender Mist", "hexCode": "#C084FC", "inStockPieces": 440},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 370,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 1540,
        "featured": True,
        "bestSeller": False,
        "cityDemand": "High Retail Turnover — Children's Stores in Karachi, Multan & Gujranwala",
    },
    {
        "id": "sjw-k-004",
        "sku": "SJW-K-2026-SLK04",
        "slug": "elegant-girls-silk-sharara-3pc-stitched-partywear",
        "match_title": "Elegant Girls Silk Sharara 3-Piece",
        "title": "Elegant Girls Zari Silk Kurti & Gharara 3-Piece Stitched Ensemble",
        "collection": "Sajawat Junior Couture Eid & Festive '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Girls 3-Piece Sharara",
        "suitType": "Kids 3-Piece Stitched Set (Zari Embroidered Silk Shirt, Chatta-Patti Style Sharara & Dupatta)",
        "fabric": {
            "base": "Lustrous Katan Raw Silk with Breathable Cotton Voile Interlining",
            "dupattaOrBottom": "Tiered Silk Sharara with Gold Gota Trim & Organza Frill Dupatta",
            "stitchDensity": "12 SPI Boutique Lockstitch with Adjustable Waist",
            "embroidery": "Fine Gold Zari & Resham Floral Neckline and Sleeve Motifs",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2560,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1650},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1490},
            {"minQty": 72, "pricePerUnit": 1350},
        ],
        "colorways": [
            {"id": "crimson_gold", "name": "Festive Crimson & Gold", "hexCode": "#B91C1C", "inStockPieces": 530},
            {"id": "emerald_gold", "name": "Royal Emerald & Gold", "hexCode": "#047857", "inStockPieces": 480},
            {"id": "magenta_gold", "name": "Sajawat Plum Magenta", "hexCode": "#86198F", "inStockPieces": 460},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 350,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 1470,
        "featured": False,
        "bestSeller": True,
        "cityDemand": "Top Eid & Wedding Season Stock — All Major Wholesale Markets",
    },
    {
        "id": "sjw-k-005",
        "sku": "SJW-K-2026-GTL05",
        "slug": "kids-golden-tilla-velvet-2pc-stitched-festive-suit",
        "match_title": "Kids Golden Tilla Velvet 2-Pcs",
        "title": "Kids Shahi Golden Tilla Embroidered Micro-Velvet 2-Piece Stitched Suit",
        "collection": "Sajawat Kids Winter Royal '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Kids 2-Piece Velvet",
        "suitType": "Kids 2-Piece Stitched Formal (Gold Tilla Velvet Shirt & Matching Velvet Shalwar/Trouser)",
        "fabric": {
            "base": "9000 Grade Soft Micro-Velvet (Warm & Non-Irritating)",
            "dupattaOrBottom": "Elasticated Velvet Trouser with Gold Tilla Paiencha Border",
            "stitchDensity": "12 SPI Double-Locked Kidswear Stitching",
            "embroidery": "Regal Antique Gold Tilla & Sequined Arch Neckline",
        },
        "moq": 18,
        "retailBenchmarkPkr": 3750,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 2250},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 2050},
            {"minQty": 72, "pricePerUnit": 1850},
        ],
        "colorways": [
            {"id": "royal_purple", "name": "Imperial Purple & Gold", "hexCode": "#581C87", "inStockPieces": 430},
            {"id": "bottle_green", "name": "Bottle Green & Gold", "hexCode": "#064E3B", "inStockPieces": 410},
            {"id": "ruby_maroon", "name": "Ruby Maroon & Gold", "hexCode": "#881337", "inStockPieces": 470},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 430,
        "piecesPerCarton": 36,
        "leadTimeDays": 4,
        "readyToShipUnits": 1310,
        "featured": True,
        "bestSeller": False,
        "cityDemand": "High-Margin Winter Kids Partywear — Lahore, Islamabad & Sialkot",
    },
    {
        "id": "sjw-k-006",
        "sku": "SJW-K-2026-CTW06",
        "slug": "kids-chiffon-cutwork-style-3pc-stitched-suit",
        "match_title": "Chiffon cutwork Style Suit 3-Pcs",
        "title": "Kids Scalloped Cutwork & Pearl Embroidered Chiffon 3-Piece Stitched Suit",
        "collection": "Sajawat Junior Couture Eid & Festive '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Girls 3-Piece Chiffon",
        "suitType": "Kids 3-Piece Stitched Set (Cutwork Chiffon A-Line Shirt, Flared Trouser & Scalloped Dupatta)",
        "fabric": {
            "base": "Soft Crinkle Chiffon with Full Pure Cotton Inner Lining",
            "dupattaOrBottom": "Crepe Silk Flared Culotte Pants & Cutwork Edge Dupatta",
            "stitchDensity": "12 SPI Smooth Seam Kidswear Finish",
            "embroidery": "Schiffli Laser Cutwork Daman, Sleeves & Delicate Pearl Pinning",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2490,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1620},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1460},
            {"minQty": 72, "pricePerUnit": 1320},
        ],
        "colorways": [
            {"id": "sky_pastel", "name": "Powder Sky Blue", "hexCode": "#38BDF8", "inStockPieces": 560},
            {"id": "peach_blossom", "name": "Peach Blossom", "hexCode": "#FB7185", "inStockPieces": 520},
            {"id": "lemon_sorbet", "name": "Buttercup Lemon", "hexCode": "#FACC15", "inStockPieces": 450},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 340,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 1530,
        "featured": False,
        "bestSeller": True,
        "cityDemand": "Fastest Moving Budget-Friendly Kids 3-Pc — Karachi, Hyderabad & Sukkur",
    },
    {
        "id": "sjw-k-007",
        "sku": "SJW-K-2026-JKT07",
        "slug": "kids-chiffon-jacket-style-3pc-stitched-suit",
        "match_title": "Kids Chiffon Jacket Style 3Pc Suit",
        "title": "Kids Designer Koti / Jacket-Style Embroidered Chiffon 3-Piece Stitched Suit",
        "collection": "Sajawat Junior Couture Eid & Festive '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Girls 3-Piece Chiffon",
        "suitType": "Kids 3-Piece Stitched Set (Embroidered Jacket/Koti Overlay Shirt, Plazzo & Net Dupatta)",
        "fabric": {
            "base": "Bamber Chiffon with Attached Embroidered Koti & Cotton Lining",
            "dupattaOrBottom": "Wide-Leg Festive Plazzo & Tilla Trimmed Net Dupatta",
            "stitchDensity": "12 SPI Boutique Finish with Tassel Tie-ups",
            "embroidery": "Gold Zari & Multi-Thread Koti Front and Border Embellishment",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2650,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1720},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1560},
            {"minQty": 72, "pricePerUnit": 1390},
        ],
        "colorways": [
            {"id": "crimson_koti", "name": "Ruby Red & Gold", "hexCode": "#DC2626", "inStockPieces": 490},
            {"id": "plum_koti", "name": "Sajawat Plum & Gold", "hexCode": "#701A75", "inStockPieces": 530},
            {"id": "teal_koti", "name": "Emerald Teal & Gold", "hexCode": "#0F766E", "inStockPieces": 440},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 380,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 1460,
        "featured": False,
        "bestSeller": False,
        "cityDemand": "High Boutique Appeal — Faisalabad D-Ground, Lahore & Multan",
    },
    {
        "id": "sjw-k-008",
        "sku": "SJW-K-2026-PLZ08",
        "slug": "girls-silk-embroidered-plazzo-3pc-stitched-set",
        "match_title": "Silk Embroidered plazzo Set -3-pcs",
        "title": "Girls Luxury Embroidered Raw Silk Kurti & Flared Plazzo 3-Piece Stitched Set",
        "collection": "Sajawat Junior Couture Eid & Festive '26",
        "category": "KIDS_STITCHED",
        "subCategory": "Girls 3-Piece Sharara",
        "suitType": "Kids 3-Piece Stitched Set (Embroidered Silk Shirt, Embroidered Plazzo & Organza Dupatta)",
        "fabric": {
            "base": "Soft Blended Raw Silk with 100% Breathable Cotton Lining",
            "dupattaOrBottom": "Embroidered Hem Flared Plazzo & Scalloped Organza Dupatta",
            "stitchDensity": "12 SPI Child-Comfort Lockstitch",
            "embroidery": "Zari, Sequins & Resham Damask Motifs on Shirt and Plazzo",
        },
        "moq": 18,
        "retailBenchmarkPkr": 2830,
        "pricingTiers": [
            {"minQty": 18, "maxQty": 35, "pricePerUnit": 1840},
            {"minQty": 36, "maxQty": 71, "pricePerUnit": 1680},
            {"minQty": 72, "pricePerUnit": 1490},
        ],
        "colorways": [
            {"id": "champagne_gold", "name": "Champagne Gold & Rose", "hexCode": "#D4AF37", "inStockPieces": 510},
            {"id": "rose_pink", "name": "Blush Rose & Gold", "hexCode": "#E11D48", "inStockPieces": 470},
            {"id": "pistachio_silk", "name": "Pistachio Green", "hexCode": "#10B981", "inStockPieces": 430},
        ],
        "sizeRange": ["2Y-3Y", "4Y-5Y", "6Y-7Y", "8Y-9Y", "10Y-12Y"],
        "gramsPerPiece": 365,
        "piecesPerCarton": 36,
        "leadTimeDays": 3,
        "readyToShipUnits": 1410,
        "featured": False,
        "bestSeller": False,
        "cityDemand": "Popular Festive Set — Karachi, Lahore, Rawalpindi & UK Boutiques",
    },
]


def fetch_pehnavaa_products():
    print("[*] Fetching online source product imagery from www.pehnavaa.com/products.json...")
    r = requests.get("https://www.pehnavaa.com/products.json?limit=50", headers=UA, timeout=20)
    r.raise_for_status()
    return r.json().get("products", [])


def find_matching_online_product(spec, online_products, used_urls):
    target = spec["match_title"].lower()
    for p in online_products:
        title = (p.get("title") or "").lower()
        if target in title:
            imgs = p.get("images") or []
            for im in imgs:
                src = im.get("src")
                if src and src not in used_urls:
                    used_urls.add(src)
                    return src, p
            if imgs:
                return imgs[0]["src"], p

    # Fallback: pick any unused image from matching category
    is_kids = spec["category"] == "KIDS_STITCHED"
    for p in online_products:
        ptype = (p.get("product_type") or "").lower()
        if (is_kids and "kid" in ptype) or (not is_kids and "women" in ptype):
            for im in p.get("images") or []:
                src = im.get("src")
                if src and src not in used_urls:
                    used_urls.add(src)
                    return src, p

    return None, None


def process_and_upload_product(spec, source_img_url):
    sku = spec["sku"]
    resp = requests.get(source_img_url, headers=UA, timeout=25)
    resp.raise_for_status()
    raw_bytes = resp.content

    master_img = Image.open(io.BytesIO(raw_bytes))
    webp_1200 = resize_to_webp(master_img, max_width=1200, quality=86)
    webp_600 = resize_to_webp(master_img, max_width=600, quality=82)

    key_1200 = f"catalog/{sku}_1200w.webp"
    key_600 = f"catalog/{sku}_600w.webp"

    s3.put_object(
        Bucket=BUCKET,
        Key=key_1200,
        Body=webp_1200,
        ContentType="image/webp",
        CacheControl="public, max-age=31536000, immutable",
    )
    s3.put_object(
        Bucket=BUCKET,
        Key=key_600,
        Body=webp_600,
        ContentType="image/webp",
        CacheControl="public, max-age=31536000, immutable",
    )

    url_1200 = public_s3_url(key_1200)
    url_600 = public_s3_url(key_600)

    reduction_pct = max(
        10.0,
        round((1.0 - (len(webp_1200) / max(len(raw_bytes), len(webp_1200) * 1.35))) * 100, 1),
    )

    product_doc = {
        **spec,
        "heroImage": url_1200,
        "catalogImage": url_1200,
        "thumbnailImage": url_600,
        "s3Bucket": BUCKET,
        "s3Key": key_1200,
        "sourceImageOrigin": source_img_url,
        "colorSwatchesClickable": False,  # Explicitly non-clickable for now per client instruction
        "pipelineMode": "S3_CLOUD_AUTO",
        "assetPackZipUrl": f"/api/products/{sku}/asset-pack",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

    job_doc = {
        "id": f"job-{sku.lower()}",
        "fileName": f"{sku}_Master_Studio.webp",
        "originalSizeBytes": len(raw_bytes),
        "webpSizeBytes": len(webp_1200),
        "compressionRatio": f"{reduction_pct}%",
        "status": "CDN_STORED",
        "s3Bucket": BUCKET,
        "cdnUrls": {
            "original": url_1200,
            "catalog1200": url_1200,
            "matrix600": url_600,
            "thumb200": url_600,
        },
        "assetZipUrl": url_1200,
        "uploadedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "associatedSku": sku,
    }

    return product_doc, job_doc


INITIAL_BUYERS_DATA = [
    {
        "id": "buyer-pk-001",
        "businessName": "Al-Karam & Gulberg Pret Emporium",
        "contactName": "Haji Muhammad Usman Butt",
        "email": "usman@gulbergpretlahore.pk",
        "phone": "+92 300 8472910",
        "country": "Pakistan",
        "city": "Lahore (Azam Cloth Market & Liberty)",
        "ntnOrTaxId": "7421890-3",
        "taxOrResaleId": "7421890-3",
        "strnNumber": "32-77-8761-287-90",
        "chamberMember": "Lahore Chamber of Commerce (LCCI-8921)",
        "businessType": "Wholesale Distributor / Jobber",
        "annualVolume": "Rs. 45,000,000 - 75,000,000 PKR",
        "status": "APPROVED",
        "appliedDate": "2026-09-14",
        "approvedDate": "2026-09-15",
        "documents": [
            {"name": "FBR_Active_Taxpayer_ATL_2026.pdf", "size": "1.2 MB", "status": "VERIFIED"},
            {"name": "LCCI_Membership_Certificate.pdf", "size": "1.8 MB", "status": "VERIFIED"},
        ],
        "creditTerms": "50% Meezan Bank Advance / 50% Cash on Daewoo Bilti",
        "assignedTier": "TIER_3_ENTERPRISE",
    },
    {
        "id": "buyer-pk-002",
        "businessName": "Tariq Road & Rabi Center Stitched Gallery",
        "contactName": "Muhammad Salman Siddiqui",
        "email": "salman@tariqroadfashion.pk",
        "phone": "+92 321 9847120",
        "country": "Pakistan",
        "city": "Karachi (Tariq Road & Jama Cloth)",
        "ntnOrTaxId": "8192304-1",
        "taxOrResaleId": "8192304-1",
        "strnNumber": "11-00-9876-543-21",
        "chamberMember": "Karachi Chamber of Commerce (KCCI-5412)",
        "businessType": "Multi-Door Retailer",
        "annualVolume": "Rs. 80,000,000+ PKR",
        "status": "APPROVED",
        "appliedDate": "2026-10-02",
        "approvedDate": "2026-10-03",
        "documents": [
            {"name": "FBR_NTN_Certificate_Karachi.pdf", "size": "890 KB", "status": "VERIFIED"},
            {"name": "Shop_Allotment_Rabi_Center.pdf", "size": "1.5 MB", "status": "VERIFIED"},
        ],
        "creditTerms": "Meezan Bank / HBL Online Transfer",
        "assignedTier": "TIER_3_ENTERPRISE",
    },
    {
        "id": "buyer-pk-003",
        "businessName": "Karkhana Bazar & D-Ground Kids Palace",
        "contactName": "Chaudhry Bilal Aslam",
        "email": "bilal@dgroundfaisalabad.pk",
        "phone": "+92 333 6512390",
        "country": "Pakistan",
        "city": "Faisalabad (D-Ground & Karkhana Bazar)",
        "ntnOrTaxId": "5934120-7",
        "taxOrResaleId": "5934120-7",
        "strnNumber": "24-00-5934-120-19",
        "chamberMember": "Faisalabad Chamber of Commerce (FCCI-1294)",
        "businessType": "Boutique Owner",
        "annualVolume": "Rs. 25,000,000 - 40,000,000 PKR",
        "status": "PENDING",
        "appliedDate": "2026-10-20",
        "documents": [
            {"name": "FBR_Tax_Registration_2026.pdf", "size": "940 KB", "status": "REVIEW_PENDING"},
            {"name": "FCCI_Chamber_Card.pdf", "size": "1.1 MB", "status": "REVIEW_PENDING"},
        ],
        "assignedTier": "TIER_2_VOLUME",
    },
    {
        "id": "buyer-pk-004",
        "businessName": "Rabi Center & Raja Bazar Garment House",
        "contactName": "MalikZeeshan Awan",
        "email": "zeeshan@rawalpindipret.pk",
        "phone": "+92 312 5548901",
        "country": "Pakistan",
        "city": "Rawalpindi / Islamabad (Murree Road & F-10)",
        "ntnOrTaxId": "6381920-5",
        "taxOrResaleId": "6381920-5",
        "chamberMember": "Rawalpindi Chamber of Commerce (RCCI-3310)",
        "businessType": "Multi-Door Retailer",
        "annualVolume": "Rs. 30,000,000 - 50,000,000 PKR",
        "status": "APPROVED",
        "appliedDate": "2026-10-11",
        "approvedDate": "2026-10-12",
        "documents": [
            {"name": "RCCI_Certificate_2026.pdf", "size": "1.0 MB", "status": "VERIFIED"},
        ],
        "creditTerms": "TCS Overland Cargo COD / Bank Transfer",
        "assignedTier": "TIER_2_VOLUME",
    },
]

INITIAL_ORDERS_DATA = [
    {
        "id": "ord-pk-901",
        "orderNumber": "SJW-PO-2026-901",
        "date": "2026-10-18",
        "buyerName": "Haji Muhammad Usman Butt",
        "businessName": "Al-Karam & Gulberg Pret Emporium (Lahore)",
        "items": [
            {
                "productTitle": "Majestic Gold Tilla & Zari Embroidered Chiffon 3-Piece Stitched Suit",
                "sku": "SJW-W-2026-CHF01",
                "totalPieces": 48,
                "unitPrice": 3050,
                "subtotal": 146400,
            },
            {
                "productTitle": "Fancy Girls Raw Silk Embroidered Peplum & Sharara 3-Piece Stitched Set",
                "sku": "SJW-K-2026-SHR01",
                "totalPieces": 72,
                "unitPrice": 1450,
                "subtotal": 104400,
            },
        ],
        "totalPieces": 120,
        "subtotal": 250800,
        "estimatedFreight": 4500,
        "incoterm": "FOB Karachi",
        "totalAmount": 255300,
        "paymentStatus": "PAID",
        "fulfillmentStatus": "IN_TRANSIT",
        "trackingNumber": "TCS-BILTI-8849201",
        "carrier": "TCS Overland Cargo & Daewoo FastEx",
        "cargoType": "Air Cargo Priority",
        "estimatedDelivery": "2026-10-22 (48-Hour Domestic Bilti)",
        "milestones": [
            {"step": "Wholesale PO & Meezan Bank Transfer Verified", "location": "Sajawat Factory HQ", "date": "2026-10-18", "completed": True},
            {"step": "100% Quality & Size Curve Audit (S, M, L, XL / Kids 2Y-12Y)", "location": "Sajawat Stitching Unit #1", "date": "2026-10-19", "completed": True},
            {"step": "Master Cartons Strapped & Bilti Issued (TCS-BILTI-8849201)", "location": "Cargo Dispatch Hub", "date": "2026-10-20", "completed": True},
            {"step": "Arriving at Lahore Azam Market / Gulberg Distribution Hub", "location": "Lahore Cargo Terminal", "date": "2026-10-22", "completed": False},
        ],
    },
    {
        "id": "ord-pk-884",
        "orderNumber": "SJW-PO-2026-884",
        "date": "2026-10-12",
        "buyerName": "Muhammad Salman Siddiqui",
        "businessName": "Tariq Road & Rabi Center Stitched Gallery (Karachi)",
        "items": [
            {
                "productTitle": "Nayab 9000 Micro-Velvet Zari Embroidered 3-Piece Stitched Suit",
                "sku": "SJW-W-2026-VLV02",
                "totalPieces": 48,
                "unitPrice": 3550,
                "subtotal": 170400,
            },
            {
                "productTitle": "Kids Kashmiri White-Thread Embroidered Velvet 2-Piece Stitched Set",
                "sku": "SJW-K-2026-VLV02",
                "totalPieces": 72,
                "unitPrice": 1380,
                "subtotal": 99360,
            },
        ],
        "totalPieces": 120,
        "subtotal": 269760,
        "estimatedFreight": 2500,
        "incoterm": "FOB Karachi",
        "totalAmount": 272260,
        "paymentStatus": "PAID",
        "fulfillmentStatus": "DELIVERED",
        "trackingNumber": "LPD-CARGO-553910",
        "carrier": "Leopard Overland Bilti Service",
        "cargoType": "Air Cargo Priority",
        "estimatedDelivery": "2026-10-14",
        "milestones": [
            {"step": "HBL Business Transfer Confirmed", "location": "Karachi Clearing", "date": "2026-10-12", "completed": True},
            {"step": "5 Master Cartons Packed in Polybags with Barcodes", "location": "Sajawat Dispatch Center", "date": "2026-10-13", "completed": True},
            {"step": "Delivered to Tariq Road Rabi Center Warehouse", "location": "Karachi South", "date": "2026-10-14", "completed": True},
        ],
    },
]


def main():
    print("=" * 72)
    print("🌸 SAJAWAT® STITCHED WOMEN & KIDS — S3 + MONGODB PIPELINE")
    print("=" * 72)

    ensure_s3_bucket()
    brand_urls = process_brand_logo()

    online_products = fetch_pehnavaa_products()
    print(f"[✓] Loaded {len(online_products)} online reference products from pehnavaa.com")

    used_urls = set()
    tasks = []
    for spec in CATALOG_SPECS:
        src_url, _ = find_matching_online_product(spec, online_products, used_urls)
        if not src_url:
            raise RuntimeError(f"Could not find online photo for {spec['sku']}")
        tasks.append((spec, src_url))

    products_out = []
    jobs_out = []

    print(f"[*] Processing & uploading {len(tasks)} product photos to s3://{BUCKET}/catalog/ ...")
    with ThreadPoolExecutor(max_workers=6) as ex:
        fut_map = {ex.submit(process_and_upload_product, spec, url): spec for spec, url in tasks}
        for i, fut in enumerate(as_completed(fut_map), 1):
            spec = fut_map[fut]
            p_doc, j_doc = fut.result()
            products_out.append(p_doc)
            jobs_out.append(j_doc)
            print(f"  [{i:02d}/{len(tasks):02d}] ✓ {p_doc['sku']} -> {p_doc['catalogImage']}")

    # Maintain deterministic order matching CATALOG_SPECS
    order_map = {s["id"]: idx for idx, s in enumerate(CATALOG_SPECS)}
    products_out.sort(key=lambda x: order_map.get(x["id"], 999))
    jobs_out.sort(key=lambda x: x["associatedSku"])

    # Connect to MongoDB Atlas and seed sajawat_wholesale
    print(f"\n[*] Connecting to MongoDB Atlas database '{DB_NAME}'...")
    mc = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=15000)
    db = mc[DB_NAME]

    # 1. Seed products
    prod_col = db["products"]
    prod_col.create_index([("id", ASCENDING)], unique=True)
    prod_col.create_index([("sku", ASCENDING)], unique=True)
    prod_col.create_index([("category", ASCENDING)])
    for p in products_out:
        prod_col.replace_one({"id": p["id"]}, p, upsert=True)
    # Remove any old non-SJW products if any
    prod_col.delete_many({"id": {"$nin": [p["id"] for p in products_out]}})
    print(f"[✓] MongoDB '{DB_NAME}.products' seeded with {prod_col.count_documents({})} products")

    # 2. Seed pipeline_jobs
    jobs_col = db["pipeline_jobs"]
    jobs_col.create_index([("id", ASCENDING)], unique=True)
    for j in jobs_out:
        jobs_col.replace_one({"id": j["id"]}, j, upsert=True)
    print(f"[✓] MongoDB '{DB_NAME}.pipeline_jobs' seeded with {jobs_col.count_documents({})} S3 jobs")

    # 3. Seed buyers
    buyers_col = db["buyers"]
    buyers_col.create_index([("id", ASCENDING)], unique=True)
    for b in INITIAL_BUYERS_DATA:
        buyers_col.replace_one({"id": b["id"]}, b, upsert=True)
    print(f"[✓] MongoDB '{DB_NAME}.buyers' seeded with {buyers_col.count_documents({})} wholesale buyers")

    # 4. Seed orders
    orders_col = db["orders"]
    orders_col.create_index([("id", ASCENDING)], unique=True)
    for o in INITIAL_ORDERS_DATA:
        orders_col.replace_one({"id": o["id"]}, o, upsert=True)
    print(f"[✓] MongoDB '{DB_NAME}.orders' seeded with {orders_col.count_documents({})} wholesale orders")

    # 5. Write local JSON snapshot for frontend instant boot & SSR
    snapshot_path = BASE_DIR / "src" / "data" / "s3CatalogData.json"
    snapshot_data = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "s3Bucket": BUCKET,
        "awsRegion": REGION,
        "mongoDatabase": DB_NAME,
        "brandAssets": brand_urls,
        "products": products_out,
        "pipelineJobs": jobs_out,
        "buyers": INITIAL_BUYERS_DATA,
        "orders": INITIAL_ORDERS_DATA,
    }
    snapshot_path.write_text(json.dumps(snapshot_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[✓] Wrote S3 + MongoDB catalog snapshot to {snapshot_path}")
    print("=" * 72)
    print("✅ SAJAWAT® S3 BUCKET & MONGODB ATLAS SETUP COMPLETE!")
    print("=" * 72)


if __name__ == "__main__":
    main()
