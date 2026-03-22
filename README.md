# Shopbox

**Shopbox** is a Shopify app that connects your store with messaging channels — WhatsApp, Instagram DM, and Facebook Messenger — to deliver an automated, conversational shopping experience for your customers.

Built with [React Router](https://reactrouter.com/), [Polaris](https://polaris.shopify.com/), and the [Shopify App Framework](https://shopify.dev/docs/apps/getting-started).

---

## Features

- 🔗 **Channel Connections** — Connect WhatsApp, Instagram, and Messenger to your Shopify store
- 🤖 **Automation Rules** — Set up keyword triggers for automated product replies and messages
- 📊 **Analytics Dashboard** — Track message volume, conversion rates, and channel performance
- 🛒 **In-Chat Shopping** — Let customers browse and buy products directly in their favourite messaging app

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20.19+ or v22.12+
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)
- A [Shopify Partner](https://partners.shopify.com/) account with a development store

### Installation

```shell
npm install
```

### Local Development

```shell
npm run dev
```

Press **P** to open the app in your development store. Click **Install** to begin.

### Database Setup

```shell
npx prisma generate
npx prisma migrate deploy
```

---

## Project Structure

```
shopbox/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx       # Dashboard / home page
│   │   ├── app.channels.tsx     # Channel connections (WhatsApp, IG, Messenger)
│   │   ├── app.automation.tsx   # Automation rules & keyword triggers
│   │   └── app.tsx              # App layout wrapper
│   ├── shopify.server.ts        # Shopify API configuration
│   └── root.tsx                 # Root layout
├── prisma/
│   └── schema.prisma            # Database schema
├── shopify.app.toml              # App configuration (scopes, webhooks, URLs)
└── package.json
```

---

## App Store Compliance — Items to Address

> **These items must be completed before submitting to the Shopify App Store.**

### 🔑 Access Scopes Audit

Review `shopify.app.toml` and remove any scopes the app doesn't actually use. Shopify will reject apps that request excessive permissions. Each scope must be justified in your submission.

**Current scopes to review:**

| Scope | Needed? | Justification |
|---|---|---|
| `read_customers` | _TBD_ | _e.g. To identify returning customers in chat_ |
| `write_customers` | _TBD_ | _e.g. To tag customers from messaging channels_ |
| `read_products` | _TBD_ | _e.g. To surface products in chat responses_ |
| `read_product_listings` | _TBD_ | _e.g. To show published products to channel_ |
| `read_orders` | _TBD_ | _e.g. To check order status in chat_ |
| `write_orders` | _TBD_ | _e.g. To create draft orders from chat_ |
| `read_discounts` | _TBD_ | _e.g. To share discount codes in chat_ |
| `read_fulfillments` | _TBD_ | _May not be needed — remove if unused_ |
| `read_inventory` | _TBD_ | _e.g. To show stock availability_ |
| `read_metaobjects` | _TBD_ | _Justify or remove_ |
| `write_metaobjects` | _TBD_ | _Justify or remove_ |
| `read_price_rules` | _TBD_ | _May not be needed — remove if unused_ |
| `read_shipping` | _TBD_ | _May not be needed — remove if unused_ |

---

### 📦 Mandatory GDPR Webhooks

Add these compliance webhook handlers. **Every** Shopify app is required to handle them:

- [ ] `customers/data_request` — Return stored customer data on request
- [ ] `customers/redact` — Delete customer data (GDPR right to be forgotten)
- [ ] `shop/redact` — Delete all shop data after app uninstall

**Implementation:** Create route handlers in `app/routes/webhooks.*.tsx` for each.

---

### 🎨 Polaris UI Compliance

- [ ] Use **Polaris components** exclusively in the embedded admin (no external UI frameworks)
- [ ] Add `FooterHelp` component to every page with a link to your support docs
- [ ] Add **empty states** to all data views (channels page with no connections, analytics with no data, etc.)
- [ ] Add **loading states** (skeletons/spinners) while data is being fetched
- [ ] Use `Banner` components for success/error notifications (not custom alerts)
- [ ] Use `Link` from `react-router` or `@shopify/polaris` — never raw `<a>` tags

---

### 💳 Billing Setup

If you plan to charge merchants:

- [ ] Integrate the [Shopify Billing API](https://shopify.dev/docs/apps/launch/billing) or use Managed Pricing
- [ ] **Do not** use external payment processors (Stripe, PayPal, etc.) for app fees
- [ ] Allow merchants to upgrade/downgrade plans without contacting support

---

### 🔒 Security & Privacy

- [ ] Create and host a **Privacy Policy** page — URL is required for the app listing
- [ ] Ensure all API keys and tokens are in **environment variables**, not in source code
- [ ] Validate **HMAC** signatures on all incoming webhook payloads
- [ ] Test the app in **Chrome incognito mode** — must work without cookies/localStorage
- [ ] Do not use merchant/customer data for AI/ML without written consent (new rule effective Feb 2026)

---

### ⚡ Performance

- [ ] API responses under **500ms** for 95% of requests
- [ ] App must not reduce store **Lighthouse score** by more than 10%
- [ ] No **404s, 500s**, or UI errors
- [ ] Webhook responses within **5 seconds**
- [ ] Use a **supported API version** (not one deprecated within 90 days) — currently set to `2025-01`

---

### 📋 App Listing Preparation

- [ ] **App name** — must be unique, cannot contain "Shopify"
- [ ] **App icon** — 1200×1200 px, no text, no screenshots
- [ ] **Screenshots** — at least 3 showing real app functionality
- [ ] **Description** — clear, accurate description of what the app does
- [ ] **Key benefits** — 3–5 bullet points of merchant value
- [ ] **Demo store or video** — for Shopify reviewers to test your app
- [ ] **Support URL** — active support channel (email, chat, or help center)
- [ ] **FAQ** — recommended to reduce support tickets

---

### 🔌 Meta OAuth Flow

Since the app connects to Instagram/Messenger via Meta:

- [ ] Meta OAuth must use **redirects**, not pop-up windows
- [ ] OAuth flow should redirect **back into the embedded app** after completion
- [ ] Allow merchants to **disconnect** their Meta accounts from within the app
- [ ] Use `AccountConnection` Polaris component for showing connection status
- [ ] Show connection status using `Banner` components

---

## Deployment

### Build

```shell
npm run build
```

### Production

```shell
npm run start
```

See the [Shopify deployment docs](https://shopify.dev/docs/apps/launch/deployment) for hosting options including Google Cloud Run, Fly.io, and Render.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Router v7 |
| UI | Shopify Polaris v13 |
| App Bridge | Shopify App Bridge React v4 |
| Database | Prisma + SQLite (dev) |
| Auth | Shopify OAuth (session tokens) |
| CLI | Shopify CLI |

---

## Resources

- [Shopify App Store Requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
- [Shopify App Best Practices](https://shopify.dev/docs/apps/launch/app-requirements-checklist)
- [Polaris Design System](https://polaris.shopify.com)
- [App Design Guidelines](https://shopify.dev/docs/apps/design)
- [Shopify Billing API](https://shopify.dev/docs/apps/launch/billing)
- [GDPR Mandatory Webhooks](https://shopify.dev/docs/apps/build/privacy-law-compliance)
- [Built for Shopify Criteria](https://shopify.dev/docs/apps/launch/built-for-shopify)
- [Shopify App React Router Docs](https://shopify.dev/docs/api/shopify-app-react-router)

---

## License

_TBD_
