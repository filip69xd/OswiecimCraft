import { useEffect, useState } from "react";
import { Menu, X, Swords, User, LogOut, Crown, ChevronDown } from "lucide-react";
import { SERVER } from "../data";
import { useAuth } from "../lib/auth";

interface NavGroup {
  label: string;
  items: { href: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Serwer",
    items: [
      { href: "#home", label: "Start" },
      { href: "#modes", label: "Tryby gry" },
      { href: "#join", label: "Jak dołączyć" },
      { href: "#team", label: "Zespół" },
      { href: "#news", label: "Newsy" },
    ],
  },
  {
    label: "Sklepy",
    items: [
      { href: "#shop", label: "Sklep" },
      { href: "#shop-terms", label: "Regulamin sklepu" },
      { href: "#coin-shop", label: "Sklep monet" },
      { href: "#rewards", label: "Nagrody dzienne" },
      { href: "#leaderboard", label: "Ranking" },
    ],
  },
];

export default function Navbar({
  onAuthClick,
}: {
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-nav-group]")) setOpenGroup(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-mc-bg/90 backdrop-blur-md border-b border-mc-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-mc-green2 flex items-center justify-center rounded-sm group-hover:rotate-6 transition-transform">
            <Swords className="w-5 h-5 text-mc-bg" strokeWidth={2.5} />
          </div>
          <span className="font-minecraft text-[11px] md:text-sm text-mc-green tracking-wide">
            OświęcimCraft
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="relative" data-nav-group>
              <button
                onClick={() =>
                  setOpenGroup((cur) => (cur === group.label ? null : group.label))
                }
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-mc-text/80 hover:text-mc-green hover:bg-mc-panel2 rounded-sm transition-colors"
              >
                {group.label}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    openGroup === group.label ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openGroup === group.label && (
                <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-mc-panel border border-mc-border rounded-sm shadow-xl py-1">
                  {group.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenGroup(null)}
                      className="block px-4 py-2 text-sm text-mc-text/80 hover:text-mc-green hover:bg-mc-panel2 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              {role === "owner" && (
                <a
                  href="#owner"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-mc-gold bg-mc-gold2/10 border border-mc-gold/30 hover:border-mc-gold rounded-sm transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden lg:inline">Panel właściciela</span>
                </a>
              )}
              <a
                href="#account"
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-mc-text bg-mc-panel2 border border-mc-border hover:border-mc-green rounded-sm transition-colors"
              >
                <User className="w-4 h-4 text-mc-green" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </a>
              <button
                onClick={signOut}
                className="px-3 py-2 text-sm font-bold text-mc-text/70 hover:text-red-400 bg-mc-panel2 border border-mc-border hover:border-red-400 rounded-sm transition-colors"
                aria-label="Wyloguj"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAuthClick("signin")}
              className="ml-2 px-5 py-2 text-sm font-bold bg-mc-panel2 text-mc-text border border-mc-border hover:border-mc-green rounded-sm transition-colors"
            >
              Logowanie
            </button>
          )}
          <a
            href={SERVER.discord}
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-5 py-2 text-sm font-bold bg-mc-green2 text-mc-bg rounded-sm block-shadow hover:bg-mc-green"
          >
            Discord
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-mc-green"
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-mc-bg/95 backdrop-blur-md border-t border-mc-border max-h-[80vh] overflow-y-auto">
          <div className="px-5 py-4 flex flex-col gap-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-1">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-mc-dim">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-mc-text/80 hover:text-mc-green hover:bg-mc-panel2 rounded-sm transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
            {user ? (
              <>
                <a
                  href="#account"
                  onClick={() => setOpen(false)}
                  className="mt-2 px-4 py-3 text-sm font-bold text-mc-text bg-mc-panel2 rounded-sm flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-mc-green" />
                  <span className="truncate">{user.email}</span>
                </a>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="px-4 py-3 text-sm font-bold text-red-400 bg-mc-panel2 rounded-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onAuthClick("signin");
                  setOpen(false);
                }}
                className="px-4 py-3 text-sm font-bold text-mc-text bg-mc-panel2 rounded-sm text-center"
              >
                Logowanie
              </button>
            )}
            <a
              href={SERVER.discord}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 text-sm font-bold bg-mc-green2 text-mc-bg rounded-sm text-center"
            >
              Dołącz na Discord
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
