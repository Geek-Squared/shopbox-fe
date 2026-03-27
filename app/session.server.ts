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
        body: JSON.stringify({
          id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expires,
          accessToken: session.accessToken,
          userId: session.onlineAccessInfo?.associated_user?.id,
          firstName: session.onlineAccessInfo?.associated_user?.first_name,
          lastName: session.onlineAccessInfo?.associated_user?.last_name,
          email: session.onlineAccessInfo?.associated_user?.email,
          accountOwner: session.onlineAccessInfo?.associated_user?.account_owner,
          locale: session.onlineAccessInfo?.associated_user?.locale,
          collaborator: session.onlineAccessInfo?.associated_user?.collaborator,
          emailVerified: session.onlineAccessInfo?.associated_user?.email_verified,
        }),
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

      // PRE-CONVERT Date fields before passing to the Session constructor
      const expires = data.expires ? new Date(data.expires) : undefined;
      
      // Guard against invalid date strings
      if (expires && isNaN(expires.getTime())) {
        console.error('Invalid expires value from API:', data.expires);
        return undefined;
      }

      const sessionData = {
        ...data,
        expires: expires,
      };

      // Create the session and FORCE assign the Date object to be sure
      const session = new Session(sessionData);
      if (expires) {
        session.expires = expires;
      }
      return session;
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
    try {
      const response = await fetch(`${this.backendUrl}/api/shopify/sessions?shop=${shop}`);
      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((s: any) => {
        const expires = s.expires ? new Date(s.expires) : undefined;
        const session = new Session({ ...s, expires });
        if (expires) {
          session.expires = expires;
        }
        return session;
      });
    } catch (error) {
      console.error("Failed to find sessions by shop on Railway:", error);
      return [];
    }
  }
}
