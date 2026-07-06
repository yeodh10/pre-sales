import productsKb from "@/lib/kb";
import type { CustomerProfile } from "./types";
import {
  COMPLIANCE_OPTIONS,
  INDUSTRY_OPTIONS,
  PAIN_OPTIONS,
  SIZE_OPTIONS,
} from "./options";
import type { RecommendationResult } from "./recommendation";
import { ISMSP_META, lookupControl } from "./ismsp";

interface KbItem {
  id: string;
  name: string;
  name_ko: string;
  category_label: string;
  tagline: string;
  source_url: string;
}

const PRODUCT_BY_ID = new Map<string, KbItem>(
  (productsKb.products as KbItem[]).map((p) => [p.id, p]),
);

const PHASE_LABEL: Record<number, string> = {
  1: "Phase 1 · 즉시 도입",
  2: "Phase 2 · 6개월 내",
  3: "Phase 3 · 12개월 내",
};

function lookupLabel<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function formatDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function buildMarkdown(
  profile: CustomerProfile,
  result: RecommendationResult,
): string {
  const lines: string[] = [];

  const customer = profile.companyName || "고객사";
  lines.push(`# 안랩 솔루션 제안 — ${customer}`);
  lines.push("");
  lines.push(`> ${result.summary}`);
  lines.push("");

  lines.push("## 1. 고객 개요");
  lines.push("");
  lines.push(`- **산업**: ${lookupLabel(INDUSTRY_OPTIONS, profile.industry)}`);
  lines.push(`- **규모**: ${lookupLabel(SIZE_OPTIONS, profile.size)}`);
  if (profile.employeeCount)
    lines.push(`- **임직원 수**: ${profile.employeeCount.toLocaleString()}명`);
  if (profile.endpointCount)
    lines.push(`- **엔드포인트 수**: ${profile.endpointCount.toLocaleString()}대`);

  const infraBits: string[] = [];
  if (profile.infrastructure.hasAv) infraBits.push("백신");
  if (profile.infrastructure.hasFirewall) infraBits.push("방화벽");
  if (profile.infrastructure.hasEdr) infraBits.push("EDR");
  if (profile.infrastructure.hasSoc) infraBits.push("자체 SOC");
  if (profile.infrastructure.networkSeparation) infraBits.push("망분리");
  if (profile.infrastructure.otEnvironment) infraBits.push("OT 환경");
  if (profile.infrastructure.cloudUsage !== "none")
    infraBits.push(`클라우드(${profile.infrastructure.cloudUsage})`);
  if (infraBits.length)
    lines.push(`- **현재 인프라**: ${infraBits.join(", ")}`);

  if (profile.painPoints.length) {
    lines.push(
      `- **페인포인트**: ${profile.painPoints
        .map((p) => lookupLabel(PAIN_OPTIONS, p))
        .join(", ")}`,
    );
  }
  if (profile.compliance.length) {
    lines.push(
      `- **컴플라이언스 요구**: ${profile.compliance
        .map((c) => lookupLabel(COMPLIANCE_OPTIONS, c))
        .join(", ")}`,
    );
  }
  if (profile.notes) {
    lines.push(`- **메모**: ${profile.notes}`);
  }
  lines.push("");

  lines.push("## 2. 추천 제품 조합");
  lines.push("");
  for (const phase of [1, 2, 3] as const) {
    const items = result.recommendations
      .filter((r) => r.priority === phase)
      .sort((a, b) => a.product_id.localeCompare(b.product_id));
    if (items.length === 0) continue;
    lines.push(`### ${PHASE_LABEL[phase]}`);
    lines.push("");
    for (const rec of items) {
      const p = PRODUCT_BY_ID.get(rec.product_id);
      const title = p ? `${p.name_ko} (${p.name})` : rec.product_id;
      lines.push(`**${title}**`);
      if (p?.category_label) lines.push(`- 카테고리: ${p.category_label}`);
      lines.push(`- 선정 이유: ${rec.rationale}`);
      if (rec.key_outcomes.length) {
        lines.push(`- 기대 효과:`);
        for (const o of rec.key_outcomes) lines.push(`  - ${o}`);
      }
      if (p?.source_url) lines.push(`- 공식 소스: ${p.source_url}`);
      lines.push("");
    }
  }

  if (result.compliance_mapping.length > 0) {
    lines.push("## 3. 컴플라이언스 매핑");
    lines.push("");
    lines.push(`> 출처: ${ISMSP_META.source} · ${ISMSP_META.official_url}`);
    lines.push("");
    for (const row of result.compliance_mapping) {
      const ctrl = lookupControl(row.control_id);
      const names = row.covered_by
        .map((id) => PRODUCT_BY_ID.get(id)?.name_ko ?? id)
        .join(", ");
      if (ctrl) {
        lines.push(`### \`${ctrl.id}\` ${ctrl.name}`);
        lines.push(`- 영역: ${ctrl.category}`);
        lines.push(`- 통제 요지: ${ctrl.summary}`);
        lines.push(`- 충족 기여 제품: ${names}`);
      } else {
        lines.push(`### ${row.requirement}`);
        lines.push(`- 충족 기여 제품: ${names}`);
        lines.push(
          `- _주: ISMS-P 통제항목 카탈로그에서 자동 매칭되지 않은 요구사항_`,
        );
      }
      lines.push("");
    }
  }

  if (result.risks_and_notes.length > 0) {
    lines.push("## 4. 유의사항 · 추가 검토");
    lines.push("");
    for (const n of result.risks_and_notes) lines.push(`- ${n}`);
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    `_생성일: ${formatDate(result.generated_at)} · 모델: ${
      result.model_used ?? "n/a"
    }_`,
  );
  lines.push("");
  lines.push(
    "_비공식 개인 포트폴리오 데모 · 안랩과 무관 · 공개 자료 기반. " +
      "실제 도입 검토는 안랩 공식 SE의 확인이 필요합니다._",
  );

  return lines.join("\n");
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
