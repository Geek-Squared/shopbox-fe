import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  BlockStack, 
  Text, 
  Badge, 
  InlineStack, 
  Modal, 
  TextField, 
  Checkbox, 
  FormLayout, 
  EmptyState,
  FooterHelp,
  Link,
  SkeletonBodyText
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

const BACKEND_URL = "https://grateful-unbefriended-lorrine.ngrok-free.dev";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

interface TriggerData {
  keyword: string;
  isActive: boolean;
  messagesSent: number;
  replyComment: boolean;
}

export default function Automation() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [triggers, setTriggers] = useState<TriggerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [replyComment, setReplyComment] = useState(true);

  const fetchTriggers = async () => {
    try {
      const idToken = await shopify.idToken();
      const res = await fetch(`${BACKEND_URL}/api/meta/triggers?shop=${shop}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      const data = await res.json();
      setTriggers(data);
      setLoading(false);
    } catch (err) {
      console.error("Triggers load failed:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, [shopify, shop]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleAddTrigger = async () => {
    try {
      const idToken = await shopify.idToken();
      const response = await fetch(`${BACKEND_URL}/api/meta/triggers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify({ keyword, replyComment })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setKeyword("");
        setReplyComment(true);
        fetchTriggers();
        shopify.toast.show("Trigger created successfully");
      }
    } catch (err) {
      console.error("Save failed:", err);
      shopify.toast.show("Failed to save trigger", { isError: true });
    }
  };

  // Helper: get icon and template text for known keywords
  const getTriggerDetails = (kw: string) => {
    const key = kw.toUpperCase();
    switch (key) {
      case "PRICE":
        return {
          icon: "💰",
          description: "Sent when a customer asks for the current price.",
          template: `Hello! The current price for {{product_name}} is {{price}}. This includes all taxes and standard shipping. Let us know if you have any other questions!`,
          tags: ["#product_name", "#price", "#currency"]
        };
      case "LINK":
        return {
          icon: "🔗",
          description: "Sent when a product page link is requested.",
          template: `You can find all the details and high-quality images for {{product_name}} right here: {{product_url}}. Hope this helps!`,
          tags: ["#product_url", "#collection_name"]
        };
      case "BUY":
        return {
          icon: "🛒",
          description: "Sent as a direct call to action for purchase.",
          template: `Ready to make it yours? You can checkout securely for {{product_name}} using this link: {{checkout_url}}`,
          tags: ["#checkout_url", "#store_name"]
        };
      default:
        return {
          icon: "🏷️",
          description: `Triggered when a customer sends "${kw}" in a DM or comment.`,
          template: `Thanks for reaching out! Here's what you need to know about our products. Reply anytime for more info.`,
          tags: ["#product_name", "#store_name"]
        };
    }
  };

  return (
    <Page 
      title="Automation Triggers"
      primaryAction={{
        content: "Add Keyword Trigger",
        onAction: toggleModal,
      }}
    >
      <Layout>
        {/* Loading State */}
        {loading && (
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={8} />
            </Card>
          </Layout.Section>
        )}

        {/* Empty State */}
        {!loading && triggers.length === 0 && (
          <Layout.Section>
            <Card padding="0">
              <EmptyState
                heading="You have 0 active keywords"
                action={{ content: "Create Your First Keyword", onAction: toggleModal }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Add words like "CATALOG", "PRICE", or "SHOP" so the bot knows when to respond to your customers automatically.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        )}

        {/* Triggers Content (2-column layout) */}
        {!loading && triggers.length > 0 && (
          <Layout.Section>
            <div className="shopbox-two-col">
              {/* Left: Template Cards */}
              <div>
                <Text as="p" tone="subdued" variant="bodySm">
                  Configure the precise wording of your automated customer interactions. Use these templates to maintain your brand's unique voice across all touchpoints.
                </Text>
                <div style={{ marginTop: 20 }}>
                  {triggers.map((trigger, idx) => {
                    const details = getTriggerDetails(trigger.keyword);
                    return (
                      <div key={idx} className="shopbox-template-card">
                        <div className="shopbox-template-header">
                          <div className="shopbox-template-icon">{details.icon}</div>
                          <span className="shopbox-template-title">
                            {trigger.keyword.toUpperCase()} Message Template
                          </span>
                        </div>
                        <p className="shopbox-template-subtitle">{details.description}</p>
                        
                        <div className="shopbox-template-label">Template Content</div>
                        <textarea 
                          className="shopbox-template-textarea"
                          defaultValue={details.template}
                          rows={3}
                        />
                        
                        <div className="shopbox-template-tags">
                          {details.tags.map((tag, i) => (
                            <span key={i} className="shopbox-tag">{tag}</span>
                          ))}
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <InlineStack gap="200" align="start">
                            <Badge tone={trigger.isActive ? "success" : "warning"}>
                              {trigger.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge>
                              {trigger.messagesSent || 0} sent
                            </Badge>
                            {trigger.replyComment && (
                              <Badge tone="info">Public Reply</Badge>
                            )}
                          </InlineStack>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="shopbox-action-bar">
                  <button className="shopbox-btn-secondary">Discard changes</button>
                  <button className="shopbox-btn-primary">Save tweaks</button>
                </div>
              </div>

              {/* Right: Sidebar */}
              <div>
                {/* Automation Status */}
                <div className="shopbox-sidebar-panel">
                  <div className="shopbox-sidebar-title">Automation Status</div>
                  <div className="shopbox-sidebar-status">
                    <span className="dot"></span> System Live
                  </div>
                  <p className="shopbox-sidebar-text">
                    All messages are currently being processed using your custom templates. Changes reflect instantly in active chats.
                  </p>
                  <div className="shopbox-sidebar-timestamp">
                    <span className="shopbox-sidebar-timestamp-label">Last Triggered</span>
                    <span className="shopbox-sidebar-timestamp-value">2m ago</span>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="shopbox-sidebar-panel">
                  <div className="shopbox-sidebar-title">Pro Tips</div>
                  <ul className="shopbox-tips-list">
                    <li>
                      <span className="tip-icon">✦</span>
                      <span>Use <strong>{"{{brackets}}"}</strong> to inject dynamic store data into your messages.</span>
                    </li>
                    <li>
                      <span className="tip-icon">■</span>
                      <span>Keep templates under 160 characters for optimal delivery on mobile messaging platforms.</span>
                    </li>
                    <li>
                      <span className="tip-icon">●</span>
                      <span>A friendly, informal tone usually increases conversion rates by up to 12%.</span>
                    </li>
                  </ul>
                </div>

                {/* Stats Summary */}
                <div className="shopbox-sidebar-panel">
                  <div className="shopbox-sidebar-title">Triggers Summary</div>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodySm">Total triggers</Text>
                      <Text as="span" variant="bodySm" fontWeight="bold">{triggers.length}</Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodySm">Active</Text>
                      <Text as="span" variant="bodySm" fontWeight="bold">
                        {triggers.filter(t => t.isActive).length}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodySm">Total DMs sent</Text>
                      <Text as="span" variant="bodySm" fontWeight="bold">
                        {triggers.reduce((sum, t) => sum + (t.messagesSent || 0), 0)}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </div>
              </div>
            </div>
          </Layout.Section>
        )}

        <Layout.Section>
          <FooterHelp>
            Learn more about{" "}
            <Link url="https://shopify.dev/docs/apps" target="_blank">
              automation best practices
            </Link>
          </FooterHelp>
        </Layout.Section>
      </Layout>

      {/* Add Trigger Modal */}
      <Modal
        open={isModalOpen}
        onClose={toggleModal}
        title="Add New Keyword Trigger"
        primaryAction={{
          content: "Save Trigger",
          onAction: handleAddTrigger,
        }}
        secondaryActions={[{ content: "Cancel", onAction: toggleModal }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Keyword"
              value={keyword}
              onChange={(v) => setKeyword(v)}
              autoComplete="off"
              helpText="When a customer sends this keyword in a DM, the bot responds with the catalog."
            />
            <Checkbox
              label="Reply to comments automatically"
              checked={replyComment}
              onChange={(v) => setReplyComment(v)}
              helpText="If enabled, the bot will also reply to public comments using this keyword."
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
