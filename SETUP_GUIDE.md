# Doc2Save — Setup Guide

Complete walkthrough to get Doc2Save running locally and ready for deployment.

---

## Prerequisites

- Node.js 18+ installed
- A Google account (for Firebase)
- A Cloudflare account (free tier works)
- A Razorpay account (with activated test mode)
- Access to Supabase (free tier works)

---

## Step 1: Supabase (PostgreSQL Database)

### 1.1 Create project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `doc2save`
   - **Database Password**: Generate a strong one and **save it** somewhere safe
   - **Region**: Choose `ap-south-1` (Mumbai) for lowest latency in India
4. Click **"Create new project"** — wait 2-3 minutes for provisioning

### 1.2 Get connection strings
1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy these two values:

```
# Transaction mode (for Prisma — uses PgBouncer)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode (for Prisma migrations)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

> Replace `[password]` with the database password you set.
> Replace `[ref]` with your project reference ID (visible in the URL).

### 1.3 Push the schema
Once you have the connection strings in your `.env` file:

```bash
npx prisma db push
```

This creates all 5 tables (users, folders, documents, subscriptions, payments) and enums.

---

## Step 2: Firebase (Phone OTP Authentication)

### 2.1 Create project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `doc2save` (or anything)
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

### 2.2 Enable Phone Auth
1. Go to **Authentication** → **Sign-in method**
2. Click **"Phone"** → Toggle **Enable** → Click **Save**

### 2.3 Add a web app
1. Go to **Project Overview** → Click the **web icon** (`</>`)
2. Register app name: `doc2save-web`
3. You'll see a config object like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "doc2save-xxxxx.firebaseapp.com",
  projectId: "doc2save-xxxxx",
};
```

4. Copy these three values into your `.env`:

```
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="doc2save-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="doc2save-xxxxx"
```

### 2.4 Generate Admin SDK credentials
1. Go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"** → Click **"Generate key"**
3. A JSON file downloads. Open it and extract:

```
FIREBASE_PROJECT_ID="doc2save-xxxxx"               # from "project_id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@..."   # from "client_email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"  # from "private_key"
```

> **Important**: The private key has `\n` newlines. Paste the entire value including `-----BEGIN` and `-----END` lines, keeping the `\n` characters as-is.

### 2.5 Add test phone numbers (for development)
1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **"Phone numbers for testing"**
3. Add a test number, e.g.:
   - Phone: `+919999999999`
   - Verification code: `123456`
4. This lets you test OTP login without sending real SMS

### 2.6 Authorize your domain
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. `localhost` is already there (for dev)
3. When you deploy, add your production domain here (e.g., `doc2save.vercel.app`)

---

## Step 3: Cloudflare R2 (File Storage)

### 3.1 Create a bucket
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**
2. Click **"Create bucket"**
3. Name: `doc2save-prod`
4. Location: **APAC** (Asia Pacific for India)
5. Click **"Create bucket"**

### 3.2 Generate API tokens
1. Go to **R2** → **Overview** → **"Manage R2 API Tokens"** (right sidebar)
2. Click **"Create API token"**
3. Configure:
   - **Token name**: `doc2save-server`
   - **Permissions**: **Object Read & Write**
   - **Specify bucket(s)**: Select `doc2save-prod`
4. Click **"Create API Token"**
5. **Copy immediately** (shown only once):

```
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
```

### 3.3 Get the endpoint
1. Go to **R2** → **Overview**
2. Your account ID is in the URL: `dash.cloudflare.com/<account_id>/r2`
3. The S3-compatible endpoint is:

```
R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
R2_BUCKET_NAME="doc2save-prod"
```

### 3.4 CORS configuration
1. Go to your bucket → **Settings** → **CORS Policy**
2. Add this rule:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

> This is required for presigned URL uploads from the browser.

---

## Step 4: Razorpay (Payments)

### 4.1 Create account
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → Sign up
2. Complete basic KYC (PAN, bank account, etc.)
3. You'll start in **Test Mode** by default — this is what you want for development

### 4.2 Get API keys
1. Go to **Settings** → **API Keys** → **Generate Key**
2. Copy:

```
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_key_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."   # same as RAZORPAY_KEY_ID
```

> `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the same value as `RAZORPAY_KEY_ID`. It's exposed to the client for the Razorpay checkout widget.

### 4.3 Create a subscription plan
1. Go to **Subscriptions** → **Plans** → **Create Plan**
2. Fill in:
   - **Name**: `Doc2Save Monthly`
   - **Amount**: `599` (INR)
   - **Period**: `Monthly`
   - **Billing cycle**: `Every 1 month`
3. Click **"Create Plan"**
4. Copy the **Plan ID** (starts with `plan_`):

```
RAZORPAY_PLAN_ID="plan_xxxxxxxxxxxxx"
```

### 4.4 Set up webhooks
1. Go to **Settings** → **Webhooks** → **Add New Webhook**
2. Configure:
   - **Webhook URL**: `https://your-domain.com/api/payments/webhook`
     - For local testing: use [ngrok](https://ngrok.com) → `ngrok http 3000` → use the ngrok URL
   - **Secret**: Generate a random string (32+ characters) and save it:

```
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
```

3. **Select events** (check all of these):
   - `subscription.authenticated`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.pending`
   - `subscription.halted`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.expired`
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`

4. Click **"Create Webhook"**

### 4.5 Test cards (for testing payments)
Razorpay test mode accepts these:
- **Card**: `4111 1111 1111 1111`, Expiry: any future date, CVV: any 3 digits
- **UPI**: `success@razorpay` (auto-succeeds)

---

## Step 5: Session Secret

Generate a random 32-byte hex string for JWT signing:

```bash
openssl rand -hex 32
```

Copy the output:

```
SESSION_SECRET="your_64_character_hex_string"
```

---

## Step 6: Put It All Together

### 6.1 Create your `.env` file

```bash
cp .env.example .env
```

Fill in all the values from the steps above. Your `.env` should look like:

```env
# Supabase
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="doc2save-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="doc2save-xxxxx"

# Firebase Admin
FIREBASE_PROJECT_ID="doc2save-xxxxx"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@doc2save-xxxxx.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Session
SESSION_SECRET="your_64_char_hex"

# Cloudflare R2
R2_ENDPOINT="https://your_account_id.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
R2_BUCKET_NAME="doc2save-prod"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
RAZORPAY_PLAN_ID="plan_xxxxxxxxxxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 6.2 Push database schema

```bash
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

### 6.3 Generate Prisma client

```bash
npx prisma generate
```

### 6.4 Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page.

---

## Step 7: Create an Admin User

After your first login via OTP, you'll be a regular `USER`. To make yourself admin:

### Option A: Via Supabase SQL Editor
1. Go to Supabase → **SQL Editor**
2. Run:

```sql
UPDATE users SET role = 'ADMIN' WHERE phone = '+91XXXXXXXXXX';
```

Replace with your phone number (with +91 prefix).

### Option B: Via Prisma Studio
```bash
npx prisma studio
```
This opens a GUI at `localhost:5555`. Find your user in the `users` table and change `role` to `ADMIN`.

---

## Step 8: Deployment (Vercel)

### 8.1 Push to GitHub
```bash
git add -A
git commit -m "Initial Doc2Save build"
git remote add origin https://github.com/yourusername/doc2save.git
git push -u origin main
```

### 8.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **"Add New Project"**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. **Build Command**: `next build --webpack`
5. Add all environment variables from your `.env` file
6. Click **"Deploy"**

### 8.3 Post-deployment checklist
- [ ] Add your Vercel domain to Firebase **Authorized domains**
- [ ] Update Cloudflare R2 CORS **AllowedOrigins** with your production URL
- [ ] Update Razorpay webhook URL to `https://your-domain.vercel.app/api/payments/webhook`
- [ ] Update `NEXT_PUBLIC_APP_URL` env var on Vercel to your production URL
- [ ] Test: login with phone OTP, upload a document, subscribe, preview

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| OTP not sending | Check Firebase console → Usage & billing. Free tier = 10 SMS/day. Add test phone numbers for dev. |
| Upload fails with CORS | Add your domain to R2 bucket CORS config (AllowedOrigins). |
| Webhook events not arriving | Verify webhook URL is correct in Razorpay dashboard. For local dev, use ngrok. |
| `prisma db push` fails | Check DATABASE_URL uses port 5432 (not 6543). Direct URL is for migrations. |
| Login redirects in loop | Check SESSION_SECRET is set. Check Firebase API key matches. |
| Build fails on Vercel | Ensure build command is `next build --webpack` (not default turbopack). |

---

## Monthly Costs (at 100 users)

| Service | Cost |
|---------|------|
| Supabase (free tier) | Rs 0 |
| Firebase Auth (10k verifications/mo) | Rs 0 |
| Cloudflare R2 (10GB storage) | Rs 0 (free tier: 10GB) |
| Vercel (hobby) | Rs 0 |
| Razorpay (per transaction) | 2% + Rs 3 per payment |
| **Total infra** | **Rs 0** (until you outgrow free tiers) |
