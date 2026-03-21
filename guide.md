# 🚀 Quickstart: The "Developer Loop" (Build & See Changes)

This guide shows you exactly where to look and how to see your app live in your browser.

---

## 🛠️ Phase 1: See your App UI Right Now
Before writing any more code, make sure you can see the app.

1.  **In your terminal**, ensure `shopify app dev` is running.
2.  **Press the `P` key** on your keyboard in that terminal.
3.  Your browser will open your Shopify Development Store.
4.  If asked, click **Install App**.
5.  You should now see the "App index" screen. **This is your UI.**

---

## 🏗️ Phase 2: The Main File
The home page of your app is located at:
👉 [**app/routes/app._index.tsx**](file:///Users/mosesngwerume/Downloads/STUFF/shopbox-app/shopbox/app/routes/app._index.tsx)

**Try this simple test to validate your dev loop:**
1.  Open `app/routes/app._index.tsx`.
2.  Look for the `<TitleBar title="App index" />` (usually around line 35).
3.  Change it to `<TitleBar title="Product Discovery Dashboard" />`.
4.  **Save the file.**
5.  Check your browser. The header should change automatically. **Congratulations! You just validated your first UI change.**

---

## 📊 Phase 3: Listing Your Store's Products

To show your current products, we need to modify two parts of `app._index.tsx`:

### 1. The Server (The Loader)
The `loader` function fetches data from Shopify **before** the page loads.

```typescript
// Replace your current loader with this:
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // This is a GraphQL query to get the first 10 products
  const response = await admin.graphql(`
    #graphql
    query getProducts {
      products(first: 10) {
        nodes {
          id
          title
          handle
        }
      }
    }
  `);

  const { data } = await response.json();
  return { products: data.products.nodes };
};
```

### 2. The UI (The Component)
Use the `useLoaderData` hook to display those products.

```tsx
export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Store Inventory" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">Your Current Products:</Text>
              <List type="bullet">
                {products.map((product: any) => (
                  <List.Item key={product.id}>{product.title}</List.Item>
                ))}
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## ✅ Phase 4: Validating the Data
1.  Go to your **Shopify Admin** (not the app, the actual store admin).
2.  Add a new product (e.g., "Shiny New Gadget").
3.  Go back to **your app** in the browser.
4.  Refresh the page.
5.  If "Shiny New Gadget" appears in your list, **you have successfully connected your app to the store's data!**

---

## 💡 Key Files to Know
*   [**shopify.app.toml**](file:///Users/mosesngwerume/Downloads/STUFF/shopbox-app/shopbox/shopify.app.toml): Change app name, URLs, and permissions (scopes).
*   [**app/shopify.server.ts**](file:///Users/mosesngwerume/Downloads/STUFF/shopbox-app/shopbox/app/shopify.server.ts): Configuration for how your app talks to Shopify.
*   [**prisma/schema.prisma**](file:///Users/mosesngwerume/Downloads/STUFF/shopbox-app/shopbox/prisma/schema.prisma): How your app's private database is structured.
