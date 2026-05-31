import type {
  Insight,
  IssueType,
  KnowledgeBaseDraft,
  ProductKey,
} from "../mock-data/types.ts";

const issueAudience: Record<IssueType, string> = {
  "Month-end close sync failure": "Controllers, close managers, and Tier 2 product support",
  "Journal approval workflow stall":
    "Controllers, finance operations analysts, and support operations",
  "ERP connector authentication error":
    "Enterprise administrators, IT owners, and integration support",
  "Group consolidation data mismatch":
    "Group accountants, consolidation leads, and Tier 2 product support",
  "FX translation anomaly":
    "Finance transformation teams and regional accounting leads",
  "Disclosure package validation error":
    "Reporting owners, controllers, and customer success enablement",
  "Forecasting model access":
    "FP&A partners, workspace admins, and Tier 2 support",
  "Driver-based planning latency":
    "FP&A model owners, admins, and performance engineering",
  "Board report export timeout":
    "Finance leaders, reporting owners, and customer success specialists",
  "Role provisioning drift":
    "Workspace admins, FP&A leads, and support enablement managers",
  "Data import schema conflict":
    "Integration owners, finance systems managers, and Tier 2 support",
  "Intercompany reconciliation exception":
    "Accounting operations, close managers, and support operations",
};

const issueSymptoms: Record<IssueType, string[]> = {
  "Month-end close sync failure": [
    "Close tasks remain pending after upstream ERP batches report success.",
    "Fresh balances do not appear in Aico despite recent journal updates.",
    "Regional teams reopen duplicate tickets at the same month-end checkpoint.",
  ],
  "Journal approval workflow stall": [
    "Approvers cannot see assigned tasks in their queue.",
    "Reminder notifications are delayed across entity owners.",
    "Journal posting remains blocked despite completed prep steps.",
  ],
  "ERP connector authentication error": [
    "Integration health checks fail after credential rotation windows.",
    "Scheduled sync jobs return token or secret validation errors.",
    "Support receives repeated failures from the same ERP tenant.",
  ],
  "Group consolidation data mismatch": [
    "Entity totals do not reconcile with group roll-ups.",
    "Consolidation packs require manual restatement before close sign-off.",
    "Regional finance teams dispute source-of-truth balances.",
  ],
  "FX translation anomaly": [
    "Currency translation outputs differ between consecutive runs.",
    "Local and group currency reports show unexplained variance spikes.",
    "Treasury teams escalate exchange-rate timing concerns.",
  ],
  "Disclosure package validation error": [
    "Validation rules fail during pre-submission review.",
    "Template sections show incomplete or conflicting values.",
    "Quarter-end packages require repeated manual correction.",
  ],
  "Forecasting model access": [
    "Planners lose access after role or team changes.",
    "Shared model links open with missing permission prompts.",
    "Teams raise urgent deadline-risk tickets before forecast reviews.",
  ],
  "Driver-based planning latency": [
    "Scenario runs exceed expected response times during peak planning cycles.",
    "Save or refresh actions freeze during multi-driver recalculation.",
    "Business partners duplicate models to work around perceived slowness.",
  ],
  "Board report export timeout": [
    "Executive export jobs fail during PDF or spreadsheet generation.",
    "Users retry multiple report runs before each monthly review.",
    "Final pack delivery slips despite completed forecast approval.",
  ],
  "Role provisioning drift": [
    "Users inherit outdated access scopes after reorganizations.",
    "Admin teams reopen access requests for the same cohorts.",
    "Support cases cluster after operating-model changes or new go-lives.",
  ],
  "Data import schema conflict": [
    "Inbound files fail validation on field mapping changes.",
    "Scheduled imports stop after ERP or middleware template updates.",
    "Teams manually edit payloads to complete consolidation cycles.",
  ],
  "Intercompany reconciliation exception": [
    "Matched balances diverge after late adjustments.",
    "Close managers require manual intervention across entity pairs.",
    "Escalations spike near group close deadlines.",
  ],
};

const defaultPrevention: Record<ProductKey, string[]> = {
  Aico: [
    "Validate upstream ERP credentials and scheduled job ownership before close windows.",
    "Create a Tier 2 runbook with expected sync timing, rollback steps, and escalation thresholds.",
    "Publish a proactive customer advisory before the month-end peak cycle.",
  ],
  AARO: [
    "Confirm import mappings and rate tables before group consolidation cutover.",
    "Add a Tier 2 validation checklist for entity exceptions and disclosure pack review.",
    "Introduce structured post-incident RCA feedback into support ops governance.",
  ],
  Mercur: [
    "Audit role assignments and heavy model actions before forecast review milestones.",
    "Document a self-serve admin checklist for planners and business owners.",
    "Route repeat offenders into enablement and knowledge base coverage updates.",
  ],
};

export function buildKnowledgeBaseDraft(insight: Insight): KnowledgeBaseDraft {
  return {
    title: `${insight.product}: Preventing ${insight.issueType.toLowerCase()}`,
    audience: issueAudience[insight.issueType],
    symptoms: issueSymptoms[insight.issueType],
    rootCause: insight.operationalRisk,
    preventionSteps: defaultPrevention[insight.product],
    routeToTier: "Tier 2",
    handoffNotes: [
      "Tag the article for proactive surfacing inside support workflows.",
      "Attach a lightweight RCA summary for Engineering when breach volume exceeds threshold.",
      "Use the article as a repeatable deflection asset for global follow-the-sun teams.",
    ],
  };
}
