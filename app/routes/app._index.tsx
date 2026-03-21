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
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const BACKEND_URL = "https://grateful-unbefriended-lorrine.ngrok-free.dev";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Real implementation: call GET /api/meta/triggers/stats with session token
  const stats = {
    totalDmsSent: "4,212",
    activeTriggersCount: "8",
    conversionPercentage: "12%",
    shop: session.shop
  };
  
  return { stats };
};

export default function Index() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <Page title="Shopbox Dashboard">
      <Layout>
        <Layout.Section>
          <Banner title="Automation Active" tone="success">
            <p>Your bot is currently monitoring Instagram and Facebook Messenger for keywords.</p>
          </Banner>
        </Layout.Section>

        {/* Analytics Hero - 3 Columns */}
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
                  <Text variant="bodyXs" as="p" tone="success">+15% from last week</Text>
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
                  <Text variant="bodyXs" as="p" tone="success">Above average</Text>
                </BlockStack>
              </Card>
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card title="Quick Actions">
            <BlockStack gap="400">
              <Button url="/app/automation" variant="primary">Manage Keywords</Button>
              <Button url="/app/channels" variant="secondary">Channel Settings</Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="Recent Activity">
            <List type="bullet">
              <List.Item>Bot replied to customer "Sarah" via Instagram (Keyword: SHOP)</List.Item>
              <List.Item>Facebook Messenger channel connected successfully</List.Item>
              <List.Item>New orders generated via catalog interaction +3 today</List.Item>
            </List>
          </Card>
        </Layout.Section>

        <Layout.Section variant="aside">
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