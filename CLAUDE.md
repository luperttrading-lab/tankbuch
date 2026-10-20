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
  `tankbuch.eintraege`, `tankbuch.einstellungen`, `tankbuch.entwurf`, `tankbuch.gesehen`.
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
- Bordcomputer-Ø lag im Okt. 2026 bei 7,1 statt 6,2 l/100 km (913 km, 56,67 l voll zu voll), also ~14 % zu hoch.
  Bisher nur ein Intervall – die App rechnet richtig, nicht an den Bordcomputer anpassen.

## Bewusste Entscheidungen (nicht zurückbauen)
- **Kein `position: fixed`-Overlay** für Seiten oder Dialoge – ging in Lutz' Vorschau nicht auf. Seiten werden per `hidden` gewechselt.
- **Keine `confirm()`/`alert()`** – Rückfragen sind Karten im eigenen Stil (rote Karte „Wirklich löschen?“).
- Bearbeiten/Löschen nur im aufklappbaren Zeilen-Editor der Historie-Tabelle, nicht auf der Startseite.
- Startseite passt ohne Scrollen: Platzfaktor `--sk` (linear, in zwei Messungen exakt gelöst, `passeGroesseAn()`),
  Scrollsperre `html.fest` nur wenn nachweislich passend. Tastatur offen → keine Neuberechnung (`visualViewport`).
- iOS: Knöpfe bekommen beim Antippen keinen Fokus → vor Messungen Feld per `blur()` lösen.
- 30-Tage-Linie im Monatsdiagramm wurde wieder entfernt (redundant zu den Säulen).
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
- Plausibilitätsprüfung gegen Zahlendreher (Kilometerstand, Liter, Preis) fehlt.
- iOS kürzt den Home-Bildschirm-Namen evtl. („Tankprotoko…“) – am Gerät prüfen.
