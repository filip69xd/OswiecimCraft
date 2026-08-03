import { useState, useEffect } from "react";
import { X, Loader2, Mail, Lock, AlertCircle, Swords } from "lucide-react";
import { useAuth } from "../lib/auth";

type Mode = "signin" | "signup";

export default function AuthModal({
  open,
  onClose,
  initialMode = "signin",
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setEmail("");
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [open, initialMode]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Uzupełnij e-mail i hasło.");
      return;
    }
    setLoading(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-mc-panel border-2 border-mc-border rounded-sm p-7 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mc-dim hover:text-mc-text transition-colors"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-mc-green2 flex items-center justify-center rounded-sm">
            <Swords className="w-5 h-5 text-mc-bg" strokeWidth={2.5} />
          </div>
          <span className="font-minecraft text-sm text-mc-green">
            OświęcimCraft
          </span>
        </div>

        <h2 className="font-minecraft text-lg text-mc-text mb-1">
          {mode === "signin" ? "Logowanie" : "Rejestracja"}
        </h2>
        <p className="text-sm text-mc-text/60 mb-6">
          {mode === "signin"
            ? "Zaloguj się, aby kupować rangi i zarządzać kontem."
            : "Załóż konto, aby kupować rangi i zarządzać zakupami."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-dim" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="twoj@email.pl"
                className="w-full pl-10 pr-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
              Hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-dim" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Minimum 6 znaków"
                className="w-full pl-10 pr-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "signin" ? "Logowanie..." : "Rejestracja..."}
              </>
            ) : mode === "signin" ? (
              "Zaloguj się"
            ) : (
              "Załóż konto"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-mc-text/60 mt-5">
          {mode === "signin" ? "Nie masz konta? " : "Masz już konto? "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="text-mc-green hover:text-mc-green2 font-bold transition-colors"
          >
            {mode === "signin" ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </p>
      </div>
    </div>
  );
}
