# Doc2Save - Complete Project Breakdown

> **PWA Document Storage Service for Real Estate Agents (India)**
> Last Updated: March 2026 | All prices in INR unless stated otherwise

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Recommended Tech Stack](#2-recommended-tech-stack)
3. [Infrastructure Cost Breakdown](#3-infrastructure-cost-breakdown)
4. [SMS OTP & KYC Verification Costs](#4-sms-otp--kyc-verification-costs)
5. [Payment Gateway (Razorpay) Costs](#5-payment-gateway-razorpay-costs)
6. [Cloud Storage Costs](#6-cloud-storage-costs)
7. [Hosting & Compute Costs](#7-hosting--compute-costs)
8. [Database Costs](#8-database-costs)
9. [Domain, SSL & CDN Costs](#9-domain-ssl--cdn-costs)
10. [Total Monthly Infrastructure Cost (All Scales)](#10-total-monthly-infrastructure-cost-all-scales)
11. [Client's Ongoing Maintenance Costs](#11-clients-ongoing-maintenance-costs)
12. [How Much to Charge for Building This](#12-how-much-to-charge-for-building-this)
13. [Suggested Subscription Pricing for End Users](#13-suggested-subscription-pricing-for-end-users)
14. [Summary & Recommendations](#14-summary--recommendations)

---

## 1. Project Overview

### What We're Building
A **Progressive Web App (PWA)** that works as a mobile website users can install on their home screen. The app provides **cloud document storage as a service** targeted at **real estate agents** in India.

### Core Features
- Mobile-first PWA with "Add to Home Screen" capability
- Phone number (mobile) OTP-based login
- KYC verification during signup (PAN card + Aadhaar card)
- Document upload & storage (images, PDFs, DOCX, videos)
- Folder & subfolder management
- File retrieval & download
- Razorpay payment gateway integration
- Monthly/yearly subscription plans with autopay (UPI AutoPay / Card recurring)
- User dashboard (storage usage, subscription status, recent files)
- Admin panel (user management, subscription tracking, revenue analytics)

### Target Audience
Real estate agents who currently spend Rs 500-1,000 per document retrieval. We're offering unlimited document storage & retrieval at a flat subscription fee.

---

## 2. Recommended Tech Stack

### Frontend (PWA)
| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR, PWA support, great DX, massive ecosystem |
| UI Library | **Tailwind CSS + shadcn/ui** | Fast development, consistent design, mobile-first |
| State Management | **Zustand** or React Context | Lightweight, sufficient for this scope |
| PWA | **next-pwa** or **Serwist** | Service worker, offline support, installability |
| File Upload | **react-dropzone** + presigned URLs | Drag-and-drop, progress tracking |
| Language | **TypeScript** | Type safety, fewer runtime bugs |

### Backend
| Layer | Technology | Why |
|---|---|---|
| Runtime | **Node.js with Next.js API Routes** or **Express.js** | Same language as frontend, fast development |
| Authentication | **Custom OTP auth** (MSG91/Firebase) | Mobile-first, India-specific |
| File Storage | **Cloudflare R2** (primary) or **AWS S3** | Zero egress fees (R2) = massive savings |
| Database | **PostgreSQL via Supabase** | Relational data, great free tier, built-in auth helpers |
| ORM | **Prisma** or **Drizzle ORM** | Type-safe database queries |
| Payments | **Razorpay SDK** | India's #1 payment gateway, subscription support |
| KYC | **Surepass** or **Sandbox.co.in** | Affordable PAN + Aadhaar verification APIs |
| SMS OTP | **MSG91** or **Firebase Auth** | Cheapest SMS in India / free tier with Firebase |

### Infrastructure
| Layer | Technology | Why |
|---|---|---|
| Hosting | **Vercel** (frontend) + **Railway/DigitalOcean** (backend) | Auto-scaling, Mumbai region available |
| CDN | **Cloudflare** (free plan) | Global CDN, DDoS protection, SSL |
| DNS | **Cloudflare DNS** | Fastest DNS, free |
| Monitoring | **Sentry** (free tier) + **Better Uptime** | Error tracking, uptime monitoring |
| CI/CD | **GitHub Actions** | Free for public repos, cheap for private |

### Why This Stack?
1. **Cost-effective** - Minimal monthly infra costs, generous free tiers
2. **India-optimized** - Mumbai/Bangalore data centers, Razorpay, Indian SMS providers
3. **Fast to build** - Next.js + Supabase + Prisma = rapid development
4. **Scalable** - Can handle 100 to 10,000+ users without re-architecting
5. **PWA-ready** - Next.js has excellent PWA support out of the box

---

## 3. Infrastructure Cost Breakdown

> **Exchange Rate Used**: 1 USD = ~83-85 INR

### Quick Summary Table

| Component | Monthly Cost (100 users) | Monthly Cost (500 users) | Monthly Cost (1000 users) |
|---|---|---|---|
| Hosting (Frontend) | Rs 1,670 | Rs 1,670 | Rs 1,670 |
| Hosting (Backend) | Rs 420-670 | Rs 1,000-1,670 | Rs 1,250-2,000 |
| Database | Rs 0 (free tier) | Rs 2,085 | Rs 2,085-4,750 |
| Cloud Storage | Rs 0-1,245 | Rs 2,000-6,225 | Rs 5,000-12,450 |
| SMS OTP | Rs 500-1,000 | Rs 2,000-5,000 | Rs 4,000-10,000 |
| KYC Verification | Rs 300-500 | Rs 500-1,500 | Rs 1,000-3,000 |
| CDN + DNS + SSL | Rs 0 | Rs 0 | Rs 0 |
| Domain | Rs 75 | Rs 75 | Rs 75 |
| Monitoring | Rs 0 | Rs 0 | Rs 0-835 |
| **TOTAL** | **Rs 2,965 - 5,160/mo** | **Rs 9,330 - 18,225/mo** | **Rs 15,080 - 34,780/mo** |

---

## 4. SMS OTP & KYC Verification Costs

### SMS OTP Providers (Per SMS, Transactional Route)

| Provider | Per SMS Cost | Best For | Free Tier |
|---|---|---|---|
| **MSG91** | Rs 0.16 - 0.22 | Budget + scale | 100-500 test SMS |
| **2Factor.in** | Rs 0.18 - 0.22 | Simple REST API | 25-100 free OTP |
| **Textlocal** | Rs 0.20 - 0.25 | Dashboard & analytics | 10 free SMS |
| **Firebase Auth** | FREE (up to 10K/mo) | MVP stage | 10,000 verifications/month |
| **Twilio** | Rs 3.50 - 4.20 | Global apps (avoid for India-only) | ~$15 trial credit |
| **Exotel** | Rs 0.20 - 0.25 | Voice + SMS combo | Limited trial |

**Recommendation**: Start with **Firebase Auth** (free up to 10K/mo) for MVP. Switch to **MSG91** when scaling beyond 10K signups/month.

### Monthly SMS Cost Estimates

| Monthly Active Signups | Firebase Auth | MSG91 (Rs 0.18/SMS) | Twilio (Rs 3.50/SMS) |
|---|---|---|---|
| 500 | FREE | Rs 90 | Rs 1,750 |
| 2,000 | FREE | Rs 360 | Rs 7,000 |
| 10,000 | FREE | Rs 1,800 | Rs 35,000 |
| 15,000 | Rs 850 (5K paid) | Rs 2,700 | Rs 52,500 |

> Note: Re-login OTPs add to this. Assume ~2-3 OTPs per user per month for active users.

### KYC Verification API Costs (Per Verification)

| Provider | PAN Verification | Aadhaar OTP eKYC | Free Tier | Best For |
|---|---|---|---|---|
| **Surepass** | Rs 1.00 - 2.00 | Rs 2.00 - 3.00 | 25-100 free calls | Best value, great docs |
| **Sandbox.co.in** | Rs 1.00 - 2.00 | Rs 2.00 - 3.00 | Free sandbox | Clean APIs |
| **Deepvue.tech** | Rs 1.00 - 2.00 | Rs 2.00 - 3.00 | Good free tier | Developer-friendly |
| **Gridlines.io** | Rs 1.50 - 2.00 | Rs 2.50 - 4.00 | Sandbox credits | 300+ data sources |
| **Digio** | Rs 1.50 - 2.50 | Rs 3.00 - 5.00 | Sandbox only | eSign + eKYC combo |
| **IDfy** | Rs 1.50 - 3.00 | Rs 3.00 - 5.00 | Sandbox only | Background checks |
| **Signzy** | Rs 2.00 - 4.00 | Rs 3.00 - 6.00 | Sandbox only | Enterprise, Video KYC |

**Recommendation**: **Surepass** - Best pricing, great developer experience, covers both PAN and Aadhaar in a single integration.

### Per-User Signup KYC Cost

| Component | Budget (Surepass) | Mid-Range (Gridlines) | Premium (Signzy) |
|---|---|---|---|
| SMS OTP | Rs 0.18 (MSG91) | Rs 0.20 (2Factor) | Rs 3.50 (Twilio) |
| PAN Verification | Rs 1.00 | Rs 1.50 | Rs 3.00 |
| Aadhaar OTP eKYC | Rs 2.00 | Rs 3.00 | Rs 5.00 |
| **Total per signup** | **Rs 3.18** | **Rs 4.70** | **Rs 11.50** |

### Monthly KYC Cost by User Volume

| New Signups/Month | Budget Stack | Mid-Range Stack |
|---|---|---|
| 100 | Rs 318 | Rs 470 |
| 500 | Rs 1,590 | Rs 2,350 |
| 1,000 | Rs 3,180 | Rs 4,700 |
| 5,000 | Rs 15,900 | Rs 23,500 |

### Compliance Notes
- **DLT Registration** is mandatory for sending SMS in India (providers handle this)
- **UIDAI Licensing**: Your Aadhaar eKYC provider must be a licensed ASA/KUA
- **Aadhaar Data Storage**: You CANNOT store Aadhaar numbers. Only reference tokens and masked numbers are permitted under the Aadhaar Act
- **Data Encryption**: All KYC data must be encrypted at rest and in transit

---

## 5. Payment Gateway (Razorpay) Costs

### Transaction Fees

| Payment Method | Fee (% of transaction) | Effective Fee (with 18% GST on fee) |
|---|---|---|
| Domestic Cards (Visa/MC/RuPay) | 2.00% | ~2.36% |
| UPI | 2.00% | ~2.36% |
| Net Banking | 2.00% | ~2.36% |
| Wallets | 2.00% | ~2.36% |
| International Cards | 3.00% | ~3.54% |
| EMI Payments | 2.50 - 3.00% | ~2.95 - 3.54% |

### Subscription / Recurring Payment Fees

| Feature | Cost |
|---|---|
| Razorpay Subscriptions product | **FREE** (no extra charge) |
| Per recurring charge | Standard 2% TDR |
| UPI AutoPay mandate registration | **FREE** |
| Card recurring mandate registration | **FREE** |
| Plan creation & management | **FREE** |
| Invoice generation | Included |
| Setup fee | **NONE** |
| Monthly fee | **NONE** |

### Auto-Debit / Mandate Types

| Type | Best For | Extra Charges |
|---|---|---|
| **UPI AutoPay** | Cheapest, most common in India | Standard 2% TDR only |
| **Card Recurring (e-mandate)** | Users who prefer cards | Standard 2% TDR only |
| **NACH / e-NACH** | Bank debit mandates | Rs 5-25 per transaction |

> **Note**: RBI rules require Additional Factor Authentication (AFA) for recurring charges > Rs 15,000. Since subscription fees will likely be under Rs 15,000, UPI AutoPay works perfectly.

### Razorpay Revenue Impact Example

If you charge **Rs 299/month** subscription:

| Users | Monthly Revenue | Razorpay Fee (2.36%) | Net Revenue |
|---|---|---|---|
| 100 | Rs 29,900 | Rs 706 | Rs 29,194 |
| 500 | Rs 1,49,500 | Rs 3,528 | Rs 1,45,972 |
| 1,000 | Rs 2,99,000 | Rs 7,056 | Rs 2,91,944 |

---

## 6. Cloud Storage Costs

### Provider Comparison

| Provider | Storage/GB/mo | Egress/GB | Free Tier | India Region |
|---|---|---|---|---|
| **Cloudflare R2** | Rs 1.25 | **FREE** | 10 GB forever | Auto (edge) |
| **AWS S3 (Mumbai)** | Rs 1.91 | Rs 9.07 | 5 GB (12 mo) | Mumbai |
| **Google Cloud Storage** | Rs 1.91 | Rs 9.96 | 5 GB (US only) | Mumbai |
| **DigitalOcean Spaces** | Rs 1.66* | Rs 0.83* | None ($5/mo min) | Bangalore |
| **Backblaze B2** | Rs 0.50 | Rs 0.83 | 10 GB forever | No India |

*DigitalOcean: $5/mo flat includes 250 GB storage + 1 TB transfer

**Winner: Cloudflare R2** - Zero egress fees is a game-changer for a document download service.

### Storage Estimates Per User (Real Estate Document Management)

| Document Type | Avg Size | Typical Count/User/Month |
|---|---|---|
| PDF documents | 2-5 MB (avg ~3 MB) | 20-50 files |
| Images (scans, photos) | 1-5 MB (avg ~2.5 MB) | 30-80 files |
| DOCX/Office files | 0.5-3 MB (avg ~1.5 MB) | 10-30 files |
| Videos (short clips) | 50-200 MB (avg ~100 MB) | 1-3 files |

| Usage Level | Monthly Upload/User | After 12 Months/User |
|---|---|---|
| Light (basic docs, minimal video) | ~380 MB/month | ~4.5 GB |
| Medium (active management) | ~860 MB/month | ~10 GB |
| Heavy (frequent video uploads) | ~1.8 GB/month | ~22 GB |

### Total Storage Cost Projections (Medium Usage, After 12 Months)

| Users | Total Storage | Cloudflare R2/mo | AWS S3/mo (storage only) | AWS S3/mo (with 20% egress) |
|---|---|---|---|---|
| 100 | ~1 TB | **Rs 1,245** | Rs 1,910 | Rs 3,724 |
| 500 | ~5 TB | **Rs 6,225** | Rs 9,545 | Rs 18,617 |
| 1,000 | ~10 TB | **Rs 12,450** | Rs 19,090 | Rs 35,358 |

> **With Cloudflare R2, you save Rs 1,500-23,000/month** compared to AWS S3 at scale because egress is FREE.

---

## 7. Hosting & Compute Costs

### Frontend Hosting (Next.js PWA)

| Provider | Plan | Price/mo | Bandwidth | Best For |
|---|---|---|---|---|
| **Vercel** (Recommended) | Pro | Rs 1,670 ($20) | 1 TB | Easiest for Next.js |
| **Vercel** | Hobby (Free) | Rs 0 | 100 GB | MVP/testing only |
| **Cloudflare Pages** | Free | Rs 0 | Unlimited | Alternative if budget-tight |

### Backend Hosting

| Provider | Plan | Specs | Price/mo |
|---|---|---|---|
| **Railway** | Hobby | $5 credit included | Rs 420 ($5) |
| **Railway** | Pro | $20 credit included | Rs 1,670 ($20) |
| **DigitalOcean** | Basic Droplet | 1 vCPU, 1GB RAM | Rs 500 ($6) |
| **DigitalOcean** | Basic Droplet | 2 vCPU, 2GB RAM | Rs 1,500 ($18) |
| **DigitalOcean** | Basic Droplet | 2 vCPU, 4GB RAM | Rs 2,000 ($24) |
| **AWS EC2** | t3.micro | 2 vCPU, 1GB RAM | Rs 625 ($7.50) |
| **AWS EC2** | t3.small | 2 vCPU, 2GB RAM | Rs 1,250 ($15) |
| **Hetzner** | CX22 | 2 vCPU, 4GB RAM | Rs 300 (EUR 3.29) |
| **Render** | Starter | 0.5 CPU, 512MB | Rs 585 ($7) |

**Recommendation**:
- **MVP/Early stage**: Vercel (frontend) + Railway Hobby (backend) = **Rs 2,090/mo**
- **Growing (500+ users)**: Vercel Pro + DigitalOcean 2GB Droplet = **Rs 2,670-3,170/mo**
- **Budget option**: DigitalOcean 2GB Droplet for everything = **Rs 1,500/mo**

---

## 8. Database Costs

### Provider Comparison

| Provider | Free Tier | Paid Tier | India Region | Best For |
|---|---|---|---|---|
| **Supabase** | 500MB DB, 1GB storage, 50K MAU | Rs 2,085/mo (Pro: 8GB DB) | No (US/EU) | Full backend (auth+DB+storage) |
| **MongoDB Atlas** | 512MB (M0 free) | Rs 4,750/mo (M10: 10GB) | Mumbai | NoSQL, flexible schema |
| **PlanetScale** | None (discontinued) | Rs 3,250/mo (Scaler: 10GB) | No India | MySQL branching |
| **PostgreSQL on VPS** | N/A | Rs 500-1,000/mo (self-managed) | Mumbai (DO/AWS) | Maximum control, cheapest |
| **Railway Postgres** | Included in plan | Usage-based (~Rs 420-585/mo) | N/A | Simplest setup |

**Recommendation**:
- **MVP**: Supabase Free (500MB) or MongoDB Atlas M0 (512MB) - **Rs 0/mo**
- **Production (500+ users)**: Supabase Pro - **Rs 2,085/mo** (includes Postgres + Auth + Storage + Edge Functions)
- **Budget production**: Self-managed PostgreSQL on DigitalOcean - **Rs 500-1,000/mo**

---

## 9. Domain, SSL & CDN Costs

### Domain Pricing

| Domain | Registrar | 1st Year | Renewal/Year |
|---|---|---|---|
| **.in** | GoDaddy India | Rs 399-599 | Rs 899-1,199 |
| **.in** | BigRock | Rs 399 | Rs 799-999 |
| **.in** | Namecheap | Rs 250-335 | Rs 585-670 |
| **.com** | Cloudflare Registrar | Rs 763 | Rs 763 (at-cost, no markup) |
| **.com** | GoDaddy | Rs 199-499 (promo) | Rs 1,199-1,399 |
| **.com** | Namecheap | Rs 670-750 | Rs 1,085-1,170 |

**Recommendation**: Get a **.in** domain from Namecheap + a **.com** from Cloudflare Registrar
- Annual cost: ~Rs 585 (.in) + Rs 763 (.com) = **~Rs 1,350/year (~Rs 113/month)**

### SSL Certificate

| Option | Cost |
|---|---|
| **Let's Encrypt** | FREE (auto-renewable) |
| **Cloudflare Universal SSL** | FREE |
| **Vercel / Railway / Render** | FREE (auto-provisioned) |
| Paid DV SSL (Comodo/Sectigo) | Rs 500-2,000/yr (unnecessary) |

**Cost: Rs 0/month** - No reason to pay for SSL in 2025-2026.

### CDN (Cloudflare Free Plan)

| Feature | Included |
|---|---|
| Global CDN | Unlimited bandwidth |
| DNS Hosting | Unlimited zones, anycast |
| DDoS Protection | Unmetered L3/L4 mitigation |
| Universal SSL/TLS | Auto-provisioned |
| Basic WAF | 5 custom rules |
| Bot Protection | Basic bot fight mode |
| Analytics | Basic web analytics |
| Workers | 100K requests/day free |
| R2 Storage | 10 GB free |

**Cost: Rs 0/month** - Cloudflare's free plan is incredibly generous.

---

## 10. Total Monthly Infrastructure Cost (All Scales)

### Scenario A: 100 Users (MVP/Early Stage)

| Component | Service | Monthly Cost (INR) |
|---|---|---|
| Frontend Hosting | Vercel Pro | Rs 1,670 |
| Backend Hosting | Railway Hobby | Rs 420 |
| Database | Supabase Free | Rs 0 |
| Cloud Storage (R2) | Cloudflare R2 (~100GB) | Rs 0 (within free tier) |
| SMS OTP | Firebase Auth (free) | Rs 0 |
| KYC (new signups ~50/mo) | Surepass | Rs 150 |
| CDN + DNS + SSL | Cloudflare Free | Rs 0 |
| Domain | .in + .com | Rs 113 |
| Monitoring | Sentry Free + Better Uptime | Rs 0 |
| **TOTAL** | | **Rs 2,353/month** |

### Scenario B: 500 Users (Growing)

| Component | Service | Monthly Cost (INR) |
|---|---|---|
| Frontend Hosting | Vercel Pro | Rs 1,670 |
| Backend Hosting | DigitalOcean 2GB Droplet | Rs 1,000 |
| Database | Supabase Pro | Rs 2,085 |
| Cloud Storage (R2) | Cloudflare R2 (~2 TB) | Rs 2,500 |
| SMS OTP (logins + signups) | MSG91 (~5K SMS/mo) | Rs 900 |
| KYC (new signups ~100/mo) | Surepass | Rs 320 |
| CDN + DNS + SSL | Cloudflare Free | Rs 0 |
| Domain | .in + .com | Rs 113 |
| Monitoring | Sentry Free | Rs 0 |
| Email (transactional) | Resend Free | Rs 0 |
| **TOTAL** | | **Rs 8,588/month** |

### Scenario C: 1,000 Users (Scaling)

| Component | Service | Monthly Cost (INR) |
|---|---|---|
| Frontend Hosting | Vercel Pro | Rs 1,670 |
| Backend Hosting | DigitalOcean 4GB Droplet | Rs 2,000 |
| Database | Supabase Pro | Rs 2,085 |
| Cloud Storage (R2) | Cloudflare R2 (~5 TB) | Rs 6,225 |
| Redis (caching) | Upstash Free Tier | Rs 0 |
| SMS OTP (logins + signups) | MSG91 (~10K SMS/mo) | Rs 1,800 |
| KYC (new signups ~200/mo) | Surepass | Rs 640 |
| CDN + DNS + SSL | Cloudflare Free | Rs 0 |
| Domain | .in + .com | Rs 113 |
| Monitoring | Sentry Free | Rs 0 |
| Email (transactional) | Resend / SES | Rs 0-500 |
| **TOTAL** | | **Rs 14,533 - 15,033/month** |

### Cost Growth Trajectory

```
Users:     100        500        1,000       5,000
Cost/mo:   Rs 2,353   Rs 8,588   Rs 15,033   Rs ~55,000-70,000
Per user:  Rs 23.5    Rs 17.2    Rs 15.0     Rs ~11-14
```

> Storage costs grow linearly with users. Other costs (hosting, database) grow in steps.

---

## 11. Client's Ongoing Maintenance Costs

### Monthly Recurring Costs Summary

| Category | Startup (100 users) | Growth (500 users) | Scale (1000 users) |
|---|---|---|---|
| **Infrastructure** | Rs 2,353 | Rs 8,588 | Rs 15,033 |
| **Razorpay Fees** (2.36% of revenue) | Rs 706* | Rs 3,528* | Rs 7,056* |
| **Developer Maintenance** (part-time) | Rs 10,000-15,000 | Rs 15,000-25,000 | Rs 25,000-40,000 |
| **Bug fixes / updates** | Included above | Included above | Included above |
| **Security patches** | Included above | Included above | Included above |
| **Total Monthly Cost** | **Rs 13,059-18,059** | **Rs 27,116-37,116** | **Rs 47,089-62,089** |

*Assuming Rs 299/month subscription per user

### Annual Fixed Costs

| Item | Annual Cost (INR) |
|---|---|
| Domain renewal (.in + .com) | Rs 1,350 |
| SSL Certificate | Rs 0 (Let's Encrypt) |
| Code repository (GitHub) | Rs 0 (free for private repos) |
| Monitoring tools | Rs 0 (free tiers) |
| **Total Annual Fixed** | **Rs 1,350/year** |

### Developer Maintenance (Retainer)

| Level | Monthly Retainer | Hours/Month | What's Covered |
|---|---|---|---|
| Basic | Rs 10,000 - 15,000 | 8-12 hrs | Bug fixes, minor updates, server monitoring |
| Standard | Rs 15,000 - 25,000 | 15-25 hrs | Bug fixes, feature updates, performance optimization |
| Comprehensive | Rs 25,000 - 40,000 | 25-40 hrs | All above + new features, scaling, security audits |

**Recommendation**: Offer a **Rs 15,000/month maintenance retainer** to the client. This is an additional income stream for you.

---

## 12. How Much to Charge for Building This

### Feature-wise Development Effort

| Feature | Estimated Hours | Notes |
|---|---|---|
| Project setup & architecture | 20-30 hrs | Repo, CI/CD, DB schema, project structure |
| Mobile-first PWA (service worker, manifest, responsive) | 25-35 hrs | Installability, offline support |
| Phone number OTP authentication | 20-30 hrs | MSG91/Firebase integration, session management |
| Aadhaar KYC verification | 30-45 hrs | API integration, compliance, error handling |
| PAN KYC verification | 15-25 hrs | API integration, validation |
| Document upload (PDF, images, DOCX, video) | 35-50 hrs | Multi-format, preview, compression, cloud storage |
| Folder & subfolder management | 20-30 hrs | Nested CRUD, breadcrumbs, search |
| Cloud storage integration | 15-25 hrs | R2/S3 setup, presigned URLs, quota management |
| Razorpay payment gateway | 25-35 hrs | Checkout flow, webhook handling, retry logic |
| Subscription management (autopay) | 20-30 hrs | Plan switching, cancellation, renewals, invoices |
| User dashboard | 30-40 hrs | Stats, recent activity, storage usage |
| Admin panel | 40-55 hrs | User mgmt, KYC approval, revenue analytics |
| Testing & QA | 30-40 hrs | Unit, integration, E2E, cross-browser |
| Deployment & DevOps | 15-20 hrs | Server setup, Docker, SSL, monitoring |
| Bug fixes & polish | 20-30 hrs | UI refinements, edge cases, performance |
| **TOTAL** | **360-520 hrs** | **Realistic: ~450 hours** |

### Freelancer Pricing (Indian Market, 2025-2026)

| Level | Hourly Rate | Total Project Cost |
|---|---|---|
| Junior Developer (0-2 yrs) | Rs 500-800/hr | Rs 2,50,000 - 4,00,000 |
| Mid-Level Developer (2-5 yrs) | Rs 1,200-2,000/hr | Rs 5,00,000 - 10,00,000 |
| Senior Developer (5-8 yrs) | Rs 2,500-4,000/hr | Rs 8,75,000 - 18,00,000 |
| Expert/Specialist (8+ yrs) | Rs 4,000-6,000/hr | Rs 14,00,000 - 24,00,000 |

### Agency Pricing (for comparison)

| Agency Tier | Project Cost | Timeline |
|---|---|---|
| Small boutique (5-15 people) | Rs 5,00,000 - 12,00,000 | 3-5 months |
| Mid-tier agency (15-50 people) | Rs 10,00,000 - 25,00,000 | 3-6 months |
| Premium agency (50+ people) | Rs 20,00,000 - 50,00,000+ | 4-8 months |

### What YOU Should Charge

| Strategy | Amount (INR) | When to Use |
|---|---|---|
| **Floor (never go below this)** | Rs 4,00,000 - 5,00,000 | Only if client is a close referral and budget is very tight |
| **Fair market rate** | Rs 6,00,000 - 10,00,000 | Standard for a capable freelancer |
| **Recommended (sweet spot)** | **Rs 8,00,000 - 12,00,000** | Best balance of fair pay + competitive against agencies |
| **Premium** | Rs 14,00,000 - 20,00,000 | If you have proven portfolio of similar SaaS products |

### Why Rs 8,00,000 - 12,00,000 is the Sweet Spot

1. **~450 hours of skilled work** at Rs 1,800-2,700/hr is fair for mid-senior level
2. **KYC integration is complex** - Aadhaar/PAN compliance requirements justify premium
3. **Payment gateway with subscriptions** - Razorpay recurring + autopay is non-trivial
4. **You're cheaper than agencies** - Agencies charge Rs 10-25L for the same work
5. **The client saves money** - Compared to their real estate agents spending Rs 500-1000/doc

### Recommended Payment Milestones

| Milestone | % of Total | Trigger | Amount (at Rs 10L total) |
|---|---|---|---|
| Project kickoff / advance | 20% | Contract signing | Rs 2,00,000 |
| Auth + KYC complete | 25% | Working demo of OTP + KYC | Rs 2,50,000 |
| Document management + storage | 20% | Working upload/folder system | Rs 2,00,000 |
| Payments + dashboard + admin | 20% | Full feature demo | Rs 2,00,000 |
| Final delivery + deployment | 15% | Production deployment | Rs 1,50,000 |
| **Total** | **100%** | | **Rs 10,00,000** |

### Additional Revenue Opportunities

| Service | Pricing | Notes |
|---|---|---|
| Monthly maintenance retainer | Rs 15,000 - 25,000/mo | Bug fixes, updates, monitoring |
| New feature development | Rs 1,500 - 2,500/hr | Post-launch feature requests |
| Annual maintenance contract (AMC) | Rs 1,50,000 - 3,00,000/yr | Comprehensive annual support |
| White-label for other agents | Rs 2,00,000 - 5,00,000 | Resell to other real estate firms |

---

## 13. Suggested Subscription Pricing for End Users

### Pricing Strategy

Real estate agents currently spend **Rs 500-1,000 per document** for retrieval. Our value proposition: unlimited storage + retrieval at a flat monthly/yearly fee.

### Recommended Plans

| Plan | Monthly Price | Yearly Price (15% discount) | Storage Limit | Features |
|---|---|---|---|---|
| **Basic** | Rs 199/mo | Rs 1,999/yr | 5 GB | Upload, folders, basic support |
| **Standard** | Rs 399/mo | Rs 3,999/yr | 25 GB | Everything in Basic + priority support |
| **Professional** | Rs 799/mo | Rs 7,999/yr | 100 GB | Everything in Standard + video storage |
| **Enterprise** | Custom | Custom | Unlimited | Custom branding, API access, dedicated support |

### Revenue Projections

Assuming 70% Basic, 25% Standard, 5% Professional users:

| Users | Monthly Revenue | Annual Revenue | Infrastructure Cost/mo | Net Profit/mo |
|---|---|---|---|---|
| 100 | Rs 25,200 | Rs 3,02,400 | Rs 2,353 | Rs 22,847 |
| 500 | Rs 1,26,000 | Rs 15,12,000 | Rs 8,588 | Rs 1,17,412 |
| 1,000 | Rs 2,52,000 | Rs 30,24,000 | Rs 15,033 | Rs 2,36,967 |

> At just 100 users, the infrastructure costs are only ~9% of revenue. Very healthy margins.

---

## 14. Summary & Recommendations

### For the Client (Your Pitch)

| Metric | Value |
|---|---|
| **One-time development cost** | Rs 8,00,000 - 12,00,000 |
| **Monthly infrastructure (starting)** | Rs 2,353/month |
| **Monthly infrastructure (1K users)** | Rs 15,033/month |
| **Monthly maintenance** | Rs 15,000/month (retainer) |
| **Breakeven users** | ~60-70 users (at Rs 299/mo subscription) |
| **Annual domain + fixed costs** | Rs 1,350/year |

### Recommended Tech Stack (Final)

| Component | Choice | Monthly Cost |
|---|---|---|
| Frontend | **Next.js 14+ on Vercel Pro** | Rs 1,670 |
| Backend | **Next.js API Routes / Express on Railway** | Rs 420-1,670 |
| Database | **Supabase (Postgres)** | Rs 0-2,085 |
| Cloud Storage | **Cloudflare R2** | Rs 0-12,450 (scales with users) |
| Payments | **Razorpay** (Subscriptions + UPI AutoPay) | 2% per transaction |
| SMS OTP | **Firebase Auth** (MVP) → **MSG91** (scale) | Rs 0 → Rs 0.18/SMS |
| KYC | **Surepass** (PAN + Aadhaar) | Rs 3-5 per signup |
| CDN + DNS | **Cloudflare Free** | Rs 0 |
| Domain | **.in + .com** | Rs 113/month |
| SSL | **Let's Encrypt** (auto via Vercel/Cloudflare) | Rs 0 |
| Monitoring | **Sentry Free + Better Uptime** | Rs 0 |

### Key Advantages of This Stack
1. **Ultra-low starting cost** - Under Rs 2,500/month for MVP
2. **Zero egress fees** - Cloudflare R2 saves thousands as you scale
3. **India-optimized** - Mumbai/Bangalore servers, Indian payment + SMS providers
4. **Scalable** - Handles 100 to 10,000+ users without re-architecting
5. **Fast to build** - 3-4 months for a single senior developer
6. **Easy maintenance** - Managed services, minimal DevOps overhead

### What You Walk Away With

| Item | Amount |
|---|---|
| **Project fee** | Rs 8,00,000 - 12,00,000 (one-time) |
| **Monthly retainer** | Rs 15,000 - 25,000/month (recurring) |
| **Timeline** | 3-4 months |
| **Ongoing relationship** | AMC + feature development |

---

> **Disclaimer**: All pricing data is based on research conducted in early-mid 2025-2026. Cloud provider pricing changes periodically. Verify current rates on official pricing pages before making final commitments. INR conversions use ~83-85 INR/USD exchange rate.

### Quick Reference Links
- Razorpay Pricing: https://razorpay.com/pricing/
- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/
- Vercel Pricing: https://vercel.com/pricing
- Supabase Pricing: https://supabase.com/pricing
- MSG91 Pricing: https://msg91.com/pricing
- Surepass Pricing: https://surepass.io/pricing
- DigitalOcean: https://www.digitalocean.com/pricing
- MongoDB Atlas: https://www.mongodb.com/pricing
