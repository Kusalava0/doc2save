# Message to Client

---

## Option 1: WhatsApp / Short Message Version

---

Hi [Client Name],

Hope you're doing well! I've done a thorough analysis of the Doc2Save project — the document storage PWA for real estate agents. Wanted to share the infrastructure cost breakdown and a few questions I need answered before we kick things off.

**What the app will do (just so we're on the same page):**
- Mobile website that users install on their home screen (PWA)
- Login via mobile OTP + PAN & Aadhaar verification
- Upload & store documents (PDFs, images, DOCX, videos)
- Folders & subfolders to organize files
- Download/retrieve any document anytime
- Monthly/yearly subscription with auto-pay via Razorpay (UPI AutoPay, cards, etc.)
- Admin panel for you to manage users, subscriptions & revenue

---

**Monthly Running Costs (Infrastructure) you'll need to bear:**

| Stage | Users | Monthly Cost |
|---|---|---|
| Starting out | ~100 users | Rs 2,300 - 2,500/month |
| Growing | ~500 users | Rs 8,500 - 9,000/month |
| Scaling | ~1,000 users | Rs 15,000 - 16,000/month |

This includes hosting, database, cloud storage, OTP SMS costs, KYC verification, CDN, and domain — everything.

**Other costs you should know about:**
- **Domain** (.in + .com): ~Rs 1,350/year
- **SSL (security certificate)**: Free (industry standard now)
- **Razorpay payment gateway**: 2% per transaction (no setup fee, no monthly fee) — so on a Rs 299 subscription, Razorpay takes ~Rs 7
- **KYC verification (PAN + Aadhaar)**: Rs 3-5 per new user signup — this is a one-time cost per user
- **SMS OTP**: Practically free for the first 10,000 users/month using Firebase. After that ~18-20 paisa per SMS

**The good news:**
- At just 60-70 paying users (@ Rs 299/month), the infrastructure costs are fully covered
- At 100 users, you're already looking at ~Rs 25,000/month revenue vs ~Rs 2,500 infra cost
- At 1,000 users, that's ~Rs 2.5 lakh/month revenue vs ~Rs 15,000 infra cost
- Margins are very healthy — 85-90%+ profit on infrastructure

**Post-launch maintenance:**
After delivery, you'll need someone to handle bug fixes, server monitoring, security updates, and minor improvements. I can offer a monthly maintenance retainer for this. We can discuss the specifics on our call.

---

**Now, I have some questions I need answered before we start building:**

**1. Branding & Identity**
- Do you have a final app name, logo, and brand colors? Or do I need to design these?
- Do you have a domain name already registered? If not, what name do you prefer (.in / .com)?

**2. KYC & Verification**
- Is PAN + Aadhaar verification mandatory for ALL users at signup? Or can users start with just mobile OTP and do KYC later?
- Should KYC be auto-verified (instant API check) or does your team manually approve users after reviewing documents?
- Do you also want to collect/store a photo of the physical PAN/Aadhaar card, or just the number for API verification?

**3. Subscription Plans**
- What pricing plans do you want to offer? My suggestion:
  - Basic: Rs 199/month (5 GB storage)
  - Standard: Rs 399/month (25 GB)
  - Professional: Rs 799/month (100 GB)
  - Do you want a yearly plan as well? (Typically 15-20% discount)
- Should there be a free trial period? If yes, how many days?
- What happens when a subscription expires? Can users still view files but not upload? Or complete lockout?

**4. Document Storage**
- Is there a maximum file size limit you want per upload? (e.g., 50 MB, 100 MB, 500 MB?)
- Do you want video uploads? Videos take significantly more storage and cost more. Should we cap video size (e.g., max 200 MB per video)?
- Should users be able to share documents/folders with other users of the platform?
- Do you need a document preview feature (view PDFs/images in-app without downloading)?

**5. User Features**
- Should users be able to search across all their documents by file name?
- Do you want a "Recently Accessed" or "Favorites" section?
- Should there be a Recycle Bin / Trash feature (recover accidentally deleted files for 30 days)?
- Do you need any kind of document scanning feature (camera capture → PDF)?

**6. Admin Panel**
- What do you need to see/do in the admin panel?
  - View all users and their KYC status?
  - View subscription status and payment history?
  - Revenue dashboard (daily/monthly/yearly)?
  - Ability to block/deactivate users?
  - Ability to manually extend someone's subscription?
  - Download reports (CSV/Excel)?

**7. Notifications**
- Do you want push notifications? (e.g., "Your subscription is expiring in 3 days")
- Email notifications for payment receipts, subscription reminders?
- WhatsApp notifications? (This has additional costs)

**8. Razorpay Account**
- Do you already have a Razorpay business account? If not, you'll need to register one with your business PAN/GST. I can guide you through the process.
- Do you have a registered business entity (company/LLP/proprietorship) + GST number? Razorpay requires this.

**9. Legal & Compliance**
- Do you have a Privacy Policy and Terms of Service? Since we're handling Aadhaar data and documents, this is legally important.
- Will you need me to draft a basic version, or will you get this done from a lawyer?

**10. Timeline & Priority**
- What is your target launch date?
- Is there a specific feature that's most important to launch with first? (We can do a phased launch — core features first, then add more)
- Do you have any beta users or early customers lined up to test?

---

Once I have answers to these, I can finalize the exact scope, timeline, and we can discuss everything else on our call.

Looking forward to hearing from you!

---

## Option 2: Formal Email Version

---

**Subject: Doc2Save — Infrastructure Cost Breakdown & Pre-Development Questions**

Dear [Client Name],

Thank you for the opportunity to work on the Doc2Save project. I've completed a thorough technical and cost analysis for the document storage platform. Below is a summary of the ongoing infrastructure costs and some key questions I need answered before we begin development.

---

### Monthly Infrastructure Costs

The application's running costs scale with the number of users:

| Growth Stage | Approx. Users | Monthly Infra Cost (INR) |
|---|---|---|
| Launch / MVP | Up to 100 | Rs 2,300 – 2,500 |
| Growth Phase | Up to 500 | Rs 8,500 – 9,000 |
| Scale Phase | Up to 1,000 | Rs 15,000 – 16,000 |

These figures include all hosting, database, cloud file storage, CDN, SMS OTP costs, and KYC verification API costs.

### Additional Recurring Costs

| Item | Cost |
|---|---|
| Domain (.in + .com) | ~Rs 1,350/year |
| SSL Certificate | Free |
| Razorpay Gateway Fee | 2% per transaction (no setup/monthly fee) |
| PAN + Aadhaar KYC per signup | Rs 3 – 5 per new user |
| SMS OTP | Free up to 10K/month, then ~Rs 0.18/SMS |

### Revenue vs Cost (at Rs 299/mo subscription)

| Users | Monthly Revenue | Monthly Infra Cost | Gross Margin |
|---|---|---|---|
| 100 | Rs 25,000+ | Rs 2,500 | ~90% |
| 500 | Rs 1,25,000+ | Rs 9,000 | ~93% |
| 1,000 | Rs 2,50,000+ | Rs 15,000 | ~94% |

The breakeven point is approximately 60-70 paying subscribers.

### Post-Launch Maintenance

After delivery, the application will require ongoing maintenance — bug fixes, security updates, server monitoring, and minor feature improvements. I offer monthly maintenance retainers for this purpose, which we can discuss separately.

---

### Questions Requiring Your Input

To finalize the scope and begin development, I need your input on the following:

**Branding:**
1. Do you have a finalized app name, logo, and brand colors?
2. Have you registered a domain name?

**User Onboarding & KYC:**
3. Is PAN + Aadhaar verification mandatory at signup, or can it be completed later?
4. Should verification be instant (automated API) or manually reviewed by your team?
5. Do you need to store images of physical ID cards, or only verify via number?

**Subscription & Payments:**
6. What subscription plans and pricing do you want? (I can suggest options)
7. Should there be a free trial period? If yes, how long?
8. What should happen when a subscription expires — read-only access or full lockout?

**Document Management:**
9. What is the maximum file size per upload? (50 MB / 100 MB / 500 MB?)
10. Should video uploads be supported? If yes, any size cap?
11. Do users need document sharing or collaboration features?
12. Is in-app document preview required (view without downloading)?

**Features:**
13. Do you need file search, favorites, or recently accessed sections?
14. Should there be a trash/recycle bin for deleted files?
15. Any need for camera-based document scanning within the app?

**Admin Panel:**
16. What admin capabilities do you need? (User management, KYC approvals, revenue dashboard, report exports, etc.)

**Notifications:**
17. What types of notifications? (Push, Email, WhatsApp — each has different cost implications)

**Business Setup:**
18. Do you have an active Razorpay account with a registered business entity?
19. Do you have a Privacy Policy and Terms of Service drafted? (Required for handling Aadhaar data)

**Timeline:**
20. What is your target launch date?
21. Do you prefer a phased launch (core features first) or a full launch?
22. Do you have beta testers or early customers lined up?

---

Once I have your responses, I'll finalize the detailed project scope, timeline, and we can take it forward from there. Happy to jump on a call to discuss any of these points.

Best regards,
[Your Name]

---

## Key Questions Checklist (For Your Reference)

Use this to track which questions have been answered:

- [ ] App name, logo, brand colors
- [ ] Domain name preference
- [ ] KYC mandatory at signup or deferred?
- [ ] Auto-verify vs manual KYC approval?
- [ ] Store physical card images?
- [ ] Subscription pricing tiers confirmed
- [ ] Free trial — yes/no, duration
- [ ] Expired subscription behavior
- [ ] Max file upload size
- [ ] Video support — yes/no, size cap
- [ ] Document sharing between users?
- [ ] In-app document preview?
- [ ] Search, favorites, recycle bin features?
- [ ] Camera scan to PDF feature?
- [ ] Admin panel feature list confirmed
- [ ] Notification types (push/email/WhatsApp)
- [ ] Razorpay account + business entity ready?
- [ ] Privacy Policy & Terms of Service?
- [ ] Target launch date
- [ ] Phased vs full launch preference
- [ ] Beta users available?
