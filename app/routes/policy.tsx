import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Divider,
  Box,
  InlineStack,
  Button,
} from "@shopify/polaris";
import { useNavigate } from "react-router";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Page>
      <Box paddingBlockEnd="400">
        <InlineStack align="start">
          <Button variant="tertiary" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </InlineStack>
      </Box>

      <Layout>
        <Layout.Section>
          <Card padding="600">
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text variant="heading2xl" as="h1">
                  Privacy Policy
                </Text>
                <Text variant="bodyMd" tone="subdued">
                  Last updated: March 26, 2026
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  1. Introduction
                </Text>
                <Text as="p" variant="bodyMd">
                  ShopBox ("we", "our", or "us") is a multi-channel commerce automation platform that integrates with Shopify to help merchants manage customer engagement across Instagram, Messenger, and WhatsApp. This Privacy Policy explains how we collect, use, store, and protect information when you install and use the ShopBox Shopify app.
                </Text>
                <Text as="p" variant="bodyMd">
                  By installing ShopBox, you ("the Merchant") agree to the practices described in this policy.
                </Text>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  2. Information We Collect
                </Text>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    2.1 Merchant Information
                  </Text>
                  <Text as="p" variant="bodyMd">
                    When you install ShopBox, we collect:
                  </Text>
                  <ul>
                    <li>Your Shopify store domain and access token</li>
                    <li>Store name and configuration</li>
                    <li>Connected channel credentials (Instagram, Messenger, WhatsApp tokens and account IDs)</li>
                    <li>Billing and subscription status</li>
                  </ul>
                </BlockStack>

                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    2.2 Customer Data
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Through your store's interactions, we may process:
                  </Text>
                  <ul>
                    <li>Customer name, phone number, and email address (from orders)</li>
                    <li>Delivery address</li>
                    <li>Order history and status</li>
                    <li>WhatsApp message content (inbound and outbound)</li>
                    <li>Instagram commenter ID and username</li>
                    <li>Bot conversation state and context</li>
                  </ul>
                </BlockStack>

                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    2.3 Automatically Collected Data
                  </Text>
                  <ul>
                    <li>IP addresses (stored in audit logs)</li>
                    <li>Webhook event data from Shopify and Meta</li>
                    <li>Timestamps of all interactions</li>
                  </ul>
                </BlockStack>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  3. How We Use Information
                </Text>
                <Text as="p" variant="bodyMd">
                  We use the information collected to:
                </Text>
                <ul>
                  <li>Operate the ShopBox platform and deliver its features</li>
                  <li>Automate responses to Instagram comments and Messenger/WhatsApp messages on your behalf</li>
                  <li>Process and track orders placed through your store</li>
                  <li>Send order notifications to your customers via WhatsApp</li>
                  <li>Maintain audit logs for security and debugging</li>
                  <li>Provide billing and subscription management</li>
                  <li>Improve the platform's reliability and performance</li>
                </ul>
                <Text as="p" variant="bodyMd">
                  We do <strong>not</strong> sell your data or your customers' data to third parties.
                </Text>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  4. Data Sharing and Third Parties
                </Text>
                <Text as="p" variant="bodyMd">
                  To operate ShopBox, we share data with the following third-party services:
                </Text>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e1e3e5",
                        }}
                      >
                        <th style={{ padding: "12px 8px" }}>Service</th>
                        <th style={{ padding: "12px 8px" }}>Purpose</th>
                        <th style={{ padding: "12px 8px" }}>Data Shared</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f2f3" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <strong>Shopify</strong>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          E-commerce platform integration
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          Store tokens, product and order data
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f2f3" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <strong>Meta (Facebook/Instagram)</strong>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          Instagram and Messenger automation
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          Page tokens, Instagram account IDs, message content
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f2f3" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <strong>Twilio / WhatsApp</strong>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          WhatsApp messaging and OTP verification
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          Customer phone numbers, message content
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f2f3" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <strong>Resend</strong>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          Email notifications (optional)
                        </td>
                        <td style={{ padding: "12px 8px" }}>Email addresses</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f2f3" }}>
                        <td style={{ padding: "12px 8px" }}>
                          <strong>Amazon Web Services (RDS)</strong>
                        </td>
                        <td style={{ padding: "12px 8px" }}>Database hosting</td>
                        <td style={{ padding: "12px 8px" }}>All stored data</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "12px 8px" }}>
                          <strong>Railway</strong>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          Application hosting
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          All data in transit
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  5. Data Retention
                </Text>
                <ul>
                  <li>
                    <strong>Merchant data</strong> is retained for the duration of
                    your subscription and deleted upon a valid shop redact request
                    (see Section 7).
                  </li>
                  <li>
                    <strong>Customer data</strong> (orders, messages) is retained to
                    support your business operations. Personal identifiers are
                    anonymized upon a valid customer redact request.
                  </li>
                  <li>
                    <strong>Bot session data and OTP codes</strong> are deleted as
                    soon as they are no longer needed.
                  </li>
                  <li>
                    <strong>Audit logs</strong> are retained for up to 12 months.
                  </li>
                </ul>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  6. Data Security
                </Text>
                <Text as="p" variant="bodyMd">
                  We implement the following measures to protect your data:
                </Text>
                <ul>
                  <li>All data is transmitted over TLS (HTTPS)</li>
                  <li>Database connections are encrypted using SSL</li>
                  <li>Access tokens are stored encrypted and never exposed in logs</li>
                  <li>Webhook payloads are verified using HMAC signatures before processing</li>
                  <li>JWT tokens are used to authenticate all API requests</li>
                </ul>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  7. Your Rights and GDPR Compliance
                </Text>
                <Text as="p" variant="bodyMd">
                  ShopBox complies with Shopify's GDPR requirements. We support
                  the following mandatory webhooks:
                </Text>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Customer Data Request
                  </Text>
                  <Text as="p" variant="bodyMd">
                    When a customer requests their data, we log all information we
                    hold about them including orders, messages, and bot
                    sessions. Merchants are responsible for fulfilling the request
                    to their customers within 30 days.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Customer Data Erasure (Redact)
                  </Text>
                  <Text as="p" variant="bodyMd">
                    When a customer requests erasure, we anonymize personal fields
                    and delete session-sensitive data.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">
                    Shop Data Erasure (Redact)
                  </Text>
                  <Text as="p" variant="bodyMd">
                    When a merchant uninstalls ShopBox and 48 days have elapsed, we
                    permanently delete the merchant record and all associated
                    data.
                  </Text>
                </BlockStack>
              </BlockStack>

              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  11. Contact Us
                </Text>
                <Text as="p" variant="bodyMd">
                  If you have questions about this Privacy Policy or wish to
                  exercise your data rights, contact us at:
                </Text>
                <Text as="p" variant="bodyMd">
                  <strong>Email:</strong> privacy@shopboxx.africa
                  <br />
                  <strong>Website:</strong> https://shopboxx.africa
                </Text>
              </BlockStack>

              <Divider />

              <Box paddingBlockStart="200">
                <Text alignment="center" tone="subdued" variant="bodySm">
                  © 2026 ShopBox Automation.
                </Text>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
