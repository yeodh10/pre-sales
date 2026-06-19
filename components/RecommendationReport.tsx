"use client";

import productsKb from "@/data/ahnlab-products.json";
import {
  COMPLIANCE_OPTIONS,
  INDUSTRY_OPTIONS,
  PAIN_OPTIONS,
  SIZE_OPTIONS,
} from "@/lib/options";
import { buildMarkdown, downloadMarkdown } from "@/lib/exportMarkdown";
import { ISMSP_META, lookupControl } from "@/lib/ismsp";
import type {
  ProductRecommendation,
  RecommendationResult,
} from "@/lib/recommendation";
import type { CustomerProfile } from "@/lib/types";

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

function lookupLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RecommendationReport({
  result,
  profile,
}: {
  result: RecommendationResult;
  profile: CustomerProfile;
}) {
  const phases = [1, 2, 3] as const;
  const customer = profile.companyName || "고객사";

  const handleDownloadMd = () => {
    const md = buildMarkdown(profile, result);
    const safe = customer.replace(/[^\p{L}\p{N}_-]+/gu, "_");
    downloadMarkdown(`AhnLab_제안_${safe}.md`, md);
  };

  return (
    <article
      id="recommendation-report"
      className="print-area space-y-6"
    >
      <header className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-brand">
              제안 요약
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {customer}을 위한 안랩 솔루션 제안
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>{lookupLabel(INDUSTRY_OPTIONS, profile.industry)}</span>
              <span>·</span>
              <span>{lookupLabel(SIZE_OPTIONS, profile.size)}</span>
              {profile.endpointCount && (
                <>
                  <span>·</span>
                  <span>엔드포인트 {profile.endpointCount.toLocaleString()}대</span>
                </>
              )}
              <span>·</span>
              <span>생성일 {formatDate(result.generated_at)}</span>
              {result.model_used && (
                <>
                  <span>·</span>
                  <span>{result.model_used}</span>
                </>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {result.summary}
            </p>
            {result.model_used === "rule-based fallback" && (
              <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-[11px] text-slate-600">
                ⚙️ 이 결과는 <strong>룰 기반 폴백 엔진</strong>으로 생성되었습니다
                (LLM API 키 미설정 또는 호출 실패). 결정론적 규칙 기반이라 항상
                동일한 결과를 보장하지만, LLM 추론 대비 맥락 반영은 제한적입니다.
              </p>
            )}
          </div>
          <div className="no-print flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleDownloadMd}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Markdown 다운로드
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </div>

        <ContextChips profile={profile} />
      </header>

      <RoadmapTimeline recommendations={result.recommendations} />

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
          <div className="mb-3 flex items-end justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">
              컴플라이언스 매핑
            </h3>
            <a
              href={ISMSP_META.official_url}
              target="_blank"
              rel="noreferrer"
              className="no-print text-[11px] text-slate-500 hover:text-brand hover:underline"
            >
              ISMS-P 통제항목 출처: KISA ISMS-P ↗
            </a>
          </div>
          <div className="space-y-3">
            {result.compliance_mapping.map((row, i) => {
              const ctrl = lookupControl(row.control_id);
              return (
                <div
                  key={i}
                  className="rounded-md border border-slate-200 bg-slate-50/50 p-3 print:break-inside-avoid"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      {ctrl && (
                        <span className="rounded bg-brand text-white px-1.5 py-0.5 text-[10px] font-mono">
                          {ctrl.id}
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-900">
                        {ctrl ? ctrl.name : row.requirement}
                      </span>
                      {ctrl && (
                        <span className="text-[11px] text-slate-500">
                          · {ctrl.category}
                        </span>
                      )}
                    </div>
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
                  </div>
                  {ctrl?.summary && (
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {ctrl.summary}
                    </p>
                  )}
                  {!ctrl && row.requirement && (
                    <p className="mt-1.5 text-[11px] italic text-slate-500">
                      ISMS-P 통제항목 카탈로그에서 자동 매칭되지 않은 요구사항입니다.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            * 본 매핑은 {ISMSP_META.source} 공개 자료 기반의 비공식 정리이며,
            실제 인증 심사 시에는 공식 안내서가 우선합니다.
          </p>
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

      <footer className="text-xs text-slate-500 print:mt-8">
        본 제안 요약은 공개 자료 기반의 비공식 포트폴리오 데모 결과이며,
        실제 도입 검토는 안랩 공식 SE의 확인을 거쳐야 합니다.
      </footer>
    </article>
  );
}

function RoadmapTimeline({
  recommendations,
}: {
  recommendations: ProductRecommendation[];
}) {
  const phases = [1, 2, 3] as const;
  const PHASE_DOT: Record<number, string> = {
    1: "bg-red-500",
    2: "bg-amber-500",
    3: "bg-slate-400",
  };
  const PHASE_CAPTION: Record<number, string> = {
    1: "즉시 도입",
    2: "6개월 내",
    3: "12개월 내",
  };

  // 비어있는 phase는 건너뛰되, 적어도 하나는 있어야 표시
  const nonEmpty = phases.filter(
    (p) => recommendations.some((r) => r.priority === p),
  );
  if (nonEmpty.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">도입 로드맵</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {nonEmpty.map((phase, idx) => {
          const items = recommendations
            .filter((r) => r.priority === phase)
            .sort((a, b) => a.product_id.localeCompare(b.product_id));
          return (
            <div key={phase} className="relative">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${PHASE_DOT[phase]}`}
                />
                <span className="text-xs font-semibold text-slate-900">
                  Phase {phase}
                </span>
                <span className="text-[11px] text-slate-500">
                  {PHASE_CAPTION[phase]}
                </span>
              </div>
              <div className="mt-2 ml-[5px] border-l-2 border-dashed border-slate-200 pl-3.5 pb-1">
                <div className="flex flex-wrap gap-1.5">
                  {items.map((r) => {
                    const p = PRODUCT_BY_ID.get(r.product_id);
                    return (
                      <span
                        key={r.product_id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {p?.name_ko ?? r.product_id}
                      </span>
                    );
                  })}
                </div>
              </div>
              {idx < nonEmpty.length - 1 && (
                <span className="absolute right-0 top-1 hidden text-slate-300 sm:block">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ContextChips({ profile }: { profile: CustomerProfile }) {
  const items: string[] = [];
  if (profile.infrastructure.networkSeparation) items.push("망분리");
  if (profile.infrastructure.otEnvironment) items.push("OT 환경");
  if (profile.infrastructure.hasEdr) items.push("EDR 보유");
  if (profile.infrastructure.hasSoc) items.push("자체 SOC");
  if (profile.infrastructure.cloudUsage !== "none")
    items.push(`클라우드: ${profile.infrastructure.cloudUsage}`);
  profile.painPoints.forEach((p) =>
    items.push(lookupLabel(PAIN_OPTIONS, p)),
  );
  profile.compliance.forEach((c) =>
    items.push(lookupLabel(COMPLIANCE_OPTIONS, c)),
  );
  if (items.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {items.map((label, i) => (
        <span
          key={i}
          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function ProductCard({ rec }: { rec: ProductRecommendation }) {
  const p = PRODUCT_BY_ID.get(rec.product_id);
  const displayName = p?.name_ko ?? rec.product_id;
  const enName = p?.name;
  const category = p?.category_label;
  const tagline = p?.tagline;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
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
            className="no-print shrink-0 text-[11px] font-medium text-brand hover:underline"
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
