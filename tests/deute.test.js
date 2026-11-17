// Deutung der gelesenen Zapfsäulen-Zeilen gegen von Hand gerechnete Werte. Aufruf: node tests/deute.test.js
// Zeile = { ziffern, y (Mitte), h (Ziffernhöhe), x1 (rechter Rand) } – wie leseZapfsaeule() sie liefert.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const a = src.indexOf('function deuteZeilen(zeilen){'), b = src.indexOf('\n}\n', a) + 2;
eval(src.slice(a, b));
const Z = (ziffern, y, h, x1) => ({ ziffern, y, h, x1 });
const aral = [Z('007429', 100, 50, 500), Z('003473', 170, 40, 500), Z('2139', 300, 22, 430)];
const faelle = [
  ['Aral: Betrag, Liter, Preis', aral, [74.29, 34.73, 2.139]],
  ['Zeilen doppelt aus mehreren Varianten', [...aral, ...aral, Z('?1?', 240, 30, 300)], [74.29, 34.73, 2.139]],
  ['Rand-„?“ wird abgeschnitten', [Z('?007429', 100, 50, 500), Z('003473?', 170, 40, 500), Z('2139', 300, 22, 430)], [74.29, 34.73, 2.139]],
  // 15,27 × 1,944 = 29,68 – aber auch 19,44 × 1,527 = 29,68: die Lage entscheidet (Preis unten, kleiner)
  ['Vertauschungsfalle Liter/Preis', [Z('2968', 100, 40, 500), Z('1527', 150, 40, 500), Z('1944', 250, 18, 450)], [29.68, 15.27, 1.944]],
  ['echte 1-ct-Abweichung (10,00 × 1,469 = 14,69, Anzeige 14,70)', [Z('001470', 100, 30, 400), Z('001000', 150, 30, 400), Z('1469', 200, 20, 380)], [14.70, 10.00, 1.469]],
  ['Preis oben (gibt es an echten Säulen nicht)', [Z('2139', 50, 22, 430), Z('007429', 120, 50, 500), Z('003473', 190, 40, 500)], null],
  ['Betrag und Liter nicht rechtsbündig', [Z('007429', 100, 50, 500), Z('003473', 170, 40, 300), Z('2139', 300, 22, 430)], null],
  ['Rechnung geht nicht auf (34,56 × 1,949 = 67,36 ≠ 67,40)', [Z('6740', 100, 40, 500), Z('3456', 160, 40, 500), Z('1949', 260, 20, 450)], null],
  ['Lesefehler 34,73 → 39,73', [Z('007429', 100, 50, 500), Z('003973', 170, 40, 500), Z('2139', 300, 22, 430)], null],
  ['Zeile mit „?“ in der Mitte zählt nicht', [Z('007429', 100, 50, 500), Z('003?73', 170, 40, 500), Z('2139', 300, 22, 430)], null],
];
let ok = true;
for (const [name, zeilen, soll] of faelle){
  const r = deuteZeilen(zeilen);
  const gut = soll ? (r && r.stimmt && r.betrag === soll[0] && r.liter === soll[1] && r.preis === soll[2]) : !(r && r.stimmt);
  ok = ok && gut;
  console.log(gut ? 'OK  ' : 'FAIL', name, JSON.stringify(r));
}
process.exit(ok ? 0 : 1);
