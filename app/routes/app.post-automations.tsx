import { 
  Page, 
  Layout, 
  Card, 
  DataTable, 
  BlockStack, 
  Text, 
  Badge, 
  InlineStack, 
  Modal, 
  TextField, 
  ChoiceList, 
  FormLayout, 
  EmptyState,
  FooterHelp,
  Link,
  SkeletonBodyText,
  Button,
  Icon,
  Thumbnail,
  Box,
  Banner,
} from "@shopify/polaris";
import { PlusIcon, DeleteIcon, CheckCircleIcon } from "@shopify/polaris-icons";
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

interface MappingData {
  id: string;
  platform: string;
  postUrl: string;
  shopifyProductId: string;
  productTitle: string;
  isActive: boolean;
}

interface SocialPost {
  id: string;
  text: string;
  url: string;
  imageUrl: string | null;
  createdAt: string;
  type: string;
}

export default function PostAutomations() {
  const { shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [mappings, setMappings] = useState<MappingData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platform, setPlatform] = useState<string[]>(["facebook"]);
  const [postUrl, setPostUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductTitle, setSelectedProductTitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Post Picker state
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fetchMappings = async () => {
    try {
      const idToken = await shopify.idToken();
      const res = await fetch(`${BACKEND_URL}/api/meta/post-mappings?shop=${shop}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMappings(data);
      } else {
        console.warn("Backend returned non-array data:", data);
        setMappings([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Mappings load failed:", err);
      setMappings([]);
    }
  };

  const fetchSocialPosts = async (targetPlatform: string) => {
    setLoadingPosts(true);
    try {
      const idToken = await shopify.idToken();
      const endpoint = targetPlatform === 'facebook' 
        ? '/api/meta/auth/facebook-posts' 
        : '/api/meta/auth/instagram-posts';
      
      const res = await fetch(`${BACKEND_URL}${endpoint}?shop=${shop}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSocialPosts(data);
      } else {
        setSocialPosts([]);
      }
    } catch (err) {
      console.error("Failed to fetch social posts:", err);
      setSocialPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [shopify, shop]);

  useEffect(() => {
    if (isModalOpen) {
      fetchSocialPosts(platform[0]);
    } else {
      setSocialPosts([]);
    }
  }, [isModalOpen]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      // Reset form on close
      setPostUrl("");
      setSelectedProductId("");
      setSelectedProductTitle("");
      setPlatform(["facebook"]);
    }
  };

  const handleSelectProduct = async () => {
    // Using Shopify App Bridge's native ResourcePicker to select a product
    const selection = await shopify.resourcePicker({ type: "product", action: "select", multiple: false });
    
    if (selection && selection.length > 0) {
      const product = selection[0];
      // Format: "gid://shopify/Product/8824789926086" -> "8824789926086"
      const numericId = product.id.split("/").pop() || "";
      setSelectedProductId(numericId);
      setSelectedProductTitle(product.title);
    }
  };

  const handleSaveMapping = async () => {
    if (!postUrl || !selectedProductId) {
      shopify.toast.show("Please provide a post URL and select a linked product.", { isError: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await shopify.idToken();
      const response = await fetch(`${BACKEND_URL}/api/meta/post-mappings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        },
        body: JSON.stringify({ 
          postUrl, 
          platform: platform[0], 
          shopifyProductId: selectedProductId,
          productTitle: selectedProductTitle
        })
      });

      if (response.ok) {
        shopify.toast.show("Automation linked successfully");
        toggleModal();
        fetchMappings();
      } else {
        const errorData = await response.json().catch(() => ({}));
        shopify.toast.show(
          errorData.message || "Failed to parse post URL or link automation. Please check the URL format.", 
          { isError: true, duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Save failed:", err);
      shopify.toast.show("Server error while saving mapping.", { isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMappingStatus = async (id: string, currentStatus: boolean) => {
    try {
      const idToken = await shopify.idToken();
      const newStatus = !currentStatus;

      // Optimistic UI update
      setMappings(prev => (Array.isArray(prev) ? prev : []).map(m => m.id === id ? { ...m, isActive: newStatus } : m));

      const response = await fetch(`${BACKEND_URL}/api/meta/post-mappings/${id}`, {
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
      
      shopify.toast.show(`Automation ${newStatus ? 'enabled' : 'paused'}`);
    } catch (err) {
      console.error("Toggle failed:", err);
      // Revert optimism
      setMappings(prev => (Array.isArray(prev) ? prev : []).map(m => m.id === id ? { ...m, isActive: currentStatus } : m));
      shopify.toast.show("Failed to update status", { isError: true });
    }
  };

  const deleteMapping = async (id: string) => {
    try {
      const idToken = await shopify.idToken();
      const response = await fetch(`${BACKEND_URL}/api/meta/post-mappings/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "ngrok-skip-browser-warning": "true" 
        }
      });

      if (response.ok) {
        shopify.toast.show("Automation removed");
        setMappings(prev => (Array.isArray(prev) ? prev : []).filter(m => m.id !== id));
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      shopify.toast.show("Failed to remove automation", { isError: true });
    }
  };

  const rows = (Array.isArray(mappings) ? mappings : []).map((m) => [
    <Badge tone={m.platform === 'facebook' ? 'info' : 'success'}>
      {m.platform.charAt(0).toUpperCase() + m.platform.slice(1)}
    </Badge>,
    <Link url={m.postUrl} target="_blank">View Post ↗</Link>,
    <Text as="span" fontWeight="bold">{m.productTitle || m.shopifyProductId}</Text>,
    <div className="shopbox-trigger-toggle" onClick={() => toggleMappingStatus(m.id, m.isActive)} style={{ cursor: 'pointer' }}>
      {m.isActive ? 'ON ' : 'OFF '} 
      <div className={`toggle-dot ${!m.isActive ? 'off' : ''}`}></div>
    </div>,
    <Button variant="plain" tone="critical" onClick={() => deleteMapping(m.id)} icon={DeleteIcon} accessibilityLabel="Delete mapping" />
  ]);

  return (
    <Page 
      title="Post Automations"
      subtitle="Link your Facebook and Instagram posts to specific Shopify products for comment-to-DM checkout."
      primaryAction={{
        content: "Link New Post",
        icon: PlusIcon,
        onAction: toggleModal,
      }}
    >
      <Layout>
        {/* Loading State */}
        {loading && (
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={6} />
            </Card>
          </Layout.Section>
        )}

        {/* Empty State */}
        {!loading && mappings.length === 0 && (
          <Layout.Section>
            <Card padding="0">
              <EmptyState
                heading="No Post Automations Active"
                action={{ content: "Link Your First Post", onAction: toggleModal }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Link a specific Facebook or Instagram post URL to a product in your store to trigger exclusive checkouts from the comments.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        )}

        {/* Mappings Table */}
        {!loading && mappings.length > 0 && (
          <Layout.Section>
            <Card padding="0">
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={["Platform", "Post", "Linked Product", "Status", "Actions"]}
                rows={rows}
                verticalAlign="middle"
              />
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <FooterHelp>
            Need help configuring this? Review the{" "}
            <Link url="https://shopify.dev/docs/apps" target="_blank">
              comment-to-DM checkout guide
            </Link>
          </FooterHelp>
        </Layout.Section>
      </Layout>

      {/* Link New Post Modal */}
      <Modal
        open={isModalOpen}
        onClose={toggleModal}
        title="Link Post to Product Automation"
        primaryAction={{
          content: "Save Automation",
          onAction: handleSaveMapping,
          loading: isSubmitting,
        }}
        secondaryActions={[{ content: "Cancel", onAction: toggleModal }]}
      >
        <Modal.Section>
          <FormLayout>
            <ChoiceList
              title="Select Platform"
              choices={[
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
              ]}
              selected={platform}
              onChange={(val) => {
                setPlatform(val);
                fetchSocialPosts(val[0]);
              }}
            />

            {loadingPosts ? (
              <Box paddingBlockStart="400" paddingBlockEnd="400">
                <BlockStack gap="200" align="center">
                  <SkeletonBodyText lines={2} />
                  <Text as="p" tone="subdued">Fetching your latest {platform[0]} posts...</Text>
                </BlockStack>
              </Box>
            ) : socialPosts.length > 0 ? (
              <Box paddingBlockStart="200">
                <Text as="p" fontWeight="medium" variant="bodyMd" tone="subdued">Select a post to link:</Text>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px', 
                  marginTop: '12px',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {socialPosts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => setPostUrl(post.url)}
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        border: postUrl === post.url ? '2px solid #008060' : '1px solid #dfe3e8',
                        backgroundColor: postUrl === post.url ? '#f0fdf9' : 'white',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {post.imageUrl ? (
                        <div style={{ width: '100%', height: '100px', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100px', borderRadius: '4px', backgroundColor: '#f6f6f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text as="span" tone="subdued">No Image</Text>
                        </div>
                      )}
                      <Text as="p" variant="bodySm" truncate>
                        {post.text || "No caption"}
                      </Text>
                    </div>
                  ))}
                </div>
              </Box>
            ) : (
              <Box paddingBlockStart="200">
                <Banner tone="info" title={`No ${platform[0]} posts found`}>
                  <p>We couldn't find any recent posts. Make sure your account is connected or paste a URL manually below.</p>
                </Banner>
              </Box>
            )}

            <TextField
              label="Post URL"
              value={postUrl}
              onChange={(v) => setPostUrl(v)}
              autoComplete="off"
              placeholder="https://www.facebook.com/photo/?fbid=..."
              helpText={platform[0] === 'instagram' ? "Selected media URL will appear here." : "Selected post URL will appear here."}
            />

            <div style={{ marginTop: 8 }}>
              <Text as="p" variant="bodyMd" fontWeight="medium" tone="subdued">Linked Product</Text>
              <div style={{ marginTop: 8 }}>
                {selectedProductId ? (
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={CheckCircleIcon} tone="success" />
                      <Text as="span" fontWeight="bold">{selectedProductTitle}</Text>
                    </InlineStack>
                    <Button onClick={handleSelectProduct} variant="plain">Change Product</Button>
                  </InlineStack>
                ) : (
                  <Button onClick={handleSelectProduct}>Select a Product from Shopify</Button>
                )}
              </div>
            </div>
            
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
