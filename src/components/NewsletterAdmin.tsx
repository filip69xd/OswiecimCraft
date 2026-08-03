import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle, Users, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import SectionHeader from "./SectionHeader";

export default function NewsletterAdmin() {
  const { user, role, loading } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  if (loading) return null;

  // Only show the admin panel to owner or admin
  if (!user || (role !== "owner" && role !== "admin")) return null;

  const fetchCount = async () => {
    const { count, error } = await supabase
      .from("newsletter_signups")
      .select("*", { count: "exact", head: true });
    if (!error) setSubscriberCount(count ?? 0);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setStatus("error");
      setMessage("Uzupełnij temat i treść wiadomości.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setStatus("error");
        setMessage("Sesja wygasła. Zaloguj się ponownie.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter-broadcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Nie udało się wysłać wiadomości.");
        return;
      }

      setStatus("success");
      setMessage(`Wysłano ${data.sent} z ${data.sent + data.failed} wiadomości.`);
      setSubject("");
      setBody("");
    } catch {
      setStatus("error");
      setMessage("Błąd połączenia z serwerem.");
    }
  };

  return (
    <section className="py-20 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
      <div className="max-w-2xl mx-auto">
        <SectionHeader tag="Admin" title="Wyślij newsletter" />

        <div className="mt-8 bg-mc-panel border-2 border-mc-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-mc-dim">
              <Users className="w-4 h-4 text-mc-green" />
              <span>Subskrybenci: </span>
              {subscriberCount !== null ? (
                <span className="font-bold text-mc-text">{subscriberCount}</span>
              ) : (
                <button
                  onClick={fetchCount}
                  className="text-mc-green hover:text-mc-green2 font-bold underline"
                >
                  Sprawdź
                </button>
              )}
            </div>
          </div>

          <form onSubmit={send} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
                Temat
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={status === "loading"}
                placeholder="np. Serwer wystartował!"
                className="w-full px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
                Treść (HTML)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={status === "loading"}
                rows={8}
                placeholder="np. &lt;p&gt;Serwer jest już dostępny pod adresem...&lt;/p&gt;"
                className="w-full px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50 font-mono resize-y"
              />
              <p className="text-xs text-mc-dim mt-1.5">
                Możesz używać znaczników HTML (p, strong, a, ul, li). Link do wypisu jest dodawany automatycznie.
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wysyłam...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Wyślij do wszystkich
                </>
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 flex items-start gap-2 text-sm p-3 rounded-sm ${
                status === "success"
                  ? "bg-mc-green2/10 text-mc-green"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-mc-dim justify-center">
          <Mail className="w-3.5 h-3.5" />
          <span>
            Każdy e-mail zawiera automatyczny link do wypisu — zgodnie z wymogami prawnymi.
          </span>
        </div>
      </div>
    </section>
  );
}
