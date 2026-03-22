import { Page, Layout, Card, Button, BlockStack, Text, Badge, InlineStack, Banner } from "@shopify/polaris";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";

const BACKEND_URL = "https://grateful-unbefriended-lorrine.ngrok-free.dev";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function Channels() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [data, setData] = useState({
    messengerConnected: false,
    instagramConnected: false,
    messengerPageName: "",
    instagramUsername: "",
    loading: true
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const idToken = await shopify.idToken();
        const res = await fetch(`${BACKEND_URL}/api/shopify/merchant?shop=${shop}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "ngrok-skip-browser-warning": "true" 
          }
        });
        const merchant = await res.json();
        
        setData({
          messengerConnected: merchant.messengerConnected || false,
          instagramConnected: merchant.instagramConnected || false,
          messengerPageName: merchant.messengerPageName || "",
          instagramUsername: merchant.instagramUsername || "",
          loading: false
        });
      } catch (err) {
        console.error("Merchant data load failed:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
    interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [shopify, shop]);

  const { messengerConnected, instagramConnected, messengerPageName, instagramUsername, loading } = data;

  const connectMessenger = () => {
    window.open(`${BACKEND_URL}/api/meta/auth/messenger?shop=${shop}`, "_blank");
  };

  const connectInstagram = () => {
    window.open(`${BACKEND_URL}/api/meta/auth/instagram?shop=${shop}`, "_blank");
  };

  const disconnectMessenger = async () => {
    try {
      const idToken = await shopify.idToken();
      const res = await fetch(`${BACKEND_URL}/api/meta/auth/messenger?shop=${shop}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      if (res.ok) {
        shopify.toast.show("Messenger disconnected successfully");
        setData(prev => ({ ...prev, messengerConnected: false, messengerPageName: "" }));
      } else {
        shopify.toast.show("Failed to disconnect Messenger", { isError: true });
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      shopify.toast.show("Error connecting to server", { isError: true });
    }
  };

  const disconnectInstagram = async () => {
    try {
      const idToken = await shopify.idToken();
      const res = await fetch(`${BACKEND_URL}/api/meta/auth/instagram?shop=${shop}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      if (res.ok) {
        shopify.toast.show("Instagram disconnected successfully");
        setData(prev => ({ ...prev, instagramConnected: false, instagramUsername: "" }));
      } else {
        shopify.toast.show("Failed to disconnect Instagram", { isError: true });
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      shopify.toast.show("Error connecting to server", { isError: true });
    }
  };

  return (
    <Page title="Messaging Channels">
      <Layout>
        {(!messengerConnected || !instagramConnected) && (
          <Layout.Section>
            <Banner title="Connection Required" tone="warning">
              <p>Connect your business accounts to start automating your chat commerce.</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">Facebook Messenger</Text>
                  {messengerPageName && (
                    <Text variant="bodySm" as="p" tone="subdued">Page: {messengerPageName}</Text>
                  )}
                </BlockStack>
                <Badge tone={messengerConnected ? "success" : "warning"}>
                  {messengerConnected ? "Connected" : "Not Connected"}
                </Badge>
              </InlineStack>
              <Text as="p" tone="subdued">
                Automate orders and support through your Facebook Business Page.
              </Text>
              <InlineStack gap="300">
                <Button onClick={connectMessenger} variant={messengerConnected ? "secondary" : "primary"}>
                  {messengerConnected ? "Reconnect Messenger" : "Connect Messenger"}
                </Button>
                {messengerConnected && (
                  <Button onClick={disconnectMessenger} tone="critical" variant="secondary">
                    Disconnect
                  </Button>
                )}
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">Instagram Business</Text>
                  {instagramUsername && (
                    <Text variant="bodySm" as="p" tone="subdued">Account: @{instagramUsername}</Text>
                  )}
                </BlockStack>
                <Badge tone={instagramConnected ? "success" : "warning"}>
                  {instagramConnected ? "Connected" : "Not Connected"}
                </Badge>
              </InlineStack>
              <Text as="p" tone="subdued">
                Turn your Instagram DMs into a fully automated shopping catalog.
              </Text>
              <InlineStack gap="300">
                <Button onClick={connectInstagram} variant={instagramConnected ? "secondary" : "primary"}>
                  {instagramConnected ? "Reconnect Instagram" : "Connect Instagram"}
                </Button>
                {instagramConnected && (
                  <Button onClick={disconnectInstagram} tone="critical" variant="secondary">
                    Disconnect
                  </Button>
                )}
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
