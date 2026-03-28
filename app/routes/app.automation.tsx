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

const BACKEND_URL = "https://shopbox-api-production.up.railway.app";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

interface TriggerData {
  id: string;
  keyword: string;
  isActive: boolean;
  messagesSent?: number;
  triggerCount?: number;
  replyComment: boolean;
  templateMessage?: string;
}

interface StatsData {
  totalTriggers: number;
  totalDmsSent: number;
  totalOrdersFromIg?: number;
}

export default function Automation() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [triggers, setTriggers] = useState<TriggerData[]>([]);
  const [stats, setStats] = useState<StatsData>({ totalTriggers: 0, totalDmsSent: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newReplyComment, setNewReplyComment] = useState(true);

  // Edit state for templates and reply settings
  const [editedTemplates, setEditedTemplates] = useState<Record<string, string>>({});
  const [editedReplyComments, setEditedReplyComments] = useState<Record<string, boolean>>({});
  const [isSavingTweaks, setIsSavingTweaks] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const idToken = await shopify.idToken();
      const headers = {
        "Authorization": `Bearer ${idToken}`,
        "ngrok-skip-browser-warning": "true" 
      };

      const [triggersRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/meta/triggers?shop=${shop}`, { headers }),
        fetch(`${BACKEND_URL}/api/meta/triggers/stats?shop=${shop}`, { headers })
      ]);

      const triggersData = await triggersRes.json();
      const statsData = await statsRes.json();

      setTriggers(triggersData);
      setStats({
        totalTriggers: statsData.totalTriggers || triggersData.length,
        totalDmsSent: statsData.totalDmsSent || 0,
        totalOrdersFromIg: statsData.totalOrdersFromIg || 0
      });
      setLoading(false);
    } catch (err) {
      console.error("Dashboard data load failed:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [shopify, shop]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleAddTrigger = async () => {
    try {
      const idToken = await shopify.idToken();
      const details = getTriggerDetails(newKeyword);
      
      const response = await fetch(`${BACKEND_URL}/api/meta/triggers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify({ 
          keyword: newKeyword, 
          replyComment: newReplyComment,
          templateMessage: details.template // default template for new ones
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewKeyword("");
        setNewReplyComment(true);
        fetchDashboardData();
        shopify.toast.show("Trigger created successfully");
      }
    } catch (err) {
      console.error("Save failed:", err);
      shopify.toast.show("Failed to save trigger", { isError: true });
    }
  };

  const handleSaveTweaks = async () => {
    setIsSavingTweaks(true);
    try {
      const idToken = await shopify.idToken();
      
      // Find all triggers that were modified
      const modifiedTriggerIds = new Set([
        ...Object.keys(editedTemplates),
        ...Object.keys(editedReplyComments)
      ]);

      const promises = Array.from(modifiedTriggerIds).map(id => {
        const originalTrigger = triggers.find(t => t.id === id);
        if (!originalTrigger) return Promise.resolve();
        
        const details = getTriggerDetails(originalTrigger.keyword);
        const templateMessage = editedTemplates[id] ?? originalTrigger.templateMessage ?? details.template;
        const replyComment = editedReplyComments[id] ?? originalTrigger.replyComment;

        return fetch(`${BACKEND_URL}/api/meta/triggers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
            "ngrok-skip-browser-warning": "true" 
          },
          body: JSON.stringify({ 
            keyword: originalTrigger.keyword, 
            replyComment,
            templateMessage 
          })
        });
      });

      await Promise.all(promises);

      shopify.toast.show("Automation tweaks saved!");
      setEditedTemplates({});
      setEditedReplyComments({});
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to save tweaks:", err);
      shopify.toast.show("Failed to save changes", { isError: true });
    } finally {
      setIsSavingTweaks(false);
    }
  };

  const handleDiscardTweaks = () => {
    setEditedTemplates({});
    setEditedReplyComments({});
  };

  const handleDeleteTrigger = async (id: string, keyword: string) => {
    if (!confirm(`Are you sure you want to delete the "${keyword}" trigger?`)) return;

    try {
      const idToken = await shopify.idToken();
      const response = await fetch(`${BACKEND_URL}/api/meta/triggers/${id}?shop=${shop}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });

      if (response.ok) {
        shopify.toast.show("Trigger deleted");
        fetchDashboardData();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      shopify.toast.show("Failed to delete trigger", { isError: true });
    }
  };

  const toggleIsActive = async (id: string, currentStatus: boolean) => {
    try {
      const idToken = await shopify.idToken();
      const newStatus = !currentStatus;

      // Optimistic update
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, isActive: newStatus } : t));

      const response = await fetch(`${BACKEND_URL}/api/meta/triggers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }
      
      shopify.toast.show(`Trigger ${newStatus ? 'enabled' : 'paused'}`);
    } catch (err) {
      console.error("Toggle failed:", err);
      setTriggers(prev => prev.map(t => t.id === id ? { ...t, isActive: currentStatus } : t));
      shopify.toast.show("Failed to update trigger status", { isError: true });
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

  const hasUnsavedChanges = Object.keys(editedTemplates).length > 0 || Object.keys(editedReplyComments).length > 0;

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
                  Keyword triggers allow your bot to automatically respond when customers use specific words in messages or comments.
                </Text>
                <div style={{ marginTop: 20 }}>
                  {triggers.map((trigger) => {
                    const details = getTriggerDetails(trigger.keyword);
                    const currentTemplateValue = editedTemplates[trigger.id] ?? trigger.templateMessage ?? details.template;
                    const currentReplyComment = editedReplyComments[trigger.id] ?? trigger.replyComment;

                    return (
                      <div key={trigger.id} className="shopbox-template-card">
                        <div className="shopbox-template-header">
                          <InlineStack align="space-between" blockAlign="center">
                            <InlineStack gap="200" blockAlign="center">
                              <div className="shopbox-template-icon">{details.icon}</div>
                              <span className="shopbox-template-title">
                                {trigger.keyword.toUpperCase()} Message Template
                              </span>
                            </InlineStack>
                            <button 
                              className="shopbox-delete-btn"
                              onClick={() => handleDeleteTrigger(trigger.id, trigger.keyword)}
                              title="Delete trigger"
                            >
                              ✕
                            </button>
                          </InlineStack>
                        </div>
                        <p className="shopbox-template-subtitle">{details.description}</p>
                        
                        {/* Template editing hidden for now */}

                        <div style={{ marginTop: 12 }}>
                          <InlineStack gap="200" align="start" blockAlign="center">
                            <span 
                              style={{ cursor: 'pointer' }} 
                              onClick={() => toggleIsActive(trigger.id, trigger.isActive)}
                            >
                              <Badge tone={trigger.isActive ? "success" : "warning"}>
                                {trigger.isActive ? "Active (Click to Pause)" : "Paused (Click to Resume)"}
                              </Badge>
                            </span>
                            <Badge>
                              {`${trigger.triggerCount ?? trigger.messagesSent ?? 0} sent`}
                            </Badge>
                            
                            <span 
                              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                              onClick={() => setEditedReplyComments(prev => ({ ...prev, [trigger.id]: !currentReplyComment }))}
                            >
                              <Badge tone={currentReplyComment ? "info" : undefined}>
                                {currentReplyComment ? "✓ Public Reply ON" : "Public Reply OFF"}
                              </Badge>
                            </span>
                          </InlineStack>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Bar */}
                {hasUnsavedChanges && (
                  <div className="shopbox-action-bar">
                    <button 
                      className="shopbox-btn-secondary" 
                      onClick={handleDiscardTweaks}
                      disabled={isSavingTweaks}
                    >
                      Discard changes
                    </button>
                    <button 
                      className="shopbox-btn-primary" 
                      onClick={handleSaveTweaks}
                      disabled={isSavingTweaks}
                    >
                      {isSavingTweaks ? "Saving..." : "Save tweaks"}
                    </button>
                  </div>
                )}
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
                    <span className="shopbox-sidebar-timestamp-value">Just now</span>
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
                      <Text as="span" variant="bodySm" fontWeight="bold">{stats.totalTriggers}</Text>
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
                        {stats.totalDmsSent}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodySm">Orders from IG</Text>
                      <Text as="span" variant="bodySm" fontWeight="bold">
                        {stats.totalOrdersFromIg || 0}
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
              value={newKeyword}
              onChange={(v) => setNewKeyword(v.toUpperCase())}
              autoComplete="off"
              helpText="When a customer sends this keyword in a DM, the bot responds with the template."
            />
            <Checkbox
              label="Reply to comments automatically"
              checked={newReplyComment}
              onChange={(v) => setNewReplyComment(v)}
              helpText="If enabled, the bot will also reply to public comments using this keyword."
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
