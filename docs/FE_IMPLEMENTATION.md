# 🛠️ ShopBoxx Frontend Implementation Guide (Meta & Instagram)

This document is for the **Frontend AI Agent** to build the UI for the Instagram & Messenger automation features.

---

## 🏗️ 1. Authentication Strategy
All Backend endpoints use **Shopify Authenticated Session Tokens**. 
- The Frontend MUST get the session token using `app.getState().sessionToken`.
- Include it in every request: `Authorization: Bearer <Token>`.

## 📍 2. Connection Flow (OAuth)

### A. The "Channel Setup" Screen
If the merchant is not connected, show two buttons:
1. **Connect Facebook Messenger**
2. **Connect Instagram Business**

### B. Initiating the Connection
Redirect the user (outside the bridge or in a popup) to these Backend locations:
- **Messenger**: `{{BACKEND_URL}}/api/meta/auth/messenger?shop={{SHOP_DOMAIN}}`
- **Instagram**: `{{BACKEND_URL}}/api/meta/auth/instagram?shop={{SHOP_DOMAIN}}`

### C. Success Callback
The backend will redirect the user back to the Shopify Admin:
- Redirect URL: `https://{{SHOP_DOMAIN}}/admin/apps/shopbox-dev/channels` (The frontend should handle this route).

---

## 📍 3. Dashboard API Endpoints

### 📡 Get Connection Status & Merchant Info
**Endpoint**: `GET /api/shopify/merchant` 
- Returns the merchant's connection state (`instagramConnected`, `messengerConnected`).
- **Required**: `Authorization` header.

### 📡 Create a Comment Trigger
**Endpoint**: `POST /api/meta/triggers`
- **Payload**:
  ```json
  {
    "keyword": "SHOP",
    "replyComment": true
  }
  ```
- **Required**: `Authorization` header.

### 📡 List Triggers & Stats
**Endpoint**: `GET /api/meta/triggers`
- Returns a list of all active keywords and their usage counts (`triggerCount`).

### 📡 Get Analytics Stats
**Endpoint**: `GET /api/meta/triggers/stats`
- Returns a JSON object with `totalDmsSent`, `activeTriggersCount`, and `conversionPercentage`.

---

## 🎨 4. UI Component Checklist (Polaris)

1. **Automation List Page**: A data table showing keywords, active toggle, and "DMs Sent" count.
2. **Add Trigger Modal**: A form with a text input for the "Keyword" (max 20 chars) and a checkbox for "Public Reply".
3. **Analytics Hero**: A 3-column Layout for "Active Automations", "Total DMs", and "Recent Activity".
4. **Disconnect Action**: A "Disconnect" button in the channel settings that calls `DELETE /api/meta/auth/instagram`.

---

## ⚠️ Important Implementation Notes:
- **Backend URL**: Current Test Ngrok is `https://50ce-2c0f-f8f0-7fda-0-71cd-2db8-dd9a-67d7.ngrok-free.app`.
- **Shopify Bridge**: Always ensure you use `@shopify/app-bridge` to handle the redirect properly within the Frame.
- **Empty States**: If there are no triggers yet, show a friendly empty state suggesting they create their first "Keyword".

─────────────────────────────────────────────────────
**PROJECT:** ShopBoxx Backend & Meta Engine
**Status:** API Definitions Finished.
─────────────────────────────────────────────────────
