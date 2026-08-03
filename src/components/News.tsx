import { useState, useEffect } from "react";
import { Calendar, ArrowRight, X, Loader2, Trash2, Plus, Newspaper } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tag: string;
}

const TAG_COLORS: Record<string, string> = {
  Aktualizacja: "#22c55e",
  Rekrutacja: "#38bdf8",
  Sklep: "#fbbf24",
  Event: "#f97316",
  Ogłoszenie: "#ef4444",
};

export default function News() {
  const { user, role } = useAuth();
  const isAdmin = !!user && (role === "owner" || role === "admin");
  const { ref, visible } = useReveal<HTMLDivElement>();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("id, title, excerpt, content, tag, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNews(
        data.map((n: any) => ({
          id: n.id,
          title: n.title,
          excerpt: n.excerpt,
          content: n.content,
          tag: n.tag,
          date: new Date(n.created_at).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    if (selected || showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, showForm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setShowForm(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const deleteNews = async (id: string) => {
    if (!confirm("Na pewno usunąć ten news? Tej operacji nie można cofnąć.")) return;

    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      alert("Nie udało się usunąć: " + error.message);
    } else {
      setNews((prev) => prev.filter((n) => n.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  return (
    <section id="news" className="relative py-24 md:py-32 px-5 md:px-8">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Newsy"
          title="Najnowsze aktualności"
          subtitle="Bądź na bieżąco z tym, co dzieje się na serwerze."
        />

        {isAdmin && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green text-sm"
            >
              <Plus className="w-4 h-4" />
              Dodaj news
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-14 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-mc-green" />
          </div>
        ) : news.length === 0 ? (
          <div className="mt-14 text-center">
            <Newspaper className="w-12 h-12 text-mc-dim mx-auto mb-4" />
            <p className="text-sm text-mc-text/60">Brak aktualności. {isAdmin && "Dodaj pierwszy news!"}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {news.map((item, i) => (
              <article
                key={item.id}
                className="bg-mc-panel border border-mc-border rounded-sm p-6 flex flex-col card-hover relative group"
                style={{
                  animation: visible ? `slideUp 0.6s ease-out ${i * 0.1}s both` : undefined,
                }}
              >
                {isAdmin && (
                  <button
                    onClick={() => deleteNews(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-mc-dim hover:text-red-400 hover:bg-red-400/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Usuń news"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm"
                    style={{
                      color: TAG_COLORS[item.tag] ?? "#22c55e",
                      backgroundColor: `${TAG_COLORS[item.tag] ?? "#22c55e"}20`,
                    }}
                  >
                    {item.tag}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-mc-dim">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>
                <h3 className="font-bold text-mc-text mb-3 leading-snug pr-8">{item.title}</h3>
                <p className="text-sm text-mc-text/70 leading-relaxed mb-5 flex-1">{item.excerpt}</p>
                <button
                  onClick={() => setSelected(item)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-mc-green hover:gap-2.5 transition-all self-start"
                >
                  Czytaj więcej
                  <ArrowRight className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Article modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm animate-slideUp"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-mc-panel border-2 border-mc-border rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7 md:p-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-mc-dim hover:text-mc-green hover:bg-mc-panel2 rounded-sm transition-colors"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pr-10">
              <span
                className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm"
                style={{
                  color: TAG_COLORS[selected.tag] ?? "#22c55e",
                  backgroundColor: `${TAG_COLORS[selected.tag] ?? "#22c55e"}20`,
                }}
              >
                {selected.tag}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-mc-dim">
                <Calendar className="w-3.5 h-3.5" />
                {selected.date}
              </span>
            </div>

            <h2 className="font-minecraft text-lg md:text-xl text-mc-text mb-5 leading-snug">
              {selected.title}
            </h2>
            <p className="text-sm md:text-base text-mc-text/80 leading-relaxed whitespace-pre-line">
              {selected.content}
            </p>
          </div>
        </div>
      )}

      {/* Add news modal */}
      {showForm && (
        <NewsForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadNews();
          }}
        />
      )}
    </section>
  );
}

function NewsForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Aktualizacja");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError("Uzupełnij wszystkie pola.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("news").insert({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      tag: tag.trim(),
      author_email: user?.email ?? null,
    });

    setLoading(false);

    if (insertError) {
      setError("Nie udało się dodać newsa: " + insertError.message);
    } else {
      onCreated();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm animate-slideUp"
      onClick={onClose}
    >
      <div
        className="bg-mc-panel border-2 border-mc-border rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7 md:p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-mc-dim hover:text-mc-green hover:bg-mc-panel2 rounded-sm transition-colors"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-minecraft text-lg text-mc-text mb-6">Nowy news</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
              Tytuł
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              placeholder="np. Serwer wystartował!"
              className="w-full px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
              Kategoria
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text outline-none transition-colors disabled:opacity-50"
            >
              <option value="Aktualizacja">Aktualizacja</option>
              <option value="Rekrutacja">Rekrutacja</option>
              <option value="Sklep">Sklep</option>
              <option value="Event">Event</option>
              <option value="Ogłoszenie">Ogłoszenie</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
              Krótki opis (na karcie)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={loading}
              rows={2}
              placeholder="Jedno zdanie streszczające newsa..."
              className="w-full px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-mc-dim mb-2">
              Pełna treść
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={8}
              placeholder="Pełna treść newsa..."
              className="w-full px-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors disabled:opacity-50 resize-y"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <X className="w-4 h-4" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Opublikuj news
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
