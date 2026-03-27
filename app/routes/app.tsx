import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider, Box, InlineStack, Button } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/channels">Channels</s-link>
        <s-link href="/app/automation">Automation</s-link>
        <s-link href="/app/post-automations">Post Automations</s-link>
        <s-link href="/app/billing">Pricing & Billing</s-link>
      </s-app-nav>
      <Outlet />
      <Box paddingBlockStart="800" paddingBlockEnd="400">
        <InlineStack align="center">
          <Button variant="tertiary" url="/policy">
            Privacy Policy
          </Button>
        </InlineStack>
      </Box>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
