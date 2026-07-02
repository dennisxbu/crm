import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../shared/lib/supabase/client";
import { fetchProfile } from "../../features/auth/api/profile";
import type { AuthContextValue } from "../../features/auth/auth.types";
import type { Profile } from "../../features/workspaces/workspace.types";

const AuthContext = createContext<AuthContextValue | null>(null);

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Authentifizierung fehlgeschlagen.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const nextProfile = await fetchProfile(user.id);
    setProfile(nextProfile);
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase ist nicht konfiguriert. Bitte .env.local prüfen.");
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    const loadSession = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: sessionError } = await client.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (sessionLoadError) {
        if (isMounted) {
          setError(getAuthErrorMessage(sessionLoadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const nextProfile = await fetchProfile(user.id);

        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (profileError) {
        if (isMounted) {
          setError(getAuthErrorMessage(profileError));
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) {
        throw new Error("Supabase client is not configured.");
      }

      setError(null);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined,
      });

      if (signUpError) {
        throw signUpError;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw signOutError;
    }

    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
