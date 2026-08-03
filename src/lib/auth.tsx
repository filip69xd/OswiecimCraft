import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type UserRole = "owner" | "admin" | null;

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid: string) => {
    const { data } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();
    setRole(data?.role ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchRole(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        fetchRole(sess.user.id);
      } else {
        setRole(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? translateError(error.message) : null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? translateError(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, role, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Nieprawidłowy e-mail lub hasło.";
  if (m.includes("already registered")) return "Konto z tym e-mailem już istnieje.";
  if (m.includes("weak_password") || m.includes("password is known to be weak"))
    return "To hasło jest zbyt powszechne. Wybierz silniejsze hasło.";
  if (m.includes("password should be at least")) return "Hasło musi mieć co najmniej 6 znaków.";
  if (m.includes("unable to validate email")) return "Podaj poprawny adres e-mail.";
  return "Coś poszło nie tak. Spróbuj ponownie.";
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
