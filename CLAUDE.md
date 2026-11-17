# Tankprotokoll – Projektkontext für Claude Code

PWA zum Erfassen von Tankungen (Verbrauch, Kosten, Historie). Nutzer: Lutz, testet auf dem iPhone,
deployt über GitHub Pages. Sprache der App und der Antworten: Deutsch, per Du.
Stand bei Umzug aus dem Chat: **v4.3** (Oktober 2026).

## Kostenzeile (jede Antwort)
- Am Ende jeder Antwort `python3 tools/kosten.py` im Projektverzeichnis ausführen.
- Die Ausgabe **wörtlich** als letzte Zeile setzen: roh, nicht im Codeblock, nicht umformatieren.
- Details und Fallbacks stehen im Skill `kostenzeile`. Fehlt `tools/kosten.py`, Skill-Kopie nach `tools/` legen.

## Dateien
- `index.html` – die ganze App: Markup, CSS, JS, alle 11 Bilder als Data-URIs eingebettet (~280 KB)
- `1-sw.js` – Service Worker, eigene Dateien Netz zuerst; Cache-Name bei Asset-Änderungen hochzählen
- `2-manifest.webmanifest`, `3-icon.png` (512), `4-icon-180.png` (Apple-Touch-Icon)
- Diese fünf müssen Dateien bleiben (iOS nimmt das Home-Icon nicht eingebettet). Nichts weiter auslagern.

## Bei jeder Änderung
- `APP_VERSION` in `index.html` hochzählen **und** die sichtbare Marke `tabindex="0">vX.Y<` mit.
- Danach testen (s. u.) und Lutz nur die geänderten Dateien nennen.

## Datenmodell (localStorage)
- Schlüssel heißen weiterhin `tankbuch.*` (alter App-Name). **Nie umbenennen** – sonst sind die Daten weg.
  `tankbuch.eintraege`, `tankbuch.einstellungen`, `tankbuch.entwurf`, `tankbuch.gesehen`,
  `tankbuch.apikey` (Anthropic-Schlüssel für die Foto-Rückfallebene – bewusst **nicht** in `einst`, damit er nie im Export landet).
- Eintrag: `{id, datum:'YYYY-MM-DD', liter, preis, km, stand, voll, ts, fz}`; `fz` = Fahrzeug-ID.
- Einstellungen: `fahrzeuge:[{id,name,spitzname,kraftstoff}]`, `aktiv`, `einheit` (1/10/100),
  `kmModus` ('trip'|'stand'), `zeitraum`, `monatsModus` ('verursacht'|'gezahlt'), `eingerichtet`, `migration`.
- Migrationen laufen beim Start einmalig (Einzelfahrzeug → `fahrzeuge[]`, Einträge ohne `fz` → erstes Fahrzeug).

## Rechenlogik (getestet, nicht ohne Grund ändern)
- Verbrauch nur von Volltankung zu Volltankung; Teilbetankungen werden bis zur nächsten Volltankung summiert.
- Kilometerstand-Modus: Strecke = Differenz zum vorigen Stand **desselben Fahrzeugs** (`festschreiben()`).
- Monatskosten „verursacht“: jede Tankung tagesanteilig auf die Tage seit der vorigen Tankung verteilt.
  Prüfwert: 50 € am 06.02., 72 € am 03.03. → Feb 113,36 €, März 8,64 €, Summe 122 €.
- Beispielhistorie: 24 Monate, echte ADAC-Monatsmittel Super E10 (Stand 01.09.2026), schreibt nie in den Speicher.

## Lutz' Fahrzeug
- Ford Galaxy 2.0 EcoBlue Bi-Turbo Diesel, 177 kW (240 PS), Frontantrieb, Erstzulassung 05/2019.
- **Dieseltank 63 l** (Ford-Betriebsanleitung, „Füllmengen – 2.0L EcoBlue“: 63 l Frontantrieb, 61 l Allrad).
  Online stehen oft 70 l – das ist die ältere TDCi-Generation ohne AdBlue.
  Nennvolumen, keine harte Grenze: Lutz hat sehr leer und bis zum Rand schon 64 l getankt
  (Einfüllrohr fasst zusätzlich). Plausibilitätsprüfung daher nur als weicher Hinweis, nie als Sperre.
- Bordcomputer-Ø lag im Okt. 2026 bei 7,1 statt 6,2 l/100 km (913 km, 56,67 l voll zu voll), also ~14 % zu hoch.
  Bisher nur ein Intervall – die App rechnet richtig, nicht an den Bordcomputer anpassen.

## Fachwissen Zapfsäule (recherchiert Nov. 2026)
- **Preis vs. Menge × Grundpreis** – MID 2014/32/EU Anh. VII (MI-005) Nr. 5.5.3 und OIML R 117-1:2019:
  Differenz ≤ Preis von E_min, muss aber nicht kleiner als der kleinste Geldwert sein.
  E_min = 2 · MMQ · A/100; Zapfsäulen Klasse 0,5 → bei MMQ 5 l („Vmin. 5 Liter“): 0,05 l ≈ 11 ct.
  Die App prüft strenger (±1,1 ct). Rechnet eine Säule den Preis aus einer feineren internen Menge,
  kann das „Nicht sicher“ ergeben [Vermutung, bisher nicht beobachtet; Aral-Foto passte exakt gerundet].
- **Reihenfolge der Anzeigen**: in keiner gelesenen Vorschrift festgelegt (MID, OIML R 117, BEV E-24).
  „Literpreis unten“ in `deute()` bleibt Annahme. BEV E-24: an jeder Anzeige die Bezeichnung (€, Liter/L/l, €/l).
- **Ziffernhöhe** (OIML R 117-1 Nr. 5.1): Menge und Betrag ≥ 10 mm, Grundpreis nur ≥ 4 mm → Grundpreis oft kleiner.
  Vor jeder Abgabe Segmenttest („8888“, leer, Nullen) – Foto erst nach dem Tanken sinnvoll.
- **Teilungswert** Menge i. d. R. 0,01 l. Beim Einhängen der Pistole kann die Anzeige noch um 0,01 l
  weiterspringen (LMG Bayern M-39) → Foto nach dem Einhängen. Kasse darf um einen Ziffernschritt abweichen,
  SB-Automat nicht (MID Anh. VII Nr. 5.1).
- **TMU** (freiwillig): Menge auf 15 °C umgewertet, Hinweis „V bei 15 °C“/„tB = 15 °C“ neben der Literanzeige
  (Eichamt Sachsen INFO 168). Für den Leser nur zusätzliche Beschriftung.
- **Tankvolumen**: Laut LMG Bayern M-39 passen je nach Modell bis zu 17 l zusätzlich in Ausgleichsräume
  und Schläuche → der 66-l-Hinweis kann auch bei echten Tankungen kommen; bleibt deshalb weich.
- **Display-Typen** (echte Commons-Fotos, nicht im Repo): dunkle Ziffern auf hell hinterleuchtetem LCD (Aral) –
  gut; andere Farben und helle Ziffern auf dunklem Grund liest der Leser seit v4.9 nur teilweise (s. „Offen“).

## Bewusste Entscheidungen (nicht zurückbauen)
- **Kein `position: fixed`-Overlay** für Seiten oder Dialoge – ging in Lutz' Vorschau nicht auf. Seiten werden per `hidden` gewechselt.
  Einzige Ausnahme (Lutz' Wunsch, v4.7): das Foto-Ergebnis als `<dialog>` mit `showModal()`.
- **Keine `confirm()`/`alert()`** – Rückfragen sind Karten im eigenen Stil (rote Karte „Wirklich löschen?“).
- Bearbeiten/Löschen nur im aufklappbaren Zeilen-Editor der Historie-Tabelle, nicht auf der Startseite.
- Startseite passt ohne Scrollen: Platzfaktor `--sk` (linear, in zwei Messungen exakt gelöst, `passeGroesseAn()`),
  Scrollsperre `html.fest` nur wenn nachweislich passend. Tastatur offen → keine Neuberechnung (`visualViewport`).
- iOS: Knöpfe bekommen beim Antippen keinen Fokus → vor Messungen Feld per `blur()` lösen.
- 30-Tage-Linie im Monatsdiagramm wurde wieder entfernt (redundant zu den Säulen).
- Zapfsäulen-Foto (Kamera-Knopf in der Kopfzeile neben ⚙): **zuerst offline, ohne KI und ohne Bibliothek** (Leser seit v4.9):
  Graustufe → lokale Schwelle (Integralbild) → Rahmenlinien weg → Segmente zu Ziffern (nur ähnlich große Teile) →
  Zeilen → 7-Segment-Abtastung mit Kursiv-Schräge. Varianten: dunkle/helle Ziffern × 3 Fenster × 2 Schwellen,
  Drehung 0/±5°; die Zeilen **aller** Varianten werden gesammelt und gemeinsam gedeutet (`deuteZeilen()`).
  Deutung nach der Lage auf echten Säulen: Betrag über Liter, beide rechtsbündig, Literpreis darunter; nur ganz
  gelesene Zeilen; Betrag = Liter × Preis (±1,1 ct). Falle: Liter/Preis vertauscht ergibt dasselbe Produkt –
  die Lage entscheidet. Tests: `node tests/deute.test.js`.
- **Rückfallebene Bildmodell** (v4.9): nur wenn offline unsicher **und** ein API-Schlüssel gesetzt ist. SDK
  `@anthropic-ai/sdk@1.3.0` per `import()` von jsDelivr, `dangerouslyAllowBrowser` (Schlüssel liegt nur auf Lutz' Gerät),
  `claude-opus-5-5`, `effort: 'low'`, JSON-Schema-Ausgabe, `fallbacks: 'default'` (Beta `server-side-fallback-2026-07-01`).
  Bild auf 1200 px, ≈ 1 ct je Foto. Antwort durchläuft dieselbe Kreuzprüfung; Fehler (Schlüssel, Netz) im Popup.
- Ergebnis als Popup (`<dialog id="foto-karte">`): drei Werte nebeneinander, Prüfzeile, Herkunft („offline erkannt“ /
  „vom Claude-Bildmodell gelesen“), Verwerfen/Übernehmen. „Übernehmen“ nur bei bestandener Kreuzprüfung.
- Mehrere Fahrzeuge ja, Sync zwischen Geräten nein: Austausch über Export/Import „Zusammenführen“,
  Zuordnung über den Fahrzeugnamen (Groß/Klein egal). CNG/Strom bewusst nicht als Kraftstoff (kg/kWh).

## Testen
- Tests dürfen nicht dieselbe Annahme treffen wie der Code: gegen von Hand gerechnete Werte prüfen.
- Rechenkern extrahierbar zwischen `// ---------- Rechenkern` und `// ---------- Ende Rechenkern`.
- Oberfläche mit Playwright (Chromium, `is_mobile`, `has_touch`) bei 390×664, 390×763, 375×553, 430×833 prüfen;
  iOS-Fokusverhalten nachstellen (Feld fokussiert lassen, Knopf per `click()` im Skript auslösen).
- Vor jedem Test `tankbuch.einstellungen` mit `eingerichtet:true` setzen, sonst erscheint die Einrichtungskarte.

## Offen
- Querformat passt nicht ohne Scrollen.
- Plausibilitätsprüfung gegen Zahlendreher: Liter ab 66 l gibt es seit v4.4 (`LITER_HINWEIS`, Hinweis-Banner,
  zweites Speichern mit gleichem Wert übernimmt). Kilometerstand und Preis fehlen noch.
  Grenze gilt für alle Fahrzeuge gleich – bei einem zweiten Fahrzeug ggf. Tankvolumen je Fahrzeug.
- Offline-Leser: Test an 17 echten Anzeigen (Ausschnitte aus Bildersuche-Screenshots, nicht im Repo wegen
  Urheberrecht, aufgeteilt in Entwicklung/Gegentest) + Lutz' Aral-Foto: v4.8 **0/17**, v4.9 **5/18 richtig, 0 falsch**
  (Entwicklung 4/9, Gegentest 1/9; viele Gegentest-Fälle sind winzige Vorschaubilder). Künstliche Varianten von
  Lutz' Foto: 8/11. Schwach: gelbgrüne/graue/blaue LCDs, Amber auf Schwarz, kleine Preisanzeigen.
  Echte Fotos von Lutz sind die besten neuen Testfälle. Befund aus allen echten Fotos: Betrag oben, Liter Mitte,
  Literpreis unten und kleiner; Preis meist in ct mit 1 Nachkommastelle, sonst € mit 3 Stellen;
  1 ct Abweichung kommt real vor (10,00 l × 1,469 = 14,69, Anzeige 14,70). Kilometerstand per Foto fehlt.
- Rückfallebene nur mit nachgebautem SDK getestet (keine echte API-Anfrage aus der Testumgebung) – erster echter
  Lauf auf Lutz' iPhone mit eigenem Schlüssel steht aus.
- iOS kürzt den Home-Bildschirm-Namen evtl. („Tankprotoko…“) – am Gerät prüfen.
