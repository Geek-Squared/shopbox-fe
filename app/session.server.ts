import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export class RailwaySessionStorage implements SessionStorage {
  private backendUrl: string;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  }

  async storeSession(session: Session): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/shopify/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to store session on Railway:", error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const response = await fetch(`${this.backendUrl}/api/shopify/sessions/${id}`);
      if (!response.ok) return undefined;

      const data = await response.json();
      if (!data) return undefined;

      return new Session(data);
    } catch (error) {
      console.error("Failed to load session from Railway:", error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/shopify/sessions/${id}`, {
        method: "DELETE",
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to delete session on Railway:", error);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    const results = await Promise.all(ids.map((id) => this.deleteSession(id)));
    return results.every((result) => result);
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    // Note: The backend controller we created doesn't have a direct list-by-shop yet,
    // but the Shopify library usually uses loadSession(id) for auth flows.
    // If needed, we can implement it by adding a GET /api/shopify/sessions/shop/:shop endpoint.
    return [];
  }
}
