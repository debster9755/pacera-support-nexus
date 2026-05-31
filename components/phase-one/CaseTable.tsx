import type { SupportCase } from "@/lib/mock-data/types";

type CaseTableProps = {
  cases: SupportCase[];
};

export function CaseTable({ cases }: CaseTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#091528]/85">
      <div className="border-b border-white/8 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Recent Support Signals</h3>
        <p className="mt-1 text-sm text-[var(--color-surface-200)]/70">
          Latest cases proving seeded data quality across products, regions, and routing
          paths.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/4 text-xs uppercase tracking-[0.18em] text-[var(--color-surface-200)]/65">
            <tr>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Issue</th>
              <th className="px-5 py-3">Region</th>
              <th className="px-5 py-3">Country</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Route</th>
              <th className="px-5 py-3">SLA</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((supportCase) => (
              <tr
                key={supportCase.id}
                className="border-t border-white/6 text-[var(--color-surface-100)]/85"
              >
                <td className="px-5 py-3 font-mono text-xs">
                  {supportCase.createdAt.slice(0, 10)}
                </td>
                <td className="px-5 py-3">{supportCase.product}</td>
                <td className="px-5 py-3">{supportCase.issueType}</td>
                <td className="px-5 py-3">{supportCase.region}</td>
                <td className="px-5 py-3">{supportCase.countryName}</td>
                <td className="px-5 py-3">{supportCase.escalationTier}</td>
                <td className="px-5 py-3">{supportCase.routedTeam}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      supportCase.slaStatus === "Met"
                        ? "bg-[var(--color-mint-500)]/16 text-[var(--color-mint-400)]"
                        : "bg-[var(--color-coral-500)]/16 text-[var(--color-coral-400)]"
                    }`}
                  >
                    {supportCase.slaStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
