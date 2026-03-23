# 🚀 Comment-to-DM Frontend Implementation Guide

This guide outlines exactly what the frontend team needs to build to fully support the new **"Comment-to-Checkout"** feature. 

The backend infrastructure and database models for this feature are **100% complete and live**. The bot is already programmed to send a beautiful, interactive product card directly to the user's DM when a match is found. 

All that is left is the UI for the merchant to create these mappings!

---

## 🎯 The Goal

Create a new page in the Shopify Dashboard called **"Post Automations"** (or add a tab within the existing automation settings). 
This page allows merchants to paste a Facebook or Instagram post URL and select which Shopify product it corresponds to.

---

## 🔌 API Endpoints Available

The backend API is fully protected by the standard `ShopifyAuthGuard`. You must pass the Shopify session token in the `Authorization: Bearer <token>` header, just like all other requests.

### 1. List All Mappings
**`GET /api/meta/post-mappings`**
Returns an array of all active and inactive post-to-product mappings for this merchant.

**Response Example:**
```json
[
  {
    "id": "cuid123",
    "merchantId": "merchant_cuid",
    "platform": "facebook",
    "postUrl": "https://www.facebook.com/photo/?fbid=123456",
    "mediaId": "1060394393815353_123456",
    "shopifyProductId": "8824789926086",
    "productTitle": "Orange Snowboard",
    "isActive": true,
    "createdAt": "2026-03-22T21:00:00.000Z"
  }
]
```

### 2. Create a New Mapping
**`POST /api/meta/post-mappings`**
Creates a new mapping. Notice you **do not** need to send the exact `mediaId` for Facebook; the backend will extract it from the `postUrl` automatically!

**Payload:**
```json
{
  "postUrl": "https://www.facebook.com/photo/?fbid=123456789...",
  "platform": "facebook", // or "instagram"
  "shopifyProductId": "8824789926086"
}
```

### 3. Update an Existing Mapping
**`PUT /api/meta/post-mappings/:id`**
Used to toggle a mapping on/off (`isActive`) or change the linked product.

**Payload:**
```json
{
  "isActive": false,
  "shopifyProductId": "999999999" // Optional
}
```

### 4. Delete a Mapping
**`DELETE /api/meta/post-mappings/:id`**
Permanently removes the mapping.

---

## 🖥️ UI Components Needed

### 1. The "Post Automations" Dashboard
A simple, clean table or list view showing all current mappings.

**Columns/Data to display:**
- **Platform Icon:** Facebook or Instagram logo
- **Post:** A clickable link to the original `postUrl` (maybe truncated or showing "View Post ↗")
- **Linked Product:** The `productTitle`
- **Status Toggle:** A switch tied to the `PUT` endpoint to quickly pause/resume (`isActive`) tracking for this post
- **Actions:** A trash can icon to `DELETE` the mapping

**Empty State:**
If no mappings exist, show a friendly illustration and a "Create your first automation" button.

### 2. The "Link New Post" Modal
When the merchant clicks "Link New Post", open a modal with a simple form.

**Form Fields:**
1. **Platform Selector (Radio/Dropdown):**
   - Options: `Facebook`, `Instagram`
2. **Post URL (Text Input):**
   - Placeholder: `https://www.facebook.com/photo/?fbid=...`
3. **Product Selector (ResourcePicker / Searchable Dropdown):**
   - A dropdown that searches the merchant's Shopify products (you can reuse the existing Shopify product picker component or API).
   - Needs to capture the `shopifyProductId`.

**Submit Action:**
- When hitting "Save", shoot the `POST /api/meta/post-mappings` request with the selected data.
- Show a success toast, close the modal, and refresh the dashboard list.

---

## ⚠️ Important Edge Cases & Tips for Frontend

1. **Facebook URLs:**
   Merchants will paste extremely messy URLs. 
   Examples: 
   - `https://www.facebook.com/permalink.php?story_fbid=123&id=456`
   - `https://www.facebook.com/photo/?fbid=123&set=a.456`
   
   *Good news:* The backend `PostMappingService` is already heavily armored to parse these string formats. The frontend literally just needs to send the raw URL over.

2. **Wait, what if the backend URL parser fails?**
   If the backend cannot extract the ID from the URL, the `POST` endpoint will return a `409 Conflict` or `400 Bad Request` with a message like *"Could not extract Facebook post ID"*. 
   *Action:* The frontend should catch this error and display the message to the merchant, asking them to try a different URL format for that post.

3. **Instagram Support (Phase 2):**
   Currently, the backend expects the exact `mediaId` for Instagram in the `postUrl` field because we haven't implemented the Graph API URL resolution yet. Focus the UI mainly on **Facebook** first, or add a warning that Instagram URLs require the direct media ID for now (until the backend oEmbed resolver is pushed).

4. **Product Picker:**
   Shopify's App Bridge has a native `ResourcePicker` for products. This is highly recommended to use because it gives a beautiful, native Shopify UI for selecting the product without you having to build a custom search dropdown! 
   *(Extract the numeric ID from the global URI `gid://shopify/Product/123456789` before sending to our backend).*

---

## 🎨 Visual Example

```text
┌────────────────────────────────────────────────────────┐
│  Post Automations                                      │
│                                                        │
│  [+ Link New Post]                                     │
│                                                        │
│  PLATFORM     POST           PRODUCT           STATUS  │
│  ----------------------------------------------------  │
│  [FB Icon]    View Post ↗    Orange Snowboard  [ ON]   │
│  [IG Icon]    View Post ↗    Red Dress         [OFF]   │
└────────────────────────────────────────────────────────┘
```

This feature is going to massively increase conversion rates! Let me know if the frontend team has any API questions.
