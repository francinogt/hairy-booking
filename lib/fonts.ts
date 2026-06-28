import { Geist, Geist_Mono, Inter, Lora, Montserrat, Poppins } from "next/font/google";
import { isFontKey, type FontKey } from "@/lib/font-options";

// next/font laedt + hostet zur BUILD-Zeit. WICHTIG: Jeder Loader-Aufruf MUSS einer
// eigenen const auf Modulebene zugewiesen werden (Compiler-Regel von next/font) –
// nicht verschachtelt in einem Objektliteral. Die kuratierte Menge wird vorgeladen,
// je eigene CSS-Variable; die aktive Wahl schaltet --brand-font-* (fontCssVars) um.

export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const geist = Geist({ subsets: ["latin"], variable: "--f-geist", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--f-inter", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-poppins",
  display: "swap",
});
const montserrat = Montserrat({ subsets: ["latin"], variable: "--f-montserrat", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--f-lora", display: "swap" });

const LOADED: Record<FontKey, { variable: string }> = {
  geist,
  inter,
  poppins,
  montserrat,
  lora,
};

/** Alle Font-CSS-Variablen-Klassen + Mono -> auf <html> setzen. */
export const baseFontClasses = [
  geistMono.variable,
  ...Object.values(LOADED).map((f) => f.variable),
].join(" ");

/** Baut die :root-Zuweisung, die --brand-font-heading/-body auf die Auswahl mappt. */
export function fontCssVars(headingKey: string, bodyKey: string): string {
  const heading = isFontKey(headingKey) ? headingKey : "geist";
  const body = isFontKey(bodyKey) ? bodyKey : "geist";
  return (
    `--brand-font-heading:var(${LOADED[heading].variable});` +
    `--brand-font-body:var(${LOADED[body].variable});`
  );
}
