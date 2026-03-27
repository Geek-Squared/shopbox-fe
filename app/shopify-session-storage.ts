import type {
  SessionStorage,
} from '@shopify/shopify-app-session-storage';
import { Session } from '@shopify/shopify-app-react-router/server';

const BACKEND_URL = process.env.BACKEND_URL
  ?? 'https://shopbox-api-production.up.railway.app'

export class RailwaySessionStorage implements SessionStorage {

  async storeSession(session: Session): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/shopify/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/shopify/sessions/${id}`
      )
      if (!res.ok) return undefined
      const data = await res.json()
      if (!data) return undefined
      
      const session = new Session(data);
      if (data.expires) {
        session.expires = new Date(data.expires);
      }
      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return undefined
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/shopify/sessions/${id}`,
        { method: 'DELETE' }
      )
      return res.ok
    } catch {
      return false
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await Promise.all(ids.map(id => this.deleteSession(id)))
      return true
    } catch {
      return false
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/shopify/sessions?shop=${shop}`
      )
      if (!res.ok) return []
      const data = await res.json()
      return data.map((s: any) => {
        const session = new Session(s);
        if (s.expires) {
          session.expires = new Date(s.expires);
        }
        return session;
      });
    } catch (error) {
      console.error('Failed to find sessions:', error);
      return []
    }
  }
}
