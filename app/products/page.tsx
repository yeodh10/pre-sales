import type { Metadata } from "next";
import productsKb from "@/data/ahnlab-products.json";

export const metadata: Metadata = {
  title: "안랩 제품 카탈로그 | Solution Fit Co-pilot",
  description:
    "추천 엔진이 사용하는 안랩 제품 KB를 카테고리별로 정리한 카탈로그 (공개 자료 기반 비공식 데모).",
};

interface Product {
  id: string;
  name: string;
  name_ko: string;
  category: string;
  category_label: string;
  tagline: string;
  key_features: string[];
  solves: string[];
  fits_industry: string[];
  compliance_support: string[];
  source_url: string;
}

interface Meta {
  description: string;
  last_verified: string;
  platform_groups: Record<string, string[]>;
  disclaimer: string;
}

// 카테고리 표시 순서 (KB의 category 값 기준)
const CATEGORY_ORDER = [
  "endpoint_epp",
  "endpoint_platform",
  "endpoint_edr",
  "network_apt",
  "network_ngfw",
  "network_ips",
  "network_ddos",
  "management_console",
  "ot_endpoint",
  "ot_network",
  "ot_scan",
  "cloud_mssp",
  "service_mss",
];

const PLATFORM_LABEL: Record<string, string> = {
  ENDPOINT_PLUS: "AhnLab ENDPOINT PLUS (엔드포인트 통합 플랫폼)",
  CPS_PLUS: "AhnLab CPS PLUS (OT/CPS 통합 플랫폼)",
};

export default function ProductsPage() {
  const products = productsKb.products as Product[];
  const meta = productsKb._meta as unknown as Meta;

  // category_label 단위로 그룹핑
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const arr = groups.get(p.category) ?? [];
    arr.push(p);
    groups.set(p.category, arr);
  }
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => groups.has(c)),
    ...Array.from(groups.keys()).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  // 어느 플랫폼 그룹에 속하는지 역참조
  const platformOf = new Map<string, string>();
  for (const [plat, ids] of Object.entries(meta.platform_groups)) {
    for (const id of ids) platformOf.set(id, plat);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          안랩 제품 카탈로그
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          추천 엔진이 근거로 사용하는 안랩 제품 KB입니다. 총 {products.length}개
          제품·서비스를 카테고리별로 정리했으며, 각 항목은 공식 페이지 출처를
          포함합니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
            최종 확인: {meta.last_verified}
          </span>
          {Object.entries(meta.platform_groups).map(([plat, ids]) => (
            <span
              key={plat}
              className="rounded-md bg-brand-light px-2 py-1 text-brand-dark"
            >
              {PLATFORM_LABEL[plat] ?? plat}: {ids.length}종
            </span>
          ))}
        </div>
      </div>

      {orderedCategories.map((cat) => {
        const items = groups.get(cat)!;
        return (
          <section key={cat}>
            <h2 className="mb-3 border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {items[0].category_label}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((p) => (
                <article
                  key={p.id}
                  id={p.id}
                  className="flex scroll-mt-24 flex-col rounded-lg border border-slate-200 bg-white p-5 target:ring-2 target:ring-brand"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {p.name_ko}
                      </h3>
                      <p className="text-xs text-slate-400">{p.name}</p>
                    </div>
                    {platformOf.has(p.id) && (
                      <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark">
                        {platformOf.get(p.id)}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {p.tagline}
                  </p>

                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase text-slate-400">
                      핵심 기능
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
                      {p.key_features.map((f, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-brand">·</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.fits_industry.map((ind) => (
                      <span
                        key={ind}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>

                  {p.compliance_support.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold uppercase text-slate-400">
                        컴플라이언스 기여
                      </p>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                        {p.compliance_support.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto pt-3">
                    <a
                      href={p.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      공식 제품 페이지 ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        {meta.disclaimer}
      </p>
    </div>
  );
}
