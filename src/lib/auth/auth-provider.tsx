"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getBrowserClient, type BrowserClient } from "@/lib/db/browser-client";

/** Shape of the auth context available to any child component. */
interface AuthState {
  /** The active Supabase browser client (null when env not configured). */
  client: BrowserClient | null;
  /** The currently logged-in user id, or null. */
  userId: string | null;
  /** The user's email, or null. */
  email: string | null;
  /** Whether we are still checking the initial session. */
  loading: boolean;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  client: null,
  userId: null,
  email: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => getBrowserClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      // Defer to a microtask so we're not calling setState synchronously
      // in the effect body (react-hooks/set-state-in-effect rule).
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    // Get initial session.
    client.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    // Listen for subsequent auth state changes (sign-in, sign-out, refresh).
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    setUserId(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider value={{ client, userId, email, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
