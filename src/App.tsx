import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GameModes from "./components/GameModes";
import HowToJoin from "./components/HowToJoin";
import Shop from "./components/Shop";
import Team from "./components/Team";
import News from "./components/News";
import Newsletter from "./components/Newsletter";
import NewsletterAdmin from "./components/NewsletterAdmin";
import OwnerPanel from "./components/OwnerPanel";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import Account from "./components/Account";
import ShopTerms from "./components/ShopTerms";
import DailyRewardsSection from "./components/DailyRewards";
import CoinShop from "./components/CoinShop";
import Leaderboard from "./components/Leaderboard";
import { AuthProvider } from "./lib/auth";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-mc-bg text-mc-text">
        <Navbar onAuthClick={openAuth} />
        <main>
          {/* Serwer — informacje o serwerze */}
          <Hero />
          <GameModes />
          <HowToJoin />
          <Team />
          <News />

          {/* Sklepy — zakupy i informacje o sklepach */}
          <Shop onAuthClick={openAuth} />
          <ShopTerms />
          <CoinShop onAuthClick={openAuth} />
          <DailyRewardsSection onAuthClick={openAuth} />
          <Leaderboard />

          {/* Konto gracza — panel, nagrody, panel właściciela */}
          <Account onAuthClick={openAuth} />
          <OwnerPanel />
          <NewsletterAdmin />
          <Newsletter />
        </main>
        <Footer />
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          initialMode={authMode}
        />
      </div>
    </AuthProvider>
  );
}
