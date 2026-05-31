import type { KpiSnapshot } from "@/lib/mock-data/types";

type KpiCardProps = {
  snapshot: KpiSnapshot;
};

export function KpiCard({ snapshot }: KpiCardProps) {
  const positive = snapshot.changePercent >= 0;
  const sparkMax = Math.max(...snapshot.sparkline, 1);

  return (
    <article className="card-glow rounded-3xl border border-white/8 bg-white/6 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-surface-200)]/70">
            {snapshot.label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{snapshot.value}</p>
          <p className="mt-2 text-sm text-[var(--color-surface-100)]/78">
            {snapshot.detail}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            positive
              ? "bg-[var(--color-mint-500)]/18 text-[var(--color-mint-400)]"
              : "bg-[var(--color-coral-500)]/18 text-[var(--color-coral-400)]"
          }`}
        >
          {positive ? "+" : ""}
          {snapshot.changePercent.toFixed(1)}%
        </div>
      </div>

      <div className="mt-5 flex h-12 items-end gap-1.5">
        {snapshot.sparkline.map((point, index) => {
          const height = Math.max((point / sparkMax) * 100, 14);

          return (
            <div
              key={`${snapshot.label}-${index}`}
              className="flex-1 rounded-full bg-gradient-to-t from-[var(--color-sky-500)]/30 to-[var(--color-gold-400)]/65"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </article>
  );
}
