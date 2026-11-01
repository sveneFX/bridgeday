import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easterSunday, repentanceDay, holidays, iso, STATES } from '../src/holidays.js';
import { findBridges, topTips } from '../src/bridges.js';

test('Ostersonntag bekannter Jahre', () => {
  assert.equal(iso(easterSunday(2024)), '2024-03-31');
  assert.equal(iso(easterSunday(2025)), '2025-04-20');
  assert.equal(iso(easterSunday(2026)), '2026-04-05');
  assert.equal(iso(easterSunday(2027)), '2027-03-28');
  assert.equal(iso(easterSunday(2028)), '2028-04-16');
});

test('Buß- und Bettag', () => {
  assert.equal(iso(repentanceDay(2025)), '2025-11-19');
  assert.equal(iso(repentanceDay(2026)), '2026-11-18');
  assert.equal(iso(repentanceDay(2027)), '2027-11-17');
});

test('Anzahl landesweiter Feiertage 2027', () => {
  const expected = { BW: 12, BY: 13, BE: 10, BB: 10, HB: 10, HH: 10, HE: 10, MV: 11, NI: 10, NW: 11, RP: 11, SL: 12, SN: 11, ST: 11, SH: 10, TH: 11, DE: 9 };
  for (const [code, n] of Object.entries(expected)) {
    const counted = holidays(2027, code).filter((h) => h.counted).length;
    assert.equal(counted, n, `${code} sollte ${n} Feiertage haben, hat ${counted}`);
  }
});

test('alle 16 Bundesländer vorhanden, Slugs eindeutig', () => {
  assert.equal(STATES.length, 16);
  assert.equal(new Set(STATES.map((s) => s.slug)).size, 16);
});

test('Himmelfahrt 2027: 1 Urlaubstag ergibt 4 freie Tage', () => {
  const g = findBridges(2027, 'BY').find((x) => x.anchor.name === 'Christi Himmelfahrt');
  const o = g.options.find((x) => x.vacationDays === 1);
  assert.equal(o.freeDays, 4);
  assert.equal(iso(o.vacationDates[0]), '2027-05-07');
  assert.equal(iso(o.start), '2027-05-06');
  assert.equal(iso(o.end), '2027-05-09');
});

test('keine sinnlosen Optionen', () => {
  for (const year of [2026, 2027, 2028]) {
    for (const s of [...STATES.map((x) => x.code), 'DE']) {
      for (const g of findBridges(year, s)) {
        for (const o of g.options) {
          assert.ok(!(o.vacationDays === 0 && o.freeDays < 3), `${s} ${year}: Einzelfeiertag ohne Wochenende`);
          assert.ok(o.freeDays > o.vacationDays, `${s} ${year}: mehr Urlaub als freie Tage`);
          assert.equal(o.vacationDates.length, o.vacationDays);
          for (const d of o.vacationDates) assert.ok(d.getUTCDay() >= 1 && d.getUTCDay() <= 5, 'Urlaubstag am Wochenende');
        }
      }
    }
  }
});

test('Top-Tipps sind nach Effizienz sortiert', () => {
  const tips = topTips(findBridges(2027, 'NW'), 5);
  for (let i = 1; i < tips.length; i++) {
    assert.ok(tips[i - 1].freeDays / tips[i - 1].vacationDays >= tips[i].freeDays / tips[i].vacationDays);
  }
});
