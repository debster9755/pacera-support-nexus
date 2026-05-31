export type ProductKey = "Aico" | "AARO" | "Mercur";
export type TicketSource = "Zendesk" | "Salesforce";
export type RegionKey =
  | "Nordics"
  | "Europe"
  | "North America"
  | "LATAM"
  | "MEA"
  | "APAC";
export type EscalationTier = "Tier 1" | "Tier 2" | "Tier 3";
export type SlaStatus = "Met" | "Breached";
export type RoutedTeam = "Engineering" | "Customer Success" | "Support Operations";
export type IssueType =
  | "Month-end close sync failure"
  | "Journal approval workflow stall"
  | "ERP connector authentication error"
  | "Group consolidation data mismatch"
  | "FX translation anomaly"
  | "Disclosure package validation error"
  | "Forecasting model access"
  | "Driver-based planning latency"
  | "Board report export timeout"
  | "Role provisioning drift"
  | "Data import schema conflict"
  | "Intercompany reconciliation exception";

export type DashboardFilters = {
  product: ProductKey | "All";
  region: RegionKey | "All";
  source: TicketSource | "All";
};

export type CountryDefinition = {
  code: string;
  name: string;
  region: RegionKey;
};

export type ProductDefinition = {
  key: ProductKey;
  label: string;
  description: string;
};

export type IssueDefinition = {
  issueType: IssueType;
  product: ProductKey;
  category: "Close" | "Consolidation" | "Planning" | "Access" | "Integration";
  baseHours: number;
  slaTargetHours: number;
  severity: "low" | "medium" | "high";
  routeBias: RoutedTeam;
  defaultSummary: string;
};

export type SupportCase = {
  id: string;
  source: TicketSource;
  product: ProductKey;
  issueType: IssueType;
  issueCategory: IssueDefinition["category"];
  region: RegionKey;
  countryCode: string;
  countryName: string;
  createdAt: string;
  resolvedAt: string | null;
  timeToResolveHours: number | null;
  slaTargetHours: number;
  slaStatus: SlaStatus;
  escalationTier: EscalationTier;
  routedTeam: RoutedTeam;
  csatScore: number;
  isBacklog: boolean;
  priority: "P1" | "P2" | "P3";
  accountSegment: "Enterprise" | "Mid-Market";
};

export type TrendPoint = {
  date: string;
  value: number;
};

export type KpiSnapshot = {
  label: string;
  value: string;
  numericValue: number;
  changePercent: number;
  sparkline: number[];
  detail: string;
};

export type RegionBreakdown = {
  region: RegionKey;
  volume: number;
  breachRate: number;
  countryCount: number;
};

export type RoutingBreakdown = {
  team: RoutedTeam;
  volume: number;
  share: number;
};

export type Insight = {
  issueType: IssueType;
  product: ProductKey;
  region: RegionKey | "Global";
  recentCount: number;
  priorCount: number;
  delta: number;
  summary: string;
  operationalRisk: string;
  recommendation: string;
};

export type KnowledgeBaseDraft = {
  title: string;
  audience: string;
  symptoms: string[];
  rootCause: string;
  preventionSteps: string[];
  routeToTier: "Tier 2";
  handoffNotes: string[];
};

export type DashboardSnapshot = {
  filteredCaseCount: number;
  countryCoverage: number;
  kpis: KpiSnapshot[];
  regionBreakdown: RegionBreakdown[];
  routingBreakdown: RoutingBreakdown[];
  topInsight: Insight;
  kbDraft: KnowledgeBaseDraft;
  recentCases: SupportCase[];
  debug: Record<string, unknown>;
};
