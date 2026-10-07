// Run: node tests/logic.test.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.split('// LOGIC-START')[1].split('// LOGIC-END')[0];
const L = new Function(`${src}; return { PLANETS, RING, ROLES, TOPICS, WEEKDAY, taksa, computeFortune, bangkokDay };`)();

// Known taksa facts: Sunday-born kalakini = Friday, Monday-born kalakini = Sunday.
assert.strictEqual(L.taksa('sun')['กาลกิณี'], 'fri');
assert.strictEqual(L.taksa('mon')['กาลกิณี'], 'sun');
assert.strictEqual(L.taksa('sun')['ศรี'], 'wed');

let swaps = 0, total = 0;
for (const birth of L.RING) for (const wear of L.WEEKDAY) for (const topic of Object.keys(L.TOPICS)) {
  const a = L.computeFortune(birth, topic, wear, '2026-10-07');
  const b = L.computeFortune(birth, topic, wear, '2026-10-07');
  assert.deepStrictEqual(a, b, 'same inputs must give same result');
  const B = L.taksa(birth), W = L.taksa(wear);
  for (const p of [a.main, a.accent]) {
    assert.ok(L.PLANETS[p], `defined colour ${birth}/${wear}/${topic}`);
    assert.notStrictEqual(p, B['กาลกิณี'], `kalakini(birth) used ${birth}/${wear}/${topic}`);
    assert.notStrictEqual(p, W['กาลกิณี'], `kalakini(wear) used ${birth}/${wear}/${topic}`);
  }
  assert.notStrictEqual(a.main, a.accent);
  assert.ok(!a.quote.includes('{c}'));
  if (a.swapped) swaps++; else assert.strictEqual(a.main, B[L.TOPICS[topic].role]);
  total++;
}

// Bangkok day boundary: 2026-10-07 16:59:59Z = 23:59:59 ICT (Wed), 17:00Z = 00:00 ICT Thu.
const before = L.bangkokDay(0, Date.parse('2026-10-07T16:59:59Z'));
const after = L.bangkokDay(0, Date.parse('2026-10-07T17:00:00Z'));
assert.strictEqual(before.key, '2026-10-07'); assert.strictEqual(before.planet, 'wed');
assert.strictEqual(after.key, '2026-10-08'); assert.strictEqual(after.planet, 'thu');
assert.strictEqual(L.bangkokDay(1, Date.parse('2026-10-07T03:00:00Z')).planet, 'thu');

console.log(`OK: ${total} combinations checked, ${swaps} needed a kalakini swap`);
