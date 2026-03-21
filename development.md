# 🚀 Shopify App Development: Core Concepts & Steps

Building a Shopify app is different from building a standard web app because your application lives **inside** another platform (Shopify). This guide explains the "Magic" happening behind the scenes.

---

## 🏗️ 1. The Architecture: How does it fit?

### The "Iframe" Reality
When a merchant opens your app in their Shopify Admin, they aren't leaving Shopify. Your app is loaded inside an **Iframe**. 
*   **Challenge**: Browsers often block cookies/sessions inside Iframes (Third-party cookie restrictions).
*   **Solution**: This is why your template uses **App Bridge** and **Session Tokens** (JWT) instead of standard browser cookies.

### App Bridge
Think of `App Bridge` as a telephone line between your app (the Iframe) and the Shopify Admin (the Parent). 
*   It allows you to trigger Shopify UI elements (Modals, Toast notifications, Title bars).
*   It handles the navigation so that when you change pages in your app, the URL in the merchant's browser updates correctly.

---

## 🔑 2. Authentication & Security

### The `shopify.server.ts` File
This is the heart of your app's security. When a request comes in, you call:
```typescript
const { admin, session } = await shopify.authenticate.admin(request);
```
*   **Admin API**: The `admin` object is your "Superuser" key to query Shopify data (Products, Orders, Customers).
*   **Session**: Contains the `shop` name and the access token. 
*   **Storage**: These sessions are stored in your database (via Prisma) so you don't have to ask the merchant to log in every time.

---

## 📦 3. Data Strategy (GraphQL vs REST)

Shopify prefers **GraphQL**. It is faster and more efficient because you only ask for the specific fields you need.
*   **Rate Limits**: Shopify uses a "Leaky Bucket" algorithm. Instead of a fixed number of requests per minute, you have a "cost" budget. GraphQL makes it easier to stay under budget.

---

## 🛠️ 4. The Development Steps

### Step 1: Scaffolding
Ran via `shopify app init`. This sets up the React Router + Vite + Prisma stack.

### Step 2: Local Tunneling
When you run `shopify app dev`, the CLI creates a **Cloudflare Tunnel**. 
*   **Why?** Shopify needs to send data (Webhooks) and load your app via HTTPS. Since your computer is `localhost`, the tunnel gives you a public URL (e.g., `https://random-word.trycloudflare.com`) that Shopify can talk to.

### Step 3: Defining Scopes
In `shopify.app.toml`, you define `scopes` (e.g., `read_products`, `write_orders`). 
*   If you add a new scope, Shopify will automatically prompt the merchant to "Update App" the next time they open it.

---

## ⚡ 5. React Router v7 Specifics

This template uses the **Data Strategy** of React Router v7:
1.  **Loaders**: Run on the **server** before the page renders. This is where you fetch Shopify data.
2.  **Actions**: Run on the **server** when you submit a form. This is where you update Shopify data.
3.  **Hydration**: The server sends the HTML, and then React "wakes up" on the client to handle the App Bridge interactivity.

---

## 🛠️ Quick Commands

| Command | Action |
| :--- | :--- |
| `shopify app dev` | Start local development server and tunnel. |
| `shopify app deploy` | Deploy changes and sync with Shopify Admin. |
| `npx prisma generate` | Update Prisma client for database changes. |
| `npx prisma migrate dev` | Create and apply a database migration. |

---

## 🚀 6. Pro-Tips for Success

1.  **Never use standard `<a>` tags**: Always use the `Link` component from `react-router`. Standard tags will break the Iframe navigation.
2.  **Use `shopify.authenticate.public.checkout`**: If you are building features that show up on the actual storefront (not just the admin).
3.  **Webhooks are your friends**: Instead of constantly checking if a product changed, subscribe to the `PRODUCTS_UPDATE` webhook. Shopify will "Push" the data to you when it happens.
