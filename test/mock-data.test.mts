import assert from "node:assert/strict";
import test from "node:test";
import { COUNTRIES } from "../lib/mock-data/constants.ts";
import { generateSupportCases } from "../lib/mock-data/generator.ts";
import {
  buildDashboardSnapshot,
  filterCases,
  getTopTrendingInsight,
} from "../lib/mock-data/selectors.ts";

test("seeded generator is deterministic and spans 140+ countries", () => {
  const batchA = generateSupportCases(20260531);
  const batchB = generateSupportCases(20260531);

  assert.equal(batchA.length, batchB.length);
  assert.deepEqual(batchA.slice(0, 15), batchB.slice(0, 15));
  assert.ok(batchA.length > 4000);
  assert.ok(COUNTRIES.length >= 140);
  assert.equal(new Set(batchA.map((caseItem) => caseItem.product)).size, 3);
});

test("filter-aware snapshot only contains requested product and region", () => {
  const cases = generateSupportCases(20260531);
  const filtered = filterCases(cases, {
    product: "Aico",
    region: "Nordics",
    source: "All",
  });
  const snapshot = buildDashboardSnapshot(cases, {
    product: "Aico",
    region: "Nordics",
    source: "All",
  });

  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((caseItem) => caseItem.product === "Aico"));
  assert.ok(filtered.every((caseItem) => caseItem.region === "Nordics"));
  assert.equal(snapshot.filteredCaseCount, filtered.length);
  assert.equal(snapshot.kpis.length, 5);
});

test("trending issue detector identifies the month-end close surge", () => {
  const cases = generateSupportCases(20260531);
  const insight = getTopTrendingInsight(cases);

  assert.equal(insight.product, "Aico");
  assert.equal(insight.issueType, "Month-end close sync failure");
  assert.ok(insight.delta > 0);
  assert.match(insight.recommendation, /KB article/i);
});
