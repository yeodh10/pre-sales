"use client";

import productsKb from "@/data/ahnlab-products.json";
import type {
  ProductRecommendation,
  RecommendationResult,
} from "@/lib/recommendation";

interface ProductKbItem {
  id: string;
  name: string;
  name_ko: string;
  category: string;
  category_label: string;
  tagline: string;
  source_url: string;
}

const PRODUCT_BY_ID = new Map<string, ProductKbItem>(
  (productsKb.products as ProductKbItem[]).map((p) => [p.id, p]),
);

const PHASE_LABEL: Record<number, string> = {
  1: "Phase 1 · 즉시 도입",
  2: "Phase 2 · 6개월 내",
  3: "Phase 3 · 12개월 내",
};

const PHASE_TONE: Record<number, string> = {
  1: "bg-red-50 text-red-800 ring-red-200",
  2: "bg-amber-50 text-amber-800 ring-amber-200",
  3: "bg-slate-50 text-slate-700 ring-slate-200",
};

export default function RecommendationReport({
  result,
  customerName,
}: {
  result: RecommendationResult;
  customerName?: string;
}) {
  const phases = [1, 2, 3] as const;

  return (
    <article className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand">
              제안 요약
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {customerName ?? "고객"}을 위한 안랩 솔루션 제안
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {result.summary}
            </p>
          </div>
          {result.model_used && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              {result.model_used}
            </span>
          )}
        </div>
      </header>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          추천 제품 조합 ({result.recommendations.length})
        </h3>
        <div className="space-y-4">
          {phases.map((phase) => {
            const items = result.recommendations
              .filter((r) => r.priority === phase)
              .sort((a, b) => a.product_id.localeCompare(b.product_id));
            if (items.length === 0) return null;
            return (
              <div key={phase}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 " +
                      PHASE_TONE[phase]
                    }
                  >
                    {PHASE_LABEL[phase]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {items.length}개 제품
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map((rec) => (
                    <ProductCard key={rec.product_id} rec={rec} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {result.compliance_mapping.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            컴플라이언스 매핑
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-medium">요구 / 통제항목</th>
                  <th className="py-2 font-medium">충족 기여 제품</th>
                </tr>
              </thead>
              <tbody>
                {result.compliance_mapping.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-2 pr-4 text-slate-700">
                      {row.requirement}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {row.covered_by.map((id) => {
                          const p = PRODUCT_BY_ID.get(id);
                          return (
                            <span
                              key={id}
                              className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark"
                            >
                              {p?.name_ko ?? id}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {result.risks_and_notes.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-amber-900">
            유의사항 · 추가 검토
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
            {result.risks_and_notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function ProductCard({ rec }: { rec: ProductRecommendation }) {
  const p = PRODUCT_BY_ID.get(rec.product_id);
  const displayName = p?.name_ko ?? rec.product_id;
  const enName = p?.name;
  const category = p?.category_label;
  const tagline = p?.tagline;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">
              {displayName}
            </h4>
            {enName && enName !== displayName && (
              <span className="text-xs text-slate-400">{enName}</span>
            )}
          </div>
          {category && (
            <p className="mt-0.5 text-xs text-slate-500">{category}</p>
          )}
        </div>
        {p?.source_url && (
          <a
            href={p.source_url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[11px] font-medium text-brand hover:underline"
          >
            공식 소스 ↗
          </a>
        )}
      </div>

      {tagline && (
        <p className="mt-2 text-xs italic text-slate-500">{tagline}</p>
      )}

      <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-900">선정 이유 · </span>
        {rec.rationale}
      </div>

      {rec.key_outcomes.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-slate-700">
          {rec.key_outcomes.map((o, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-brand">✓</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
