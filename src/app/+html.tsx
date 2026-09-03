import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { BRAND } from '@/config/brand';
import { categoryColors, colors } from '@/theme';

/**
 * Das HTML-Gerüst, in das die Web-Version hineingerendert wird.
 *
 * Diese Datei läuft NUR beim Bauen und NUR im Browser-Ausgang — auf iOS gibt es sie
 * nicht. Sie ist kein Screen: Sie kann keine Hooks, keinen Zustand und nichts aus dem
 * Datenmodell. Was hier steht, ist das, was der Browser sieht, BEVOR das JavaScript
 * geladen ist.
 *
 * ── Warum es sie gibt (Ians Rückmeldung vom 2026-09-02) ───────────────────────
 * „Wenn ich die App auf Chrome am Handy öffne, sieht es echt kurz komisch aus."
 * Nachgemessen, indem das gebaute `dist/index.html` ohne seine `<script>`-Tags
 * gerendert wurde — also genau der Zustand, den Chrome in den ersten Momenten zeigt:
 * Die oberste Karte des Wischstapels lag schief und halb aus dem Bild, der Stempel
 * „Weg" war sichtbar, und die Wortmarke klebte am oberen Rand.
 *
 * Das ist kein Fehler im Stapel, sondern eine Eigenschaft des statischen Exports.
 * `WischKarte` richtet sich nach drei Werten, die es beim Bauen noch nicht gibt:
 * `useWindowDimensions()` (kein Fenster), die selbst gemessene Kartenbreite
 * (`onLayout` läuft nur im Browser) und die Sicherheitsabstände des Geräts
 * (`useSafeAreaInsets` — deshalb `padding: 0px` im gebauten HTML). Der Vorab-Zustand
 * KANN also nicht richtig aussehen. Ihn nachzubauen hieße, dieselben Zahlen zweimal
 * zu pflegen und beim nächsten Layout-Wechsel wieder auseinanderlaufen zu lassen.
 *
 * Deshalb wird er nicht repariert, sondern **verdeckt**: `#ss-start` liegt vom ersten
 * Bildpunkt an über allem und zeigt die Wortmarke auf der Grundfarbe. Sobald React
 * übernommen hat, setzt `app/_layout.tsx` die Klasse `ss-bereit` und die Fläche
 * blendet in 180 ms weg. Was man dann sieht, ist die fertige App — nie der halbe Weg
 * dorthin.
 *
 * **Das Sicherheitsnetz ist wichtiger als der Effekt:** Käme das JavaScript nie an
 * (schlechtes Netz, Bundle-Fehler), läge die Fläche für immer über der App und der
 * Prototyp wäre eine tote Seite. Deshalb blendet die CSS-Animation `ss-notausgang`
 * sie nach 8 Sekunden auch ohne JavaScript weg. Lieber der schiefe Stapel als gar
 * nichts — die Animation gehört zum Fix, nicht zur Zier.
 *
 * ── Drei Fehler, die beim Nachmessen nebenbei auffielen ───────────────────────
 *  1. `<html lang="en">` bei einer durchgehend deutschen App. Chrome auf Android
 *     bietet dann von sich aus „Seite übersetzen?" an — auch das ist etwas, das beim
 *     Öffnen kurz auftaucht und nicht dorthin gehört.
 *  2. Der `<title>` war LEER. Im Browser-Tab und in jedem geteilten Link stand die
 *     nackte URL.
 *  3. Kein `theme-color`. Android-Chrome färbt damit seine Adressleiste; ohne den
 *     Eintrag bleibt sie weiß und stößt hart gegen das Papierweiß der App.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* `viewport-fit=cover` gehört dazu, sonst liefert `env(safe-area-inset-*)`
            auf dem iPhone nichts und die Insets bleiben 0 — genau der Abstand, der
            im gebauten HTML gefehlt hat. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        {/* Gilt nur, solange kein JavaScript läuft: React Navigation setzt den Titel
            danach über react-helmet neu. Deshalb steht er ZUSÄTZLICH in
            `app/_layout.tsx` — beide zusammen, sonst ist er in einem der beiden
            Momente leer. */}
        <title>{BRAND.name}</title>
        <meta name="description" content={BRAND.claim} />
        <meta name="theme-color" content={colors.bg} />

        {/* Muss VOR dem eigenen Stil stehen: Der Reset schaltet das Body-Scrollen ab,
            damit sich `ScrollView` auf Web wie auf dem Gerät verhält. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: startFlaeche }} />
      </head>
      <body>
        {children}
        {/* Steht NACH `children` und damit über der App, ohne `z-index`-Wettrennen.
            React fasst diesen Knoten nie an — er liegt außerhalb von `#root`. */}
        <div id="ss-start" aria-hidden="true">
          <div id="ss-start-marke">
            {BRAND.wordmark.first}
            <span>{BRAND.wordmark.second}</span>
          </div>
        </div>
      </body>
    </html>
  );
}

/**
 * Der Stil der Startfläche. Als Zeichenkette und nicht als `StyleSheet`, weil React
 * Native Web hier nicht läuft: Dieser Knoten steht außerhalb von `#root`.
 *
 * Die Schriftfamilie ist dieselbe Liste, die React Native Web selbst einsetzt. Stünde
 * hier etwas anderes, spränge die Wortmarke beim Übergang um — und genau das Springen
 * soll ja weg.
 */
const startFlaeche = `
  html, body { background-color: ${colors.bg}; }

  #ss-start {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background-color: ${colors.bg};
    opacity: 1;
    transition: opacity 180ms ease-out;
    /* Das Sicherheitsnetz: Kommt das JavaScript nie an, blendet die Fläche nach
       8 Sekunden trotzdem weg. Ohne sie wäre ein Bundle-Fehler eine leere Seite. */
    animation: ss-notausgang 1s ease-out 8s forwards;
  }

  /* Setzt app/_layout.tsx, sobald React montiert ist. */
  html.ss-bereit #ss-start { opacity: 0; pointer-events: none; }

  @keyframes ss-notausgang { to { opacity: 0; visibility: hidden; } }

  #ss-start-marke {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 28px; font-weight: 700; letter-spacing: -0.4px;
    color: ${colors.ink};
  }
  #ss-start-marke span { color: ${categoryColors.creative.base}; }

  /* Wer „Bewegung reduzieren" eingestellt hat, bekommt keinen Übergang — die Fläche
     ist dann sofort weg statt weich. Das Sicherheitsnetz bleibt. */
  @media (prefers-reduced-motion: reduce) {
    #ss-start { transition: none; }
  }
`;
