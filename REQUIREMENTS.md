# Doc2Save — Finalized Requirements

> All client decisions locked in. This is the single source of truth.

---

## Branding & Design
- **App Name**: Doc2Save (working name, finalize later)
- **Brand Colors**: Vercel design system (black, white, grays, blue accents)
- **Logo**: TBD (not blocking development)
- **Domain**: Register after client sees working demo
- **Design Language**: Clean, minimal, Vercel-inspired, mobile-first

---

## Authentication & KYC

| Feature | Decision |
|---|---|
| Login method | **Phone number OTP (mandatory)** |
| KYC (PAN + Aadhaar) | **Deferred — can be done later, not at signup** |
| KYC verification type | **Instant / automated API (Surepass)** |
| Physical card images | **No — number input only with proper validation** |
| Camera-based scanning | **Only if needed during KYC flow, not a core feature** |

**Flow**: Phone OTP login → Dashboard (can use app immediately) → KYC prompt shown but skippable → KYC required before [TBD: before first upload? before subscription? discuss with client]

---

## Subscription & Payments

| Feature | Decision |
|---|---|
| Plan | **Single plan: Rs 599/month** |
| Yearly plan | **No (not for now)** |
| Free trial | **No time-based trial. 1 free document upload, then paywall** |
| Expired subscription | **Read-only access — can view/download but cannot upload** |
| Payment gateway | **Razorpay** (account being set up) |
| AutoPay | **UPI AutoPay + Card recurring** |

**Flow**: Signup → 1 free document upload → "Subscribe to upload more" → Razorpay checkout → Full access

---

## Document Storage & Management

| Feature | Decision |
|---|---|
| Supported formats | **PDFs, images (JPG/PNG/HEIC), DOCX** |
| Video support | **No** |
| Max file size | **50 MB per file** |
| Folders & subfolders | **Yes** |
| In-app document preview | **Yes (critical feature — view PDFs/images without downloading)** |
| Document sharing | **No** |
| Collaboration | **No** |
| File search | **Yes (by file name)** |
| Favorites | **Yes** |
| Recent uploads | **Yes (simple list)** |
| Trash / Recycle bin | **No — permanent delete with confirmation dialog** |
| Document scanning (camera) | **No (maybe only for KYC later)** |

---

## Admin Panel

| Feature | Included |
|---|---|
| User management | **Yes** |
| KYC approvals/status | **Yes** |
| Revenue dashboard | **Yes (daily/monthly/yearly)** |
| Report exports (CSV/Excel) | **Yes** |
| Infrastructure cost analysis | **Yes (show actual spend on hosting, storage, SMS, KYC)** |
| Block/deactivate users | **Yes** |
| Manually extend subscriptions | **Yes** |

---

## Notifications

| Type | Status |
|---|---|
| Push notifications | **Not needed now** |
| Email notifications | **Planned but not in Phase 1** |
| WhatsApp notifications | **Planned but not in Phase 1** |

---

## Technical Decisions

| Decision | Choice |
|---|---|
| Frontend | Next.js 14+ (App Router) + Tailwind + shadcn/ui |
| PWA | Yes (installable, add to home screen) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Cloud Storage | Cloudflare R2 |
| Auth | Firebase Auth (Phone OTP) |
| KYC | Surepass (PAN + Aadhaar) |
| Payments | Razorpay (Subscriptions) |
| CDN | Cloudflare (free) |
| Monitoring | Sentry (free tier) |

---

## Launch Strategy

| Item | Decision |
|---|---|
| Launch type | **Phased launch** |
| Target date | **ASAP** |
| Beta testers | **None — internal testing only (us)** |
| Razorpay account | **Being set up** |
| Privacy policy | **Being drafted** |
| Domain registration | **After demo** |

---

## Phased Launch Plan

### Phase 1 — MVP (Launch This First)
- Phone OTP login
- Document upload (1 free, then paywall)
- Folder/subfolder management
- In-app document preview
- File search + favorites + recent uploads
- Razorpay subscription (Rs 599/mo)
- Basic user dashboard
- Basic admin panel
- PWA (installable)

### Phase 2 — Post-Launch
- KYC verification (PAN + Aadhaar)
- Admin KYC approval flow
- Revenue dashboard + report exports
- Infrastructure cost tracking in admin
- Email notifications
- WhatsApp notifications

### Phase 3 — Future (If Needed)
- Yearly subscription plan
- Video support
- Camera-based document scanning
- Document sharing
- Additional subscription tiers

---

## Open Questions (To Confirm with Client)

1. **Is KYC required before subscription payment?** Or can users pay first, do KYC anytime?
2. **Storage limit per user?** Unlimited at Rs 599/mo? Or capped (e.g., 25 GB, 50 GB)?
3. **What happens when storage limit is reached?** (If we set a limit)
4. **Admin panel access** — who gets admin access? Just the client? Multiple team members?
5. **Business entity details for Razorpay** — Proprietorship / LLP / Pvt Ltd? GST number?
