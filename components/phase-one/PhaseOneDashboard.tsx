"use client";

import { useMemo, useState } from "react";
import { KpiCard } from "@/components/phase-one/KpiCard";
import { CaseTable } from "@/components/phase-one/CaseTable";
import {
  BASE_SUPPORT_CASES,
  buildDashboardSnapshot,
} from "@/lib/mock-data/selectors";
import {
  PRODUCTS,
  REGIONS,
  SOURCES,
  SUPPORT_CONTEXT_NOTES,
} from "@/lib/mock-data/constants";
import type { DashboardFilters } from "@/lib/mock-data/types";

const defaultFilters: DashboardFilters = {
  product: "All",
  region: "All",
  source: "All",
};

export function PhaseOneDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  const snapshot = useMemo(
    () => buildDashboardSnapshot(BASE_SUPPORT_CASES, filters),
    [filters],
  );

  return (
    <main className="grid-lines min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="card-glow overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(8,17,31,0.28))]">
          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold-400)]">
                Phase 1 Verification Shell
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Pacera Support Nexus
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-surface-100)]/78 sm:text-lg">
                Mock operational command center for a Head of Support interview. This
                phase validates seeded support data, KPI selectors, regional coverage,
                and the proactive insight engine before the polished dashboard UI is
                built.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {SUPPORT_CONTEXT_NOTES.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-[var(--color-surface-100)]/85"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-[1.6rem] border border-white/8 bg-[#0c1830]/85 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mint-400)]">
                Context Anchors
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-surface-100)]/78">
                <li>
                  Built around Pacera&apos;s three-product landscape: Aico, AARO, and
                  Mercur.
                </li>
                <li>
                  Uses deterministic mock tickets across {snapshot.countryCoverage}{" "}
                  countries and a 30-day operating window.
                </li>
                <li>
                  Encodes interview-relevant support themes: AI-led deflection, rigorous
                  escalation design, and global support orchestration.
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 rounded-[2rem] border border-white/8 bg-[#0a1529]/86 px-5 py-5 md:grid-cols-3 md:px-6">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-surface-200)]/70">
              Product
            </span>
            <select
              value={filters.product}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  product: event.target.value as DashboardFilters["product"],
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-gold-400)]"
            >
              <option value="All">All products</option>
              {PRODUCTS.map((product) => (
                <option key={product.key} value={product.key}>
                  {product.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-surface-200)]/70">
              Region
            </span>
            <select
              value={filters.region}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  region: event.target.value as DashboardFilters["region"],
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-gold-400)]"
            >
              <option value="All">All regions</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-surface-200)]/70">
              Source
            </span>
            <select
              value={filters.source}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  source: event.target.value as DashboardFilters["source"],
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--color-gold-400)]"
            >
              <option value="All">Zendesk + Salesforce</option>
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {snapshot.kpis.map((kpi) => (
            <KpiCard key={kpi.label} snapshot={kpi} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="card-glow rounded-[2rem] border border-white/8 bg-[#0a1529]/90 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-sky-400)]">
              Insight Engine Check
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {snapshot.topInsight.issueType}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-surface-100)]/72">
              {snapshot.topInsight.product} · {snapshot.topInsight.region} · recent 7
              days vs prior 7 days
            </p>
            <p className="mt-4 text-base leading-7 text-[var(--color-surface-100)]/82">
              {snapshot.topInsight.summary}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/65">
                  Recent count
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {snapshot.topInsight.recentCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/65">
                  Prior count
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {snapshot.topInsight.priorCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/65">
                  Growth
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-gold-400)]">
                  +{snapshot.topInsight.delta}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--color-gold-400)]/25 bg-[var(--color-gold-400)]/10 p-4">
              <p className="text-sm font-semibold text-[var(--color-gold-400)]">
                Proposed response
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-surface-100)]/80">
                {snapshot.topInsight.recommendation}
              </p>
            </div>
          </article>

          <article className="card-glow rounded-[2rem] border border-white/8 bg-[#0a1529]/90 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mint-400)]">
              Knowledge Draft Seed
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {snapshot.kbDraft.title}
            </h2>
            <p className="mt-3 text-sm text-[var(--color-surface-100)]/72">
              Audience: {snapshot.kbDraft.audience} · Route:{" "}
              {snapshot.kbDraft.routeToTier}
            </p>

            <div className="mt-5 space-y-4 text-sm text-[var(--color-surface-100)]/80">
              <div>
                <p className="font-semibold text-white">Symptoms</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {snapshot.kbDraft.symptoms.map((symptom) => (
                    <li key={symptom}>{symptom}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-white">Prevention Steps</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {snapshot.kbDraft.preventionSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="card-glow rounded-[2rem] border border-white/8 bg-[#0a1529]/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-sky-400)]">
                  Regional Coverage
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Ticket distribution checkpoint
                </h2>
              </div>
              <p className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/70">
                {snapshot.filteredCaseCount} filtered cases
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {snapshot.regionBreakdown.map((region) => (
                <div
                  key={region.region}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{region.region}</p>
                      <p className="text-xs text-[var(--color-surface-200)]/65">
                        {region.countryCount} active countries
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{region.volume}</p>
                      <p className="text-xs text-[var(--color-surface-200)]/65">
                        {region.breachRate.toFixed(1)}% breached
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="card-glow rounded-[2rem] border border-white/8 bg-[#0a1529]/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mint-400)]">
                  Routing Mix
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Cross-functional pipeline preview
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/65">
                Engineering vs Customer Success
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {snapshot.routingBreakdown.map((bucket) => (
                <div
                  key={bucket.team}
                  className="rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <p className="text-sm font-semibold text-white">{bucket.team}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{bucket.volume}</p>
                  <p className="mt-1 text-xs text-[var(--color-surface-200)]/65">
                    {bucket.share.toFixed(1)}% of filtered workload
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-[#091528] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/65">
                Raw snapshot
              </p>
              <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-black/25 p-4 font-mono text-xs text-[var(--color-surface-100)]/78">
                {JSON.stringify(snapshot.debug, null, 2)}
              </pre>
            </div>
          </article>
        </section>

        <CaseTable cases={snapshot.recentCases} />
      </div>
    </main>
  );
}
