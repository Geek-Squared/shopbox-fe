import { Page, Layout, Card, Button, BlockStack, Text, Badge, InlineStack, Banner } from "@shopify/polaris";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const BACKEND_URL = "https://grateful-unbefriended-lorrine.ngrok-free.dev";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // In a real implementation, we would fetch connection status from the backend here
  // For now, we mock the status or assume it's coming from an upcoming API call
  return { shop: session.shop };
};

export default function Channels() {
  const { shop } = useLoaderData<typeof loader>();

  const connectMessenger = () => {
    window.open(`${BACKEND_URL}/api/meta/auth/messenger?shop=${shop}`, "_blank");
  };

  const connectInstagram = () => {
    window.open(`${BACKEND_URL}/api/meta/auth/instagram?shop=${shop}`, "_blank");
  };

  return (
    <Page title="Messaging Channels">
      <Layout>
        <Layout.Section>
          <Banner title="Connection Required" tone="warning">
            <p>Connect your business accounts to start automating your chat commerce.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">Facebook Messenger</Text>
                <Badge tone="warning">Not Connected</Badge>
              </InlineStack>
              <Text as="p" tone="subdued">
                Automate orders and support through your Facebook Business Page.
              </Text>
              <Button onClick={connectMessenger} variant="primary">
                Connect Messenger
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">Instagram Business</Text>
                <Badge tone="warning">Not Connected</Badge>
              </InlineStack>
              <Text as="p" tone="subdued">
                Turn your Instagram DMs into a fully automated shopping catalog.
              </Text>
              <Button onClick={connectInstagram} variant="primary">
                Connect Instagram
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
