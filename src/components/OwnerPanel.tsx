import { useState, useEffect } from "react";
import {
  Crown,
  Shield,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserMinus,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  Mail,
  Coins,
  Gem,
  Diamond,
  Key,
  Wallet,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import SectionHeader from "./SectionHeader";

interface RegisteredUser {
  id: string;
  email: string;
  created_at: string;
  role: "owner" | "admin" | null;
}

interface WalletUser {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
  wallet: {
    coins: number;
    gems: number;
    diamonds: number;
    keys_basic: number;
    keys_gold: number;
  } | null;
}

const WALLET_FIELDS: { key: "coins" | "gems" | "diamonds" | "keys_basic" | "keys_gold"; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "coins", label: "Monety", icon: <Coins className="w-4 h-4" />, color: "#fbbf24" },
  { key: "gems", label: "Szmaragdy", icon: <Gem className="w-4 h-4" />, color: "#22c55e" },
  { key: "diamonds", label: "Diamenty", icon: <Diamond className="w-4 h-4" />, color: "#38bdf8" },
  { key: "keys_basic", label: "Klucze zwykłe", icon: <Key className="w-4 h-4" />, color: "#f97316" },
  { key: "keys_gold", label: "Klucze złote", icon: <Key className="w-4 h-4" />, color: "#eab308" },
];

interface Order {
  id: string;
  item_name: string;
  item_type: string;
  price: number;
  status: string;
  created_at: string;
  stripe_session_id: string | null;
  user_email: string | null;
}

export default function OwnerPanel() {
  const { user, role, loading } = useAuth();

  if (loading) return null;
  if (!user || !(role === "owner" || role === "admin")) return null;

  return <OwnerContent />;
}

function OwnerContent() {
  const { role } = useAuth();
  const isOwner = role === "owner";
  const [tab, setTab] = useState<"orders" | "admins" | "wallets">("orders");

  return (
    <section id="owner" className="py-24 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          tag={isOwner ? "Właściciel" : "Administrator"}
          title={isOwner ? "Panel właściciela" : "Panel administratora"}
        />

        <div className="mt-6 flex items-center gap-2 text-sm text-mc-gold justify-center">
          {isOwner ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          <span>
            Jesteś zalogowany jako {isOwner ? "właściciel" : "administrator"} serwera
          </span>
        </div>

        <div className="mt-8 flex justify-center gap-2 border-b border-mc-border">
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors border-b-2 ${
              tab === "orders"
                ? "text-mc-green border-mc-green"
                : "text-mc-dim border-transparent hover:text-mc-text"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Zamówienia
          </button>
          {isOwner && (
            <button
              onClick={() => setTab("admins")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors border-b-2 ${
                tab === "admins"
                  ? "text-mc-green border-mc-green"
                  : "text-mc-dim border-transparent hover:text-mc-text"
              }`}
            >
              <Users className="w-4 h-4" />
              Administratorzy
            </button>
          )}
          <button
            onClick={() => setTab("wallets")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors border-b-2 ${
              tab === "wallets"
                ? "text-mc-green border-mc-green"
                : "text-mc-dim border-transparent hover:text-mc-text"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Portfele graczy
          </button>
        </div>

        <div className="mt-8">
          {tab === "orders"
            ? <OrdersVerifier />
            : tab === "admins" && isOwner
              ? <AdminsManager />
              : tab === "wallets"
                ? <WalletManager />
                : <OrdersVerifier />}
        </div>
      </div>
    </section>
  );
}

function AdminsManager() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [hasSearched, setHasSearched] = useState(false);

  const searchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUsers(true);
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Nie udało się pobrać użytkowników.");
        setMessageType("error");
        setUsers([]);
      } else {
        setUsers(data.users || []);
      }
    } catch {
      setMessage("Błąd połączenia z serwerem.");
      setMessageType("error");
      setUsers([]);
    }

    setHasSearched(true);
    setLoadingUsers(false);
  };

  const promoteAdmin = async (targetUser: RegisteredUser) => {
    setActionLoading(targetUser.id);
    setMessage("");

    const { error } = await supabase
      .from("admin_roles")
      .insert({ user_id: targetUser.id, role: "admin", created_by: user?.id });

    if (error) {
      setMessage(`Nie udało się nadać uprawnień: ${error.message}`);
      setMessageType("error");
    } else {
      setMessage(`Nadano uprawnienia administratora: ${targetUser.email}`);
      setMessageType("success");
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: "admin" as const } : u))
      );
    }

    setActionLoading(null);
  };

  const demoteAdmin = async (targetUser: RegisteredUser) => {
    if (targetUser.role === "owner") return;

    setActionLoading(targetUser.id);
    setMessage("");

    const { error } = await supabase
      .from("admin_roles")
      .delete()
      .eq("user_id", targetUser.id);

    if (error) {
      setMessage(`Nie udało się odebrać uprawnień: ${error.message}`);
      setMessageType("error");
    } else {
      setMessage(`Odebrano uprawnienia administratora: ${targetUser.email}`);
      setMessageType("success");
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: null } : u))
      );
    }

    setActionLoading(null);
  };

  return (
    <div className="bg-mc-panel border-2 border-mc-border rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-mc-green" />
        <h3 className="font-minecraft text-sm text-mc-text">Zarządzanie administratorami</h3>
      </div>

      <p className="text-sm text-mc-text/70 mb-5">
        Wyszukaj zarejestrowanych użytkowników po e-mailu i nadaj im uprawnienia administratora.
        Administratorzy mogą weryfikować zamówienia i wysyłać newslettery, ale nie mogą zarządzać innymi adminami.
      </p>

      <form onSubmit={searchUsers} className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po e-mailu (np. jan@gmail.com)"
            className="w-full pl-10 pr-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loadingUsers}
          className="px-6 py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green disabled:opacity-50 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
        >
          {loadingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : "Szukaj"}
        </button>
      </form>

      {message && (
        <div
          className={`mb-4 flex items-start gap-2 text-sm p-3 rounded-sm ${
            messageType === "success"
              ? "bg-mc-green2/10 text-mc-green"
              : "bg-red-400/10 text-red-400"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {loadingUsers ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
        </div>
      ) : hasSearched && users.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="w-10 h-10 text-mc-dim mx-auto mb-3" />
          <p className="text-sm text-mc-text/60">
            {searchQuery.trim()
              ? "Nie znaleziono użytkowników o tym e-mailu."
              : "Brak zarejestrowanych użytkowników."}
          </p>
        </div>
      ) : users.length > 0 ? (
        <div className="divide-y divide-mc-border border border-mc-border rounded-sm overflow-hidden">
          {users.map((u) => (
            <div
              key={u.id}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-mc-bg/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-sm ${
                    u.role === "owner"
                      ? "bg-mc-gold2/15 text-mc-gold"
                      : u.role === "admin"
                      ? "bg-mc-green2/15 text-mc-green"
                      : "bg-mc-panel2 text-mc-dim"
                  }`}
                >
                  {u.role === "owner" ? (
                    <Crown className="w-4 h-4" />
                  ) : u.role === "admin" ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-mc-text break-all">{u.email}</p>
                  <p className="text-xs text-mc-dim">
                    {u.role === "owner"
                      ? "Właściciel"
                      : u.role === "admin"
                      ? "Administrator"
                      : "Gracz"}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {u.role === "owner" ? (
                  <span className="text-xs font-bold text-mc-gold bg-mc-gold2/10 px-3 py-2 rounded-sm">
                    Nie można zmienić
                  </span>
                ) : u.role === "admin" ? (
                  <button
                    onClick={() => demoteAdmin(u)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-sm transition-colors disabled:opacity-50"
                  >
                    {actionLoading === u.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="w-3.5 h-3.5" />
                    )}
                    Odbierz admina
                  </button>
                ) : (
                  <button
                    onClick={() => promoteAdmin(u)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-mc-green bg-mc-green2/10 hover:bg-mc-green2/20 rounded-sm transition-colors disabled:opacity-50"
                  >
                    {actionLoading === u.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    Nadaj admina
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OrdersVerifier() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [search, setSearch] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("id, item_name, item_type, price, status, created_at, stripe_session_id, buyer_email")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(
        data.map((o: any) => ({
          id: o.id,
          item_name: o.item_name,
          item_type: o.item_type,
          price: Number(o.price),
          status: o.status,
          created_at: o.created_at,
          stripe_session_id: o.stripe_session_id,
          user_email: o.buyer_email ?? null,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        o.item_name.toLowerCase().includes(q) ||
        (o.user_email ?? "").toLowerCase().includes(q) ||
        (o.stripe_session_id ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.status === "paid").length,
    pending: orders.filter((o) => o.status === "pending").length,
    revenue: orders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + o.price, 0),
  };

  return (
    <div className="bg-mc-panel border-2 border-mc-border rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-mc-green" />
        <h3 className="font-minecraft text-sm text-mc-text">Weryfikacja zamówień</h3>
      </div>

      <p className="text-sm text-mc-text/70 mb-5">
        Przeglądaj wszystkie zamówienia ze sklepu. Sprawdzaj status płatności, kwotę, kupiony przedmiot
        oraz dane kupującego w razie problemów z realizacją.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-mc-bg/50 border border-mc-border rounded-sm p-3 text-center">
          <p className="text-xs text-mc-dim uppercase tracking-wider mb-1">Wszystkie</p>
          <p className="text-xl font-bold text-mc-text">{stats.total}</p>
        </div>
        <div className="bg-mc-bg/50 border border-mc-border rounded-sm p-3 text-center">
          <p className="text-xs text-mc-dim uppercase tracking-wider mb-1">Opłacone</p>
          <p className="text-xl font-bold text-mc-green">{stats.paid}</p>
        </div>
        <div className="bg-mc-bg/50 border border-mc-border rounded-sm p-3 text-center">
          <p className="text-xs text-mc-dim uppercase tracking-wider mb-1">Oczekujące</p>
          <p className="text-xl font-bold text-mc-gold">{stats.pending}</p>
        </div>
        <div className="bg-mc-bg/50 border border-mc-border rounded-sm p-3 text-center">
          <p className="text-xs text-mc-dim uppercase tracking-wider mb-1">Przychód</p>
          <p className="text-xl font-bold text-mc-text">{stats.revenue.toFixed(2)} zł</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po nazwie, e-mailu lub ID sesji Stripe"
            className="w-full pl-10 pr-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "paid", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-xs font-bold rounded-sm transition-colors ${
                filter === f
                  ? "bg-mc-green2 text-mc-bg"
                  : "bg-mc-bg border border-mc-border text-mc-dim hover:text-mc-text"
              }`}
            >
              {f === "all" ? "Wszystkie" : f === "paid" ? "Opłacone" : "Oczekujące"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center">
          <ShoppingBag className="w-10 h-10 text-mc-dim mx-auto mb-3" />
          <p className="text-sm text-mc-text/60">Brak zamówień do wyświetlenia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="bg-mc-bg/50 border border-mc-border rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-sm flex-shrink-0 ${
                    o.status === "paid"
                      ? "bg-mc-green2/15 text-mc-green"
                      : "bg-mc-gold2/15 text-mc-gold"
                  }`}
                >
                  {o.status === "paid" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-mc-text truncate">{o.item_name}</p>
                  <p className="text-xs text-mc-dim mt-0.5">
                    {new Date(o.created_at).toLocaleString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {o.user_email && (
                    <p className="text-xs text-mc-text/60 flex items-center gap-1 mt-1 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {o.user_email}
                    </p>
                  )}
                  {o.stripe_session_id && (
                    <p className="text-xs text-mc-dim mt-1 truncate font-mono">
                      Stripe: {o.stripe_session_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm font-bold text-mc-text">{o.price.toFixed(2)} zł</span>
                <span
                  className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                    o.status === "paid"
                      ? "bg-mc-green2/15 text-mc-green"
                      : "bg-mc-gold2/15 text-mc-gold"
                  }`}
                >
                  {o.status === "paid" ? "Opłacone" : "Oczekujące"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WalletManager() {
  const [users, setUsers] = useState<WalletUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [adjustField, setAdjustField] = useState<"coins" | "gems" | "diamonds" | "keys_basic" | "keys_gold">("coins");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustAction, setAdjustAction] = useState<"add" | "set" | "remove">("add");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const url = search
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-wallet?q=${encodeURIComponent(search)}`
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-wallet`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg({ type: "err", text: data.error || "Błąd ładowania" });
    } else {
      setUsers(data.users ?? []);
      setMsg(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search]);

  const doSearch = () => {
    setSearch(searchInput.trim());
  };

  const adjust = async (userId: string) => {
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount < 0) {
      setMsg({ type: "err", text: "Podaj poprawną liczbę" });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ userId, action: adjustAction, field: adjustField, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd");
      setMsg({ type: "ok", text: `Zaktualizowano: ${adjustField} = ${data.newValue}` });
      setAdjustAmount("");
      load();
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Nie udało się" });
    }
    setBusy(false);
  };

  const removeItem = async (userId: string, itemKey: string, itemName: string) => {
    if (!confirm(`Usunąć przedmiot "${itemName}" z konta gracza?`)) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-wallet`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ userId, itemKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd");
      setMsg({ type: "ok", text: `Usunięto: ${itemName}` });
      load();
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Nie udało się" });
    }
  };

  return (
    <div className="bg-mc-panel border-2 border-mc-border rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-mc-gold" />
        <h3 className="font-minecraft text-sm text-mc-text">Portfele graczy</h3>
      </div>
      <p className="text-sm text-mc-text/70 mb-5">
        Dodawaj i usuwaj monety, szmaragdy, diamenty oraz klucze z portfeli graczy. Możesz też usuwać
        przedmioty kupione za monety.
      </p>

      {msg && (
        <div className={`mb-4 p-3 rounded-sm text-xs font-bold ${msg.type === "ok" ? "bg-mc-green2/15 text-mc-green" : "bg-red-500/15 text-red-400"}`}>
          {msg.text}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-dim" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Szukaj po e-mailu..."
            className="w-full pl-10 pr-4 py-3 bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm text-sm text-mc-text placeholder:text-mc-dim outline-none transition-colors"
          />
        </div>
        <button
          onClick={doSearch}
          className="px-5 py-3 bg-mc-green2 text-mc-bg font-bold text-sm rounded-sm hover:bg-mc-green"
        >
          Szukaj
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="w-10 h-10 text-mc-dim mx-auto mb-3" />
          <p className="text-sm text-mc-text/60">Brak graczy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-mc-bg/50 border border-mc-border rounded-sm">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-mc-bg/80 transition-colors"
                onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-mc-green2/15 flex items-center justify-center rounded-sm flex-shrink-0">
                    <Users className="w-4 h-4 text-mc-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-mc-text truncate">{u.email}</p>
                    <p className="text-xs text-mc-dim">
                      {u.role ? `Rola: ${u.role}` : "Gracz"}
                      {u.wallet ? ` · ${Number(u.wallet.coins).toLocaleString("pl-PL")} monet` : " · Brak portfela"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-mc-dim flex-shrink-0">
                  {expandedUser === u.id ? "▲" : "▼"}
                </span>
              </div>

              {expandedUser === u.id && (
                <div className="px-4 pb-4 border-t border-mc-border">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 mb-5">
                    {WALLET_FIELDS.map((f) => (
                      <div key={f.key} className="bg-mc-bg border border-mc-border rounded-sm p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1" style={{ color: f.color }}>
                          {f.icon}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-mc-dim">{f.label}</p>
                        <p className="font-minecraft text-sm text-mc-text">
                          {u.wallet ? Number(u.wallet[f.key] ?? 0).toLocaleString("pl-PL") : "0"}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-mc-bg border border-mc-border rounded-sm p-4">
                    <p className="text-xs text-mc-dim uppercase tracking-widest font-bold mb-3">Zarządzaj saldem</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        value={adjustAction}
                        onChange={(e) => setAdjustAction(e.target.value as "add" | "set" | "remove")}
                        className="bg-mc-bg border border-mc-border rounded-sm px-3 py-2 text-xs text-mc-text outline-none"
                      >
                        <option value="add">Dodaj</option>
                        <option value="set">Ustaw</option>
                        <option value="remove">Odejmij</option>
                      </select>
                      <select
                        value={adjustField}
                        onChange={(e) => setAdjustField(e.target.value as "coins" | "gems" | "diamonds" | "keys_basic" | "keys_gold")}
                        className="bg-mc-bg border border-mc-border rounded-sm px-3 py-2 text-xs text-mc-text outline-none"
                      >
                        {WALLET_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="Ilość"
                        className="w-24 bg-mc-bg border border-mc-border rounded-sm px-3 py-2 text-xs text-mc-text placeholder:text-mc-dim outline-none"
                      />
                      <button
                        onClick={() => adjust(u.id)}
                        disabled={busy}
                        className="px-4 py-2 bg-mc-green2 text-mc-bg font-bold text-xs rounded-sm hover:bg-mc-green disabled:opacity-50 flex items-center gap-1"
                      >
                        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : adjustAction === "add" ? <Plus className="w-3.5 h-3.5" /> : adjustAction === "remove" ? <Minus className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Zastosuj
                      </button>
                    </div>
                  </div>

                  <UserPurchases userId={u.id} onRemove={removeItem} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserPurchases({ userId, onRemove }: { userId: string; onRemove: (userId: string, itemKey: string, itemName: string) => void }) {
  const [items, setItems] = useState<{ id: string; item_key: string; item_name: string; price_coins: number; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("coin_purchases")
        .select("id, item_key, item_name, price_coins, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setItems(data as any);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return <div className="mt-4 text-xs text-mc-dim">Ładowanie zakupów...</div>;
  if (items.length === 0) return <p className="mt-4 text-xs text-mc-dim">Brak zakupów za monety.</p>;

  return (
    <div className="mt-4">
      <p className="text-xs text-mc-dim uppercase tracking-widest font-bold mb-2">Zakupy za monety ({items.length})</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-mc-bg border border-mc-border rounded-sm p-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="w-3.5 h-3.5 text-mc-gold flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-mc-text truncate">{item.item_name}</p>
                <p className="text-[10px] text-mc-dim">
                  {item.price_coins} monet · {new Date(item.created_at).toLocaleDateString("pl-PL")}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(userId, item.item_key, item.item_name)}
              className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-sm transition-colors flex-shrink-0"
              title="Usuń przedmiot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
