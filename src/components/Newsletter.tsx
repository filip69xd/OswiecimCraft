import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type Status = "idle" | "loading" | "success" | "error";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Podaj poprawny adres e-mail.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase
      .from("newsletter_signups")
      .insert({ email });

    if (error) {
      if (error.code === "23505") {
        setStatus("error");
        setMessage("Ten e-mail jest już zapisany!");
      } else {
        setStatus("error");
        setMessage("Coś poszło nie tak. Spróbuj ponownie.");
      }
      return;
    }

    // Send welcome email (best-effort — signup already succeeded)
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      });
    } catch {
      // email send failed silently — signup is still valid
    }

    setStatus("success");
    setMessage("Dziękujemy! Sprawdź swoją skrzynkę (wraz ze spamem).");
    setEmail("");
  };

  return (
    <section className="relative py-20 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center bg-mc-green2/15 text-mc-green rounded-sm">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="font-minecraft text-xl md:text-2xl text-mc-text mb-3">
          Bądź pierwszy na pokładzie
        </h2>
        <p className="text-sm text-mc-text/70 mb-7">
          Zapisz się na newsletter i dowiedz się o starcie serwera oraz nowych
          eventach jako pierwszy.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            disabled={status === "loading"}
            className="flex-1 px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green disabled:opacity-50 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Zapisuję...
              </>
            ) : (
              "Zapisz się"
            )}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 flex items-center justify-center gap-2 text-sm ${
              status === "success" ? "text-mc-green" : "text-red-400"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
