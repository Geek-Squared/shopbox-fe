import { Page, Layout, Card, Button, DataTable, BlockStack, Text, Badge, InlineStack, Modal, TextField, Checkbox, FormLayout, EmptyState } from "@shopify/polaris";
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

export default function Automation() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [triggers, setTriggers] = useState<string[][]>([]);
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
      const formatted = data.map((t: any) => [
        t.keyword, 
        t.isActive ? "ACTIVE" : "INACTIVE", 
        (t.messagesSent || 0).toString(), 
        t.replyComment ? "Yes" : "No"
      ]);
      setTriggers(formatted);
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
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const rows = triggers;

  return (
    <Page 
      title="Automation Triggers"
      primaryAction={{
        content: "Add Keyword Trigger",
        onAction: toggleModal,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {rows.length > 0 ? (
              <DataTable
                columnContentTypes={["text", "text", "numeric", "text"]}
                headings={["Keyword", "Status", "DMs Sent", "Public Reply"]}
                rows={rows}
              />
            ) : (
              <EmptyState
                heading="You have 0 active keywords"
                action={{ content: "Create Your First Keyword", onAction: toggleModal }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Add words like "CATALOG", "PRICE", or "SHOP" so the bot knows when to respond to your customers automatically.</p>
              </EmptyState>
            )}
          </Card>
        </Layout.Section>
      </Layout>

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
