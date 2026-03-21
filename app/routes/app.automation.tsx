import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  DataTable, 
  BlockStack, 
  Text, 
  Badge, 
  InlineStack, 
  Modal, 
  TextField, 
  Checkbox, 
  FormLayout, 
  EmptyState 
} from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useSubmit } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

const BACKEND_URL = "https://grateful-unbefriended-lorrine.ngrok-free.dev";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Real implementation: call GET /api/meta/triggers with session token
  // For the mockup, we return an empty list or placeholders
  const triggers = [
    ["SHOP", "ACTIVE", "1,240", "Yes"],
    ["CATALOG", "ACTIVE", "842", "No"],
    ["PRICE", "ACTIVE", "311", "Yes"]
  ];
  
  return { triggers };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Real implementation: call POST /api/meta/triggers
  return { success: true };
};

export default function Automation() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [replyComment, setReplyComment] = useState(true);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleAddTrigger = () => {
    submit({ keyword, replyComment }, { method: "post" });
    setIsModalOpen(false);
    setKeyword("");
  };

  const rows = data.triggers;

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
                heading="No triggers created yet"
                action={{ content: "Create New Trigger", onAction: toggleModal }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Add your first keyword to start automating customer interactions.</p>
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
