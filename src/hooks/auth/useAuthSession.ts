import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type AuthSession = {
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
};

export function useAuthSession(): AuthSession {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
      }

      setLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setEmail(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    isAuthenticated,
    userId,
    email,
  };
}