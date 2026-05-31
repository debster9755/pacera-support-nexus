import { buildKnowledgeBaseDraft } from "../content/insights.ts";
import { LOOKBACK_DAYS, REFERENCE_DATE, REGIONS } from "./constants.ts";
import { generateSupportCases } from "./generator.ts";
import type {
  DashboardFilters,
  DashboardSnapshot,
  Insight,
  KpiSnapshot,
  ProductKey,
  RegionBreakdown,
  RegionKey,
  RoutedTeam,
  RoutingBreakdown,
  SupportCase,
} from "./types.ts";

const referenceDate = new Date(REFERENCE_DATE);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const BASE_SUPPORT_CASES = generateSupportCases();

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatHours(value: number) {
  return `${value.toFixed(1)}h`;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDayKeys() {
  const keys: string[] = [];

  for (let index = LOOKBACK_DAYS - 1; index >= 0; index -= 1) {
    const date = new Date(referenceDate.getTime() - index * MS_PER_DAY);
    keys.push(getDateKey(date));
  }

  return keys;
}

function getCaseDay(caseItem: SupportCase) {
  return caseItem.createdAt.slice(0, 10);
}

function groupCasesByDay(cases: SupportCase[]) {
  const map = new Map<string, SupportCase[]>();

  for (const caseItem of cases) {
    const day = getCaseDay(caseItem);
    const current = map.get(day) ?? [];
    current.push(caseItem);
    map.set(day, current);
  }

  return map;
}

function createKpiSnapshot(
  label: string,
  series: number[],
  valueFormatter: (value: number) => string,
  detail: string,
) {
  const recent = series.slice(-7);
  const prior = series.slice(-14, -7);
  const currentValue = average(recent);
  const previousValue = average(prior);

  return {
    label,
    value: valueFormatter(currentValue),
    numericValue: currentValue,
    changePercent: Number(percentageChange(currentValue, previousValue).toFixed(1)),
    sparkline: recent.map((point) => Number(point.toFixed(1))),
    detail,
  } satisfies KpiSnapshot;
}

function buildDailySeries(cases: SupportCase[]) {
  const dayKeys = getDayKeys();
  const grouped = groupCasesByDay(cases);

  const csat: number[] = [];
  const sla: number[] = [];
  const resolution: number[] = [];
  const escalation: number[] = [];

  for (const dayKey of dayKeys) {
    const dayCases = grouped.get(dayKey) ?? [];
    const resolved = dayCases.filter((caseItem) => caseItem.timeToResolveHours !== null);
    const breached = dayCases.filter((caseItem) => caseItem.slaStatus === "Breached");
    const escalated = dayCases.filter((caseItem) => caseItem.escalationTier !== "Tier 1");

    csat.push(average(dayCases.map((caseItem) => (caseItem.csatScore / 5) * 100)));
    sla.push(
      dayCases.length ? ((dayCases.length - breached.length) / dayCases.length) * 100 : 0,
    );
    resolution.push(
      average(resolved.map((caseItem) => caseItem.timeToResolveHours ?? 0)),
    );
    escalation.push(dayCases.length ? (escalated.length / dayCases.length) * 100 : 0);
  }

  const backlog = dayKeys.map((dayKey) => {
    const dayEnd = new Date(`${dayKey}T23:59:59.000Z`);
    return cases.filter((caseItem) => {
      const createdAt = new Date(caseItem.createdAt);
      const resolvedAt = caseItem.resolvedAt ? new Date(caseItem.resolvedAt) : null;
      return createdAt <= dayEnd && (!resolvedAt || resolvedAt > dayEnd);
    }).length;
  });

  return { dayKeys, csat, sla, resolution, escalation, backlog };
}

export function filterCases(cases: SupportCase[], filters: DashboardFilters) {
  return cases.filter((caseItem) => {
    if (filters.product !== "All" && caseItem.product !== filters.product) {
      return false;
    }

    if (filters.region !== "All" && caseItem.region !== filters.region) {
      return false;
    }

    if (filters.source !== "All" && caseItem.source !== filters.source) {
      return false;
    }

    return true;
  });
}

export function getRegionBreakdown(cases: SupportCase[]) {
  const coverage = new Map<RegionKey, Set<string>>();

  for (const region of REGIONS) {
    coverage.set(region, new Set<string>());
  }

  for (const caseItem of cases) {
    coverage.get(caseItem.region)?.add(caseItem.countryCode);
  }

  const regions = Array.from(coverage.keys());

  return regions
    .map((region) => {
      const regionCases = cases.filter((caseItem) => caseItem.region === region);
      const breaches = regionCases.filter((caseItem) => caseItem.slaStatus === "Breached");

      return {
        region,
        volume: regionCases.length,
        breachRate: regionCases.length ? (breaches.length / regionCases.length) * 100 : 0,
        countryCount: coverage.get(region)?.size ?? 0,
      } satisfies RegionBreakdown;
    })
    .filter((region) => region.volume > 0)
    .sort((left, right) => right.volume - left.volume);
}

export function getRoutingBreakdown(cases: SupportCase[]) {
  const teams: RoutedTeam[] = [
    "Engineering",
    "Customer Success",
    "Support Operations",
  ];

  return teams.map((team) => {
    const volume = cases.filter((caseItem) => caseItem.routedTeam === team).length;
    return {
      team,
      volume,
      share: cases.length ? (volume / cases.length) * 100 : 0,
    } satisfies RoutingBreakdown;
  });
}

function buildIssueTrendMap(cases: SupportCase[]) {
  const recentBoundary = new Date(referenceDate.getTime() - 7 * MS_PER_DAY);
  const priorBoundary = new Date(referenceDate.getTime() - 14 * MS_PER_DAY);
  const issueMap = new Map<
    string,
    { issueType: Insight["issueType"]; product: ProductKey; region: RegionKey | "Global"; recentCount: number; priorCount: number }
  >();

  for (const caseItem of cases) {
    const createdAt = new Date(caseItem.createdAt);
    const key = `${caseItem.product}::${caseItem.issueType}::${caseItem.region}`;
    const current =
      issueMap.get(key) ??
      ({
        issueType: caseItem.issueType,
        product: caseItem.product,
        region: caseItem.region,
        recentCount: 0,
        priorCount: 0,
      });

    if (createdAt >= recentBoundary) {
      current.recentCount += 1;
    } else if (createdAt >= priorBoundary) {
      current.priorCount += 1;
    }

    issueMap.set(key, current);
  }

  return issueMap;
}

export function getTopTrendingInsight(cases: SupportCase[]) {
  const issueMap = buildIssueTrendMap(cases);
  const bestCandidate = Array.from(issueMap.values())
    .map((candidate) => ({
      ...candidate,
      delta: candidate.recentCount - candidate.priorCount,
    }))
    .sort((left, right) => right.delta - left.delta || right.recentCount - left.recentCount)[0];

  if (!bestCandidate) {
    return {
      issueType: "Month-end close sync failure",
      product: "Aico",
      region: "Global",
      recentCount: 0,
      priorCount: 0,
      delta: 0,
      summary: "No trending issue detected in the current filter scope.",
      operationalRisk: "No filter-matched cases were available for trend comparison.",
      recommendation: "Reset filters to all products and regions to verify the insight engine.",
    } satisfies Insight;
  }

  return {
    ...bestCandidate,
    summary: `${bestCandidate.product} is seeing a sustained rise in ${bestCandidate.issueType.toLowerCase()} across ${bestCandidate.region}. The pattern is concentrated enough to justify proactive enablement before it turns into repeat month-end backlog.`,
    operationalRisk:
      "Repeated operational friction is forcing finance teams into manual workarounds, increasing breach risk, and creating avoidable engineering escalations during critical reporting windows.",
    recommendation:
      "Draft a KB article, push an internal Tier 2 advisory, and route repeat accounts into a coordinated support-ops triage lane before the next close cycle peaks.",
  } satisfies Insight;
}

function getCountryCoverage(cases: SupportCase[]) {
  return new Set(cases.map((caseItem) => caseItem.countryCode)).size;
}

export function getKpis(cases: SupportCase[]) {
  const series = buildDailySeries(cases);

  return [
    createKpiSnapshot(
      "CSAT",
      series.csat,
      formatPercent,
      "Average post-resolution satisfaction across filtered cases.",
    ),
    createKpiSnapshot(
      "SLA Adherence",
      series.sla,
      formatPercent,
      "Share of cases meeting their SLA commitment.",
    ),
    createKpiSnapshot(
      "Avg Resolution",
      series.resolution,
      formatHours,
      "Mean hours to resolve for completed cases.",
    ),
    createKpiSnapshot(
      "Active Backlog",
      series.backlog,
      (value) => `${Math.round(value)}`,
      "Open cases still active at end of day.",
    ),
    createKpiSnapshot(
      "Escalation Rate",
      series.escalation,
      formatPercent,
      "Cases reaching Tier 2 or Tier 3 support.",
    ),
  ];
}

export function buildDashboardSnapshot(
  cases: SupportCase[],
  filters: DashboardFilters,
): DashboardSnapshot {
  const filtered = filterCases(cases, filters);
  const topInsight = getTopTrendingInsight(filtered);
  const regionBreakdown = getRegionBreakdown(filtered);
  const routingBreakdown = getRoutingBreakdown(filtered);

  return {
    filteredCaseCount: filtered.length,
    countryCoverage: getCountryCoverage(filtered),
    kpis: getKpis(filtered),
    regionBreakdown,
    routingBreakdown,
    topInsight,
    kbDraft: buildKnowledgeBaseDraft(topInsight),
    recentCases: [...filtered]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 12),
    debug: {
      filters,
      sampleTrendPoints: regionBreakdown.slice(0, 3),
      routingBreakdown,
      coverage: getCountryCoverage(filtered),
    },
  };
}
