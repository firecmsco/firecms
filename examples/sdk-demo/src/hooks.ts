import { useState, useEffect, useCallback } from "react";
import { client } from "./client";
import type { RebaseUser, RebaseSession } from "@rebasepro/client";

// ===== Auth Hook =====
export function useAuth() {
  const [user, setUser] = useState<RebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session synchronously
    const session: RebaseSession | null = client.auth.getSession();
    if (session?.user) setUser(session.user);
    setLoading(false);

    // Subscribe to auth changes
    const unsubscribe = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await client.auth.signInWithEmail(email, password);
    setUser(result.user);
    return result;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const result = await client.auth.signUp(email, password, displayName);
    setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await client.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signOut };
}

// ===== Collection Hook =====
export function useCollection(
  slug: string,
  options?: { limit?: number; page?: number; orderBy?: string; where?: Record<string, string> }
) {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 20, offset: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = options?.limit ?? 20;
  const page = options?.page ?? 1;
  const offset = (page - 1) * limit;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.data.collection(slug).find({
        limit,
        offset,
        orderBy: options?.orderBy,
        where: options?.where,
      });
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [slug, limit, offset, options?.orderBy, JSON.stringify(options?.where)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, meta, loading, error, refetch: fetchData };
}
