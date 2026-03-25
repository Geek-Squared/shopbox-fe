import { 
  Page, 
  Layout, 
  Card, 
  Text, 
  BlockStack, 
  Badge, 
  InlineStack, 
  Banner,
  FooterHelp,
  Link,
  SkeletonBodyText,
  EmptyState
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

export default function Index() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDmsSent: 0,
    activeTriggersCount: 0,
    conversionPercentage: "--%",
    shop: shop
  });

  const [channelData, setChannelData] = useState({
    instagramConnected: false,
    instagramUsername: "",
    messengerConnected: false,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const idToken = await shopify.idToken();
        const headers = {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        };

        const [statsRes, merchantRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/meta/triggers/stats?shop=${shop}`, { headers }),
          fetch(`${BACKEND_URL}/api/shopify/merchant?shop=${shop}`, { headers })
        ]);

        const statsData = await statsRes.json();
        const merchantData = await merchantRes.json();

        setStats({ ...statsData, shop });
        setChannelData({
          instagramConnected: merchantData.instagramConnected || false,
          instagramUsername: merchantData.instagramUsername || "",
          messengerConnected: merchantData.messengerConnected || false,
        });
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [shopify, shop]);

  const isConnected = channelData.instagramConnected || channelData.messengerConnected;

  return (
    <Page title="Shopbox Dashboard">
      <Layout>
        {/* Top Banner (only when no channels connected) */}
        {!loading && !isConnected && (
          <Layout.Section>
            <Card padding="0">
              <EmptyState
                heading="You're just one step away"
                action={{ content: 'Connect Channels', onAction: () => navigate('/app/channels') }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>To start automating your sales, you need to connect your store with Instagram or Messenger first.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        )}

        {/* Main content + Sidebar */}
        <Layout.Section>
          <div className="shopbox-two-col">
            {/* LEFT COLUMN — Main content */}
            <div>
              {/* Connected Account Row */}
              {isConnected && (
                <div className="shopbox-account-row" style={{ marginBottom: 20 }}>
                  <div className="shopbox-account-avatar">📷</div>
                  <div className="shopbox-account-info">
                    <div className="shopbox-account-name">
                      {channelData.instagramUsername 
                        ? `@${channelData.instagramUsername}` 
                        : shop}
                    </div>
                    <div className="shopbox-account-meta">Last synced: Just now</div>
                  </div>
                  <span 
                    className="shopbox-account-link"
                    onClick={() => navigate('/app/channels')}
                  >
                    Account Settings
                  </span>
                </div>
              )}

              {/* Stats Row */}
              <div className="shopbox-stats-grid" style={{ marginBottom: 24 }}>
                <div className="shopbox-stat-card">
                  <Card>
                    <BlockStack gap="200">
                      <span className="shopbox-stat-label">Total Replies</span>
                      {loading ? (
                        <SkeletonBodyText lines={1} />
                      ) : (
                        <span className="shopbox-stat-value">{stats.totalDmsSent}</span>
                      )}
                    </BlockStack>
                  </Card>
                </div>

                <div className="shopbox-stat-card">
                  <Card>
                    <BlockStack gap="200">
                      <span className="shopbox-stat-label">Conversion</span>
                      {loading ? (
                        <SkeletonBodyText lines={1} />
                      ) : (
                        <span className="shopbox-stat-value">{stats.conversionPercentage}</span>
                      )}
                    </BlockStack>
                  </Card>
                </div>

                <div className="shopbox-stat-card">
                  <Card>
                    <BlockStack gap="200">
                      <span className="shopbox-stat-label">Revenue</span>
                      {loading ? (
                        <SkeletonBodyText lines={1} />
                      ) : (
                        <span className="shopbox-stat-value">$0.00</span>
                      )}
                    </BlockStack>
                  </Card>
                </div>
              </div>

              {/* Automations Section */}
              <div className="shopbox-section-header">
                <span className="shopbox-section-title">Automations Active</span>
                <button 
                  className="shopbox-section-action"
                  onClick={() => navigate('/app/automation')}
                >
                  Live Monitor
                </button>
              </div>

              {(stats.activeTriggersCount > 0) ? (
                <div className="shopbox-triggers-grid">
                  <div className="shopbox-trigger-card">
                    <div className="shopbox-trigger-header">
                      <div className="shopbox-trigger-icon">🏷️</div>
                      <div className="shopbox-trigger-toggle">
                        ON <div className="toggle-dot"></div>
                      </div>
                    </div>
                    <div className="shopbox-trigger-title">Trigger: PRICE</div>
                    <p className="shopbox-trigger-desc">Sends product details when customers ask for pricing.</p>
                    <div className="shopbox-trigger-preview">
                      "Hey! Thanks for your interest in {shop}. The price for this item is $49.00. Check it out here: [Link]"
                    </div>
                  </div>

                  <div className="shopbox-trigger-card">
                    <div className="shopbox-trigger-header">
                      <div className="shopbox-trigger-icon">🔗</div>
                      <div className="shopbox-trigger-toggle">
                        ON <div className="toggle-dot"></div>
                      </div>
                    </div>
                    <div className="shopbox-trigger-title">Trigger: LINK</div>
                    <p className="shopbox-trigger-desc">Automatically shares the product URL upon request.</p>
                    <div className="shopbox-trigger-preview">
                      "Of course! You can find everything from our latest collection right here: [Link]. Happy shopping!"
                    </div>
                  </div>

                  <div className="shopbox-trigger-card">
                    <div className="shopbox-trigger-header">
                      <div className="shopbox-trigger-icon">🛒</div>
                      <div className="shopbox-trigger-toggle">
                        ON <div className="toggle-dot"></div>
                      </div>
                    </div>
                    <div className="shopbox-trigger-title">Trigger: BUY</div>
                    <p className="shopbox-trigger-desc">Drives immediate checkout for high-intent comments.</p>
                    <div className="shopbox-trigger-preview">
                      "Great choice! We've DM'd you a direct checkout link from {shop} to make it easy for you!"
                    </div>
                  </div>
                </div>
              ) : (
                <div className="shopbox-empty-automations">
                  <BlockStack gap="400" align="center">
                    <div style={{ fontSize: '48px', textAlign: 'center' }}>🤖</div>
                    <Text as="p" fontWeight="medium" variant="bodyMd" tone="subdued">No active automation triggers.</Text>
                    <button className="shopbox-btn-secondary" onClick={() => navigate('/app/automation')}>
                      Initialize Triggers Now
                    </button>
                  </BlockStack>
                </div>
              )}

              {/* Footer CTA */}
              <div className="shopbox-footer-cta">
                Need to customize these messages? Head over to{" "}
                <button onClick={() => navigate('/app/automation')}>Automation Settings</button>
              </div>
            </div>

            {/* RIGHT COLUMN — Status Sidebar */}
            <div>
              {/* System Status Gradient Card */}
              <div className="shopbox-gradient-card" style={{ marginBottom: 16 }}>
                <div className="shopbox-gradient-icon">⚡</div>
                <h3>System Active</h3>
                <p>
                  {isConnected
                    ? "Merchant Store is monitoring mentions. No further configuration is required to start capturing leads."
                    : "Connect a messaging channel to activate your automation system."}
                </p>
              </div>

              {/* Connected Store Info */}
              <div className="shopbox-sidebar-panel">
                <div className="shopbox-sidebar-title">Connected Store</div>
                <div className="shopbox-sidebar-status">
                  <span className="dot"></span> {shop}
                </div>
                <InlineStack gap="200">
                  <Badge tone="success">Running</Badge>
                  <Badge>API v2025.01</Badge>
                </InlineStack>
              </div>

              {/* Quick Actions */}
              <div className="shopbox-sidebar-panel">
                <div className="shopbox-sidebar-title">Quick Actions</div>
                <BlockStack gap="300">
                  <button 
                    className="shopbox-btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => navigate('/app/automation')}
                  >
                    Manage Keywords
                  </button>
                  <button 
                    className="shopbox-btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => navigate('/app/channels')}
                  >
                    Channel Settings
                  </button>
                </BlockStack>
              </div>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <FooterHelp>
            Need help? Visit the{" "}
            <Link url="https://shopify.dev/docs/apps" target="_blank">
              Shopbox documentation
            </Link>
          </FooterHelp>
        </Layout.Section>
      </Layout>
    </Page>
  );
}