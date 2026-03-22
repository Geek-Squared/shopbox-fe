import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  BlockStack, 
  Text, 
  Badge, 
  InlineStack, 
  Banner,
  FooterHelp,
  Link,
  SkeletonBodyText
} from "@shopify/polaris";
import { useLoaderData, useNavigate } from "react-router";
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
  const navigate = useNavigate();

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
  const isConnected = instagramConnected || messengerConnected;

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

  // ─── Loading State ──────────────────────────────────────
  if (loading) {
    return (
      <Page title="Messaging Channels">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={6} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // ─── Onboarding / Welcome View (not connected) ─────────
  if (!isConnected) {
    return (
      <Page>
        <div className="shopbox-welcome-wrapper">
          <div className="shopbox-welcome-card">
            <div className="shopbox-welcome-badge">
              <span className="dot"></span>
              Shopify Integrated
            </div>

            <h1 className="shopbox-welcome-title">
              Welcome, {shop.replace('.myshopify.com', '')}
            </h1>

            <p className="shopbox-welcome-subtitle">
              ShopBox is connected to your Shopify store (USD). Now let's link your Instagram to start automating sales.
            </p>

            <div className="shopbox-welcome-info-grid">
              <div className="shopbox-welcome-info-item">
                <div className="shopbox-welcome-info-label">Store Domain</div>
                <div className="shopbox-welcome-info-value">{shop}</div>
              </div>
              <div className="shopbox-welcome-info-item">
                <div className="shopbox-welcome-info-label">Default Currency</div>
                <div className="shopbox-welcome-info-value">USD ($)</div>
              </div>
            </div>

            <button className="shopbox-welcome-cta" onClick={connectInstagram}>
              <span className="shopbox-welcome-cta-icon">📷</span>
              Connect Instagram →
            </button>
            <div className="shopbox-welcome-secure">
              Secure connection via official Instagram API
            </div>

            <div style={{ marginTop: 16 }}>
              <button 
                className="shopbox-btn-secondary" 
                onClick={connectMessenger}
                style={{ width: '100%' }}
              >
                Or connect Facebook Messenger
              </button>
            </div>

            <div className="shopbox-welcome-footer">
              <a href="#">
                ℹ️ Need help setting up?
              </a>
              <a href="#">
                🔒 Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  // ─── Connected Dashboard View ──────────────────────────
  return (
    <Page title="Messaging Channels">
      <Layout>
        <Layout.Section>
          <div className="shopbox-two-col">
            {/* Main column */}
            <div>
              {/* Instagram Card */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <div className="shopbox-connected-header">
                      <Text variant="headingLg" as="h2">Instagram</Text>
                      {instagramConnected && (
                        <div className="shopbox-connected-badge">
                          <span className="dot"></span> Connected
                        </div>
                      )}
                    </div>
                  </InlineStack>

                  {instagramConnected ? (
                    <>
                      <div className="shopbox-account-row">
                        <div className="shopbox-account-avatar">📷</div>
                        <div className="shopbox-account-info">
                          <div className="shopbox-account-name">@{instagramUsername}</div>
                          <div className="shopbox-account-meta">Last synced: Just now</div>
                        </div>
                        <span className="shopbox-account-link">Account Settings</span>
                      </div>
                      <InlineStack gap="300">
                        <Button onClick={connectInstagram} variant="secondary">Reconnect</Button>
                        <Button onClick={disconnectInstagram} tone="critical" variant="secondary">Disconnect</Button>
                      </InlineStack>
                    </>
                  ) : (
                    <>
                      <Text as="p" tone="subdued">
                        Turn your Instagram DMs into a fully automated shopping catalog.
                      </Text>
                      <Button onClick={connectInstagram} variant="primary">
                        Connect Instagram
                      </Button>
                    </>
                  )}
                </BlockStack>
              </Card>

              {/* Messenger Card */}
              <div style={{ marginTop: 16 }}>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <div className="shopbox-connected-header">
                        <Text variant="headingLg" as="h2">Messenger</Text>
                        {messengerConnected && (
                          <div className="shopbox-connected-badge">
                            <span className="dot"></span> Connected
                          </div>
                        )}
                      </div>
                    </InlineStack>

                    {messengerConnected ? (
                      <>
                        <div className="shopbox-account-row">
                          <div className="shopbox-account-avatar">💬</div>
                          <div className="shopbox-account-info">
                            <div className="shopbox-account-name">{messengerPageName}</div>
                            <div className="shopbox-account-meta">Facebook Business Page</div>
                          </div>
                          <span className="shopbox-account-link">Page Settings</span>
                        </div>
                        <InlineStack gap="300">
                          <Button onClick={connectMessenger} variant="secondary">Reconnect</Button>
                          <Button onClick={disconnectMessenger} tone="critical" variant="secondary">Disconnect</Button>
                        </InlineStack>
                      </>
                    ) : (
                      <>
                        <Text as="p" tone="subdued">
                          Automate orders and support through your Facebook Business Page.
                        </Text>
                        <Button onClick={connectMessenger} variant="primary">
                          Connect Messenger
                        </Button>
                      </>
                    )}
                  </BlockStack>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="shopbox-gradient-card">
                <div className="shopbox-gradient-icon">⚡</div>
                <h3>Channels Overview</h3>
                <p>
                  {instagramConnected && messengerConnected
                    ? "Both channels are connected and actively monitoring for customer messages."
                    : instagramConnected
                      ? "Instagram is active. Consider connecting Messenger to maximize your reach."
                      : messengerConnected
                        ? "Messenger is active. Consider connecting Instagram to maximize your reach."
                        : "Connect at least one channel to begin automating your customer interactions."
                  }
                </p>
              </div>

              <div className="shopbox-sidebar-panel">
                <div className="shopbox-sidebar-title">Connection Status</div>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm">Instagram</Text>
                    <Badge tone={instagramConnected ? "success" : "warning"}>
                      {instagramConnected ? "Active" : "Inactive"}
                    </Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm">Messenger</Text>
                    <Badge tone={messengerConnected ? "success" : "warning"}>
                      {messengerConnected ? "Active" : "Inactive"}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </div>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <FooterHelp>
            Need help connecting your accounts? Visit the{" "}
            <Link url="https://shopify.dev/docs/apps" target="_blank">
              setup guide
            </Link>
          </FooterHelp>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
