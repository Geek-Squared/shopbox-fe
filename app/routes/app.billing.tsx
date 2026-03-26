import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  BlockStack, 
  Text, 
  Badge, 
  InlineStack, 
  Divider,
  Icon,
  FooterHelp,
  Link,
  SkeletonBodyText,
  Banner,
  Box
} from "@shopify/polaris";
import { CheckCircleIcon, StarIcon } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

const BACKEND_URL = "https://shopbox-shopify-api-production.up.railway.app";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

interface BillingData {
  planName: string;
  planStatus: string;
  trialDaysLeft?: number;
}

export default function Billing() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

  const fetchBillingStatus = async () => {
    try {
      const idToken = await shopify.idToken();
      const res = await fetch(`${BACKEND_URL}/api/shopify/billing/status?shop=${shop}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      const data = await res.json();
      setBilling(data);
      setLoading(false);
    } catch (err) {
      console.error("Billing load failed:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingStatus();
  }, [shopify, shop]);

  const handleSubscribe = async (plan: string) => {
    setSubmittingPlan(plan);
    try {
      const idToken = await shopify.idToken();
      const response = await fetch(`${BACKEND_URL}/api/shopify/billing/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify({ plan })
      });

      const data = await response.json();
      
      if (data.confirmationUrl) {
         window.open(data.confirmationUrl, "_top");
      } else {
        shopify.toast.show("Failed to generate checkout link", { isError: true });
      }
    } catch (err) {
      console.error("Subscription failed:", err);
      shopify.toast.show("Server error during billing setup", { isError: true });
    } finally {
      setSubmittingPlan(null);
    }
  };

  if (loading) {
    return (
      <Page title="Billing & Plans">
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

  const isActive = billing?.planStatus === 'ACTIVE';

  const FeatureItem = ({ text, iconTone, isBold }: { text: string, iconTone: any, isBold?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon source={CheckCircleIcon} tone={iconTone} />
      </div>
      <Text as="span" variant="bodyMd" fontWeight={isBold ? "bold" : "regular"}>{text}</Text>
    </div>
  );

  return (
    <Page title="Billing & Plans" subtitle="Select a plan that scales with your store. No hidden fees.">
      <Layout>
        {isActive && (
          <Layout.Section>
            <Banner 
              title={`You are currently on the Shopbox ${billing?.planName} Plan`}
              tone="success"
            >
              <p>Your bot is fully active and automating your social sales. Thank you for choosing Shopbox!</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* BASIC PLAN */}
            <Card padding="500">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingLg" as="h3">Basic</Text>
                  {billing?.planName === 'BASIC' && <Badge tone="success">Your Current Plan</Badge>}
                </InlineStack>
                
                <InlineStack gap="100" blockAlign="end">
                  <Text variant="heading3xl" as="span">$19.99</Text>
                  <Text variant="bodyMd" as="span" tone="subdued">/ month</Text>
                </InlineStack>

                <Text as="p" tone="subdued">Perfect for small stores starting their automation journey.</Text>
                
                <Divider />

                <div style={{ marginTop: '4px' }}>
                  <FeatureItem text="Up to 500 automated DMs" iconTone="success" />
                  <FeatureItem text="Unlimited Comment Mentions" iconTone="success" />
                  <FeatureItem text="Instagram + Facebook Auth" iconTone="success" />
                  <FeatureItem text="7-Day Free Trial" iconTone="success" />
                </div>

                {!isActive && (
                  <Button 
                    fullWidth 
                    size="large" 
                    onClick={() => handleSubscribe('BASIC')}
                    loading={submittingPlan === 'BASIC'}
                  >
                    Start 7-Day Trial
                  </Button>
                )}
              </BlockStack>
            </Card>

            {/* PRO PLAN */}
            <Card padding="500">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={StarIcon} tone="info" />
                    <Text variant="headingLg" as="h3">Pro</Text>
                  </InlineStack>
                  {billing?.planName === 'PRO' ? (
                    <Badge tone="success">Your Current Plan</Badge>
                  ) : (
                    <Badge tone="info">Most Popular</Badge>
                  )}
                </InlineStack>
                
                <InlineStack gap="100" blockAlign="end">
                  <Text variant="heading3xl" as="span">$49.99</Text>
                  <Text variant="bodyMd" as="span" tone="subdued">/ month</Text>
                </InlineStack>

                <Text as="p" tone="subdued">Designed for high-volume stores needing scale and data.</Text>
                
                <Divider />

                <div style={{ marginTop: '4px' }}>
                  <FeatureItem text="Unlimited Automated DMs" iconTone="info" isBold />
                  <FeatureItem text="Advanced Post Automations" iconTone="info" />
                  <FeatureItem text="Priority Live Support" iconTone="info" />
                  <FeatureItem text="14-Day Free Trial" iconTone="info" />
                </div>

                {billing?.planName !== 'PRO' && (
                  <div style={{ marginTop: '8px' }}>
                    <button 
                      className="shopbox-btn-primary" 
                      style={{ width: '100%', height: '44px', fontSize: '16px', cursor: 'pointer' }}
                      onClick={() => handleSubscribe('PRO')}
                      disabled={!!submittingPlan}
                    >
                      {submittingPlan === 'PRO' ? "Processing..." : "Upgrade to Pro →"}
                    </button>
                  </div>
                )}
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h4">Frequently Asked Questions</Text>
                
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold" as="p">Can I change plans at any time?</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">Yes! When you upgrade or downgrade, Shopify will automatically handle the prorated adjustment on your next bill.</Text>
                </BlockStack>

                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold" as="p">How does the 14-day trial work?</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">You won't be charged for your first 14 days. If you uninstall before the trial ends, you pay nothing.</Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <FooterHelp>
            Have more questions? Visit our{" "}
            <Link url="https://shopify.dev/docs/apps" target="_blank">
              Billing FAQ & Support
            </Link>
          </FooterHelp>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
