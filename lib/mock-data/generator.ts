import {
  COUNTRIES,
  DEFAULT_SEED,
  ISSUE_DEFINITIONS,
  LOOKBACK_DAYS,
  PRODUCT_WEIGHTS,
  REFERENCE_DATE,
  REGION_VOLUME_MULTIPLIER,
  SOURCES,
} from "./constants.ts";
import { SeededRandom } from "./rng.ts";
import type {
  CountryDefinition,
  EscalationTier,
  IssueDefinition,
  ProductKey,
  RoutedTeam,
  SupportCase,
} from "./types.ts";

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

function pickWeighted<T>(
  rng: SeededRandom,
  choices: Array<{ item: T; weight: number }>,
) {
  const total = choices.reduce((sum, choice) => sum + choice.weight, 0);
  let threshold = rng.next() * total;

  for (const choice of choices) {
    threshold -= choice.weight;
    if (threshold <= 0) {
      return choice.item;
    }
  }

  return choices[choices.length - 1].item;
}

function getProductWeight(product: ProductKey, country: CountryDefinition, daysAgo: number) {
  const base = PRODUCT_WEIGHTS[product];

  if (
    product === "Aico" &&
    daysAgo <= 6 &&
    (country.region === "Nordics" || country.region === "Europe")
  ) {
    return base * 1.8;
  }

  if (product === "Mercur" && daysAgo <= 6 && country.region === "APAC") {
    return base * 1.3;
  }

  if (product === "AARO" && daysAgo <= 10 && country.region === "North America") {
    return base * 1.18;
  }

  return base;
}

function pickProduct(rng: SeededRandom, country: CountryDefinition, daysAgo: number) {
  return pickWeighted(rng, [
    {
      item: "Aico" as ProductKey,
      weight: getProductWeight("Aico", country, daysAgo),
    },
    {
      item: "AARO" as ProductKey,
      weight: getProductWeight("AARO", country, daysAgo),
    },
    {
      item: "Mercur" as ProductKey,
      weight: getProductWeight("Mercur", country, daysAgo),
    },
  ]);
}

function pickIssue(
  rng: SeededRandom,
  product: ProductKey,
  country: CountryDefinition,
  daysAgo: number,
) {
  const definitions = ISSUE_DEFINITIONS.filter((issue) => issue.product === product);

  return pickWeighted(
    rng,
    definitions.map((issue) => {
      let weight = 1;

      if (
        issue.issueType === "Month-end close sync failure" &&
        daysAgo <= 6 &&
        (country.region === "Nordics" || country.region === "Europe")
      ) {
        weight = 3.8;
      }

      if (
        issue.issueType === "Group consolidation data mismatch" &&
        daysAgo <= 8 &&
        country.region === "North America"
      ) {
        weight = 2.3;
      }

      if (
        issue.issueType === "Forecasting model access" &&
        daysAgo <= 7 &&
        country.region === "APAC"
      ) {
        weight = 2.1;
      }

      return { item: issue, weight };
    }),
  );
}

function pickEscalationTier(
  rng: SeededRandom,
  issue: IssueDefinition,
  daysAgo: number,
): EscalationTier {
  const highSeverity = issue.severity === "high";
  const trendingSpike =
    issue.issueType === "Month-end close sync failure" && daysAgo <= 6;

  if (highSeverity && rng.next() > 0.42) {
    return rng.next() > 0.55 ? "Tier 3" : "Tier 2";
  }

  if (trendingSpike && rng.next() > 0.46) {
    return "Tier 2";
  }

  return rng.next() > 0.78 ? "Tier 2" : "Tier 1";
}

function pickRoutedTeam(
  rng: SeededRandom,
  issue: IssueDefinition,
  escalationTier: EscalationTier,
): RoutedTeam {
  if (escalationTier === "Tier 3") {
    return "Engineering";
  }

  if (escalationTier === "Tier 2") {
    if (issue.routeBias === "Support Operations" && rng.next() > 0.35) {
      return "Support Operations";
    }
    return issue.routeBias;
  }

  if (issue.category === "Access" || issue.category === "Planning") {
    return rng.next() > 0.55 ? "Customer Success" : "Support Operations";
  }

  return rng.next() > 0.7 ? "Engineering" : "Support Operations";
}

function hoursBetween(older: Date, newer: Date) {
  return (newer.getTime() - older.getTime()) / MS_PER_HOUR;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function getPriority(issue: IssueDefinition, escalationTier: EscalationTier) {
  if (issue.severity === "high" || escalationTier === "Tier 3") {
    return "P1" as const;
  }

  if (issue.severity === "medium" || escalationTier === "Tier 2") {
    return "P2" as const;
  }

  return "P3" as const;
}

function getCaseVolume(rng: SeededRandom, country: CountryDefinition, daysAgo: number) {
  const regional = REGION_VOLUME_MULTIPLIER[country.region];
  const wave = 0.85 + Math.sin((daysAgo / LOOKBACK_DAYS) * Math.PI * 2) * 0.18;
  const surge =
    daysAgo <= 6 && (country.region === "Nordics" || country.region === "Europe")
      ? 0.44
      : 0;
  return Math.max(0, Math.round(regional + wave + surge + rng.next() * 1.35));
}

function buildResolution(
  rng: SeededRandom,
  issue: IssueDefinition,
  escalationTier: EscalationTier,
  createdAt: Date,
  referenceDate: Date,
  daysAgo: number,
) {
  const tierMultiplier =
    escalationTier === "Tier 3" ? 1.7 : escalationTier === "Tier 2" ? 1.25 : 0.92;
  const jitter = 0.82 + rng.next() * 1.1;
  const hours = Math.max(1, issue.baseHours * tierMultiplier * jitter);

  const unresolvedProbability =
    daysAgo <= 2
      ? issue.severity === "high"
        ? 0.38
        : 0.22
      : daysAgo <= 5
        ? 0.14
        : 0.05;

  const unresolved = rng.next() < unresolvedProbability;

  if (unresolved) {
    const agedHours = hoursBetween(createdAt, referenceDate);
    return {
      resolvedAt: null,
      timeToResolveHours: null,
      isBacklog: true,
      slaStatus: agedHours > issue.slaTargetHours ? ("Breached" as const) : ("Met" as const),
    };
  }

  const resolvedAt = new Date(createdAt.getTime() + hours * MS_PER_HOUR);
  return {
    resolvedAt: resolvedAt.toISOString(),
    timeToResolveHours: Number(hours.toFixed(1)),
    isBacklog: false,
    slaStatus:
      hours > issue.slaTargetHours ? ("Breached" as const) : ("Met" as const),
  };
}

function getCsatScore(
  rng: SeededRandom,
  issue: IssueDefinition,
  routedTeam: RoutedTeam,
  breach: boolean,
  backlog: boolean,
) {
  let score = 4.6;

  if (issue.severity === "high") {
    score -= 0.4;
  }

  if (routedTeam === "Engineering") {
    score -= 0.15;
  }

  if (breach) {
    score -= 1.15;
  }

  if (backlog) {
    score -= 0.55;
  }

  score += (rng.next() - 0.5) * 0.5;
  return Math.min(5, Math.max(2.1, Number(score.toFixed(1))));
}

export function generateSupportCases(seed = DEFAULT_SEED) {
  const rng = new SeededRandom(seed);
  const referenceDate = new Date(REFERENCE_DATE);
  const cases: SupportCase[] = [];

  for (let daysAgo = LOOKBACK_DAYS - 1; daysAgo >= 0; daysAgo -= 1) {
    const dayStart = new Date(referenceDate.getTime() - daysAgo * MS_PER_DAY);
    dayStart.setUTCHours(0, 0, 0, 0);

    for (const country of COUNTRIES) {
      const volume = getCaseVolume(rng, country, daysAgo);

      for (let index = 0; index < volume; index += 1) {
        const product = pickProduct(rng, country, daysAgo);
        const issue = pickIssue(rng, product, country, daysAgo);
        const escalationTier = pickEscalationTier(rng, issue, daysAgo);
        const routedTeam = pickRoutedTeam(rng, issue, escalationTier);
        const createdAt = new Date(
          dayStart.getTime() +
            rng.int(0, 23) * MS_PER_HOUR +
            rng.int(0, 59) * 60000,
        );
        const resolution = buildResolution(
          rng,
          issue,
          escalationTier,
          createdAt,
          referenceDate,
          daysAgo,
        );
        const csatScore = getCsatScore(
          rng,
          issue,
          routedTeam,
          resolution.slaStatus === "Breached",
          resolution.isBacklog,
        );

        cases.push({
          id: `PSN-${formatDateKey(createdAt)}-${country.code}-${String(index + 1).padStart(2, "0")}`,
          source: rng.pick(SOURCES),
          product,
          issueType: issue.issueType,
          issueCategory: issue.category,
          region: country.region,
          countryCode: country.code,
          countryName: country.name,
          createdAt: createdAt.toISOString(),
          resolvedAt: resolution.resolvedAt,
          timeToResolveHours: resolution.timeToResolveHours,
          slaTargetHours: issue.slaTargetHours,
          slaStatus: resolution.slaStatus,
          escalationTier,
          routedTeam,
          csatScore,
          isBacklog: resolution.isBacklog,
          priority: getPriority(issue, escalationTier),
          accountSegment: rng.next() > 0.34 ? "Enterprise" : "Mid-Market",
        });
      }
    }
  }

  return cases.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}
