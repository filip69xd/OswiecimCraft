import { ScrollText } from "lucide-react";
import SectionHeader from "./SectionHeader";

const SECTIONS = [
  {
    title: "1. Postanowienia ogólne",
    body: [
      "Niniejszy regulamin określa zasady zakupu rang, kluczy i pakietów w sklepie OświęcimCraft.",
      "Zakup w sklepie jest dobrowolny i służy utrzymaniu oraz rozwojowi serwera. Nie jest wymagany do gry.",
      "Złożenie zamówienia jest równoznaczne z akceptacją niniejszego regulaminu.",
    ],
  },
  {
    title: "2. Realizacja zamówień",
    body: [
      "Po opłaceniu zamówienia rangę, klucze lub pakiet aktywujemy na koncie gracza w ciągu 24 godzin.",
      "W przypadku problemów z realizacją prosimy o kontakt przez Discord — rozwiążemy sprawę jak najszybciej.",
      "Wymagane jest podanie nicku gracza zgodnego z kontem Minecraft, na którym zamówienie ma zostać zrealizowane.",
    ],
  },
  {
    title: "3. Zwroty i reklamacje",
    body: [
      "Zgodnie z art. 38 ust. 13 ustawy o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość nie przysługuje w przypadku dostarczania treści cyfrowych, które nie są zapisane na nośniku materialnym, jeżeli spełnianie świadczenia rozpoczęło się za wyraźną zgodą konsumenta przed upływem terminu do odstąpienia od umowy.",
      "W przypadku błędu w realizacji zamówienia lub niedziałania usługi, przysługuje reklamacja. Reklamacje rozpatrujemy w ciągu 14 dni od zgłoszenia.",
      "Reklamacje prosimy zgłaszać przez Discord, podając adres e-mail użyty przy zakupie oraz nick gracza.",
    ],
  },
  {
    title: "4. Zasady korzystania z rang i pakietów",
    body: [
      "Rangi i pakiety są przypisane do konta gracza i nie podlegają transferowi na inne osoby.",
      "Naruszenie regulaminu serwera może skutkować utratą rangi lub pakietu bez zwrotu kosztów.",
      "W przypadku trwałego zamknięcia serwera zakupy nie podlegają zwrotowi, ponieważ środki zostały przeznaczone na utrzymanie i rozwój serwera.",
    ],
  },
  {
    title: "5. Płatności",
    body: [
      "Płatności obsługiwane są bezpiecznie przez Stripe. Nie przechowujemy danych kart płatniczych.",
      "Ceny w sklepie wyrażone są w polskich złotych (PLN) i zawierają podatki.",
      "Zamówienie zostaje zrealizowane po otrzymaniu potwierdzenia płatności od operatora.",
    ],
  },
  {
    title: "6. Kontakt",
    body: [
      "W sprawach związanych ze sklepem prosimy o kontakt przez nasz serwer Discord.",
      "W każdej wiadomości podaj adres e-mail użyty przy zakupie oraz nick gracza, abyśmy mogli szybko zidentyfikować zamówienie.",
    ],
  },
];

export default function ShopTerms() {
  return (
    <section id="shop-terms" className="relative py-24 md:py-32 px-5 md:px-8">
      <div className="absolute inset-0 pixel-grid opacity-30" />
      <div className="relative max-w-3xl mx-auto">
        <SectionHeader
          tag="Regulamin"
          title="Regulamin sklepu"
          subtitle="Zasady zakupu rang, kluczy i pakietów w sklepie OświęcimCraft."
        />

        <div className="mt-12 bg-mc-panel border-2 border-mc-border rounded-sm p-7 md:p-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-mc-border">
            <div className="w-12 h-12 flex items-center justify-center bg-mc-green2/15 text-mc-green rounded-sm">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-minecraft text-base text-mc-text">
                OświęcimCraft — Sklep
              </h3>
              <p className="text-xs text-mc-dim mt-1">
                Ostatnia aktualizacja: 29.07.2026
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h4 className="font-bold text-mc-text text-sm mb-3">{s.title}</h4>
                <ul className="space-y-2">
                  {s.body.map((line, i) => (
                    <li key={i} className="text-sm text-mc-text/75 leading-relaxed flex gap-2.5">
                      <span className="text-mc-green mt-1 flex-shrink-0">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
