// Deutung der Zapfsäulen-Zeilen gegen von Hand gerechnete Werte. Aufruf: node tests/deute.test.js
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const a = src.indexOf('function deute(z){'), b = src.indexOf('\n}\n', a) + 2;
eval(src.slice(a, b));
const faelle = [
  [['007429', '003473', '2139'], 74.29, 34.73, 2.139, true],          // Aral: Betrag, Liter, Preis
  [['003473', '007429', '2139'], 74.29, 34.73, 2.139, true],          // Liter zuerst
  [['?3250?', '?6334?', '1949??'], 63.34, 32.50, 1.949, true],        // Beschriftung/Einheit als ?
  [['2139', '003473', '007429'], 74.29, 34.73, 2.139, true],          // Preis oben
  [['3456', '6740', '1949'], null, null, null, false],                // 34,56 × 1,949 = 67,36 ≠ 67,40
  [['007429', '003973', '2139'], null, null, null, false],            // Lesefehler
  [['0000', '007429', '003473', '2139'], 74.29, 34.73, 2.139, true],  // Zusatzzeile
  [['4000', '7596', '1899'], 75.96, 40.00, 1.899, true],              // alle vierstellig, Liter zuerst
  [['2512', '4996', '1989'], 49.96, 25.12, 1.989, true],
  [['1877', '3733', '1989'], 37.33, 18.77, 1.989, true],
];
let ok = true;
for (const [z, B, L, P, s] of faelle){
  const r = deute(z);
  const gut = r && r.stimmt === s && (!s || (r.betrag === B && r.liter === L && r.preis === P));
  ok = ok && gut; console.log(gut ? 'OK  ' : 'FAIL', JSON.stringify(z), JSON.stringify(r));
}
process.exit(ok ? 0 : 1);
