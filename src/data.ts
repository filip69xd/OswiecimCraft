export const SERVER = {
  name: "OświęcimCraft",
  tagline: "Polski serwer Minecraft nowej generacji",
  ip: "pl21.chsrv.pl:52195",
  discord: "https://discord.gg/R9VQCCkcFa",
  version: "26.2",
};

export interface GameMode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  features: string[];
  accent: string;
}

export const GAME_MODES: GameMode[] = [
  {
    id: "survival",
    name: "Survival",
    tagline: "Klasyczna przygoda",
    description:
      "Czysty, klasyczny survival. Zbieraj surowce, buduj, eksploruj świat i przetrwaj na własnych zasadach. Żadnych działek, żadnych ograniczeń — tylko Ty, świat i inni gracze.",
    icon: "trees",
    features: [
      "Czysty survival bez ograniczeń",
      "Ekonomia i sklepy graczy",
      "Handel między graczami",
      "Eventy co tydzień",
      "Rankingi graczy",
      "Aktywna administracja 24/7",
    ],
    accent: "#22c55e",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  color: string;
}

export const TEAM: TeamMember[] = [
  { name: "Leimzq", role: "Owner", color: "#fbbf24" },
  { name: "Crimq", role: "Admin", color: "#ef4444" },
];

export interface ShopRank {
  id: string;
  name: string;
  price: number;
  color: string;
  badge: string;
  popular: boolean;
  perks: string[];
}

export const SHOP_RANKS: ShopRank[] = [
  {
    id: "vip",
    name: "VIP",
    price: 4.99,
    color: "#22c55e",
    badge: "Start",
    popular: false,
    perks: [
      "Prefix [VIP] na czacie",
      "Kolorowy nick",
      "Dostęp do /kit vip (co 24h)",
      "Priorytetowe wejście na serwer",
    ],
  },
  {
    id: "svip",
    name: "SVIP",
    price: 9.99,
    color: "#38bdf8",
    badge: "Popularne",
    popular: true,
    perks: [
      "Wszystko z rangi VIP",
      "Prefix [SVIP] na czacie",
      "Dostęp do /kit svip (co 24h)",
      "Komenda /heal (raz na 30 min)",
      "Komenda /feed (raz na 30 min)",
    ],
  },
  {
    id: "mvp",
    name: "MVP",
    price: 19.99,
    color: "#fbbf24",
    badge: "Premium",
    popular: false,
    perks: [
      "Wszystko z rangi SVIP",
      "Prefix [MVP] na czacie",
      "Dostęp do /kit mvp (co 24h)",
      "Komenda /heal (raz na 15 min)",
      "Komenda /feed (raz na 15 min)",
      "Własny tag na Discordzie",
      "Indywidualne wsparcie 24/7",
    ],
  },
  {
    id: "supporter",
    name: "Supporter",
    price: 14.99,
    color: "#a78bfa",
    badge: "Wsparcie",
    popular: false,
    perks: [
      "Wszystko z rangi MVP",
      "Prefix [SUPPORTER] na czacie",
      "Dostęp do /kit supporter (co 24h)",
      "Komenda /heal (raz na 10 min)",
      "Komenda /feed (raz na 10 min)",
      "Własny tag i kolor na Discordzie",
      "Indywidualne wsparcie 24/7",
    ],
  },
];

export interface ShopKey {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export const SHOP_KEYS: ShopKey[] = [
  {
    id: "key-basic",
    name: "Klucz Zwykły",
    price: 2.99,
    description: "Otwórz skrzynię z nagrodami podstawowymi — bloki, narzędzia i surowce.",
    icon: "key",
  },
  {
    id: "key-gold",
    name: "Klucz Złoty",
    price: 4.99,
    description: "Lepsze szanse na rzadkie przedmioty, enchanty i ekskluzywne kity.",
    icon: "key-round",
  },
  {
    id: "key-legend",
    name: "Klucz Legendarny",
    price: 9.99,
    description: "Najlepsze nagrody — unikalne przedmioty, rzadkie enchanty i bonusy na zawsze.",
    icon: "gem",
  },
];
