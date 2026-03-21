import { 
  Page, 
  Layout, 
  Card, 
  Grid, 
  Text, 
  BlockStack, 
  Badge, 
  InlineStack, 
  Button, 
  Banner,
  List,
  Icon
} from "@shopify/polaris";
import { ChatIcon, OrderIcon, ProfileIcon } from "@shopify/polaris-icons";
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
  
  const [stats, setStats] = useState({
    totalDmsSent: "...",
    activeTriggersCount: "...",
    conversionPercentage: "...",
    shop: shop
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const idToken = await shopify.idToken();
        const res = await fetch(`${BACKEND_URL}/api/meta/triggers/stats?shop=${shop}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "ngrok-skip-browser-warning": "true" 
          }
        });
        const data = await res.json();
        setStats({ ...data, shop });
      } catch (err) {
        console.error("Stats load failed:", err);
      }
    };
    fetchStats();
  }, [shopify, shop]);

  return (
    <Page title="Shopbox Dashboard">
      <Layout>
        <Layout.Section>
          <Banner 
            title="Next Step: Add Keywords" 
            tone="info"
            action={{ content: 'Add Keyword Trigger', onAction: () => navigate('/app/automation') }}
          >
            <p>To start automating your sales, you need to add "Keywords" that the bot will listen for in your DMs.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 4 }}>
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingSm" as="h3">Total DMs Sent</Text>
                    <Icon source={ChatIcon} tone="base" />
                  </InlineStack>
                  <Text variant="headingLg" as="p">{stats.totalDmsSent}</Text>
                  <Text variant="bodyXs" as="p" tone="success">+0% from last week</Text>
                </BlockStack>
              </Card>
            </Grid.Cell>
            
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 4 }}>
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingSm" as="h3">Active Keywords</Text>
                    <Icon source={OrderIcon} tone="base" />
                  </InlineStack>
                  <Text variant="headingLg" as="p">{stats.activeTriggersCount}</Text>
                  <Text variant="bodyXs" as="p" tone="subdued">Across all channels</Text>
                </BlockStack>
              </Card>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 4 }}>
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingSm" as="h3">Checkout Conversion</Text>
                    <Icon source={ProfileIcon} tone="base" />
                  </InlineStack>
                  <Text variant="headingLg" as="p">{stats.conversionPercentage}</Text>
                  <Text variant="bodyXs" as="p" tone="success">Active</Text>
                </BlockStack>
              </Card>
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card padding="400">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Quick Actions</Text>
              <Button onClick={() => navigate("/app/automation")} variant="primary">Manage Keywords</Button>
              <Button onClick={() => navigate("/app/channels")} variant="secondary">Channel Settings</Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="400">
            <Text variant="headingMd" as="h2">Recent Activity</Text>
            <List type="bullet">
              <List.Item>Bot is ready to monitor your connected channels.</List.Item>
              <List.Item>Connect Instagram and Messenger in the Channels tab.</List.Item>
            </List>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">Connected Store</Text>
              <Text as="p" tone="subdued">{stats.shop}</Text>
              <InlineStack gap="200">
                <Badge tone="success">Running</Badge>
                <Badge tone="info">API v2025.01</Badge>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}