import { describe, it, expect } from "vitest";
import productsKb from "@/lib/kb";
import ismspControls from "@/data/compliance/ismsp-controls.json";
import { ruleBasedRecommendation } from "@/lib/ruleEngine";
import type { CustomerProfile, Infrastructure } from "@/lib/types";

const VALID_PRODUCT_IDS = new Set(
  (productsKb.products as { id: string }[]).map((p) => p.id),
);
const VALID_CONTROL_IDS = new Set(
  (ismspControls.controls as { id: string }[]).map((c) => c.id),
);

const baseInfra: Infrastructure = {
  hasAv: true,
  hasFirewall: true,
  hasEdr: false,
  hasSoc: false,
  networkSeparation: false,
  cloudUsage: "none",
  otEnvironment: false,
};

type ProfileOverrides = Omit<Partial<CustomerProfile>, "infrastructure"> & {
  infrastructure?: Partial<Infrastructure>;
};

function profile(overrides: ProfileOverrides = {}): CustomerProfile {
  const { infrastructure, ...rest } = overrides;
  return {
    industry: "manufacturing",
    size: "mid",
    painPoints: [],
    compliance: [],
    ...rest,
    infrastructure: { ...baseInfra, ...(infrastructure ?? {}) },
  };
}

const idsOf = (p: CustomerProfile) =>
  ruleBasedRecommendation(p).recommendations.map((r) => r.product_id);
const priorityOf = (p: CustomerProfile, id: string) =>
  ruleBasedRecommendation(p).recommendations.find(
    (r) => r.product_id === id,
  )?.priority;

describe("ruleBasedRecommendation — 기본 불변식", () => {
  it("모든 추천 product_id는 KB에 존재한다", () => {
    const cases: CustomerProfile[] = [
      profile({ industry: "manufacturing_ot" }),
      profile({ industry: "finance", size: "enterprise" }),
      profile({ industry: "public", size: "smb" }),
      profile({ industry: "ecommerce" }),
    ];
    for (const c of cases) {
      for (const id of idsOf(c)) {
        expect(VALID_PRODUCT_IDS.has(id), `unknown product: ${id}`).toBe(true);
      }
    }
  });

  it("엔드포인트 기본 보호(V3)는 항상 포함된다", () => {
    expect(idsOf(profile())).toContain("v3");
  });

  it("우선순위는 항상 1~3 범위다", () => {
    const recs = ruleBasedRecommendation(
      profile({ industry: "manufacturing_ot" }),
    ).recommendations;
    for (const r of recs) {
      expect([1, 2, 3]).toContain(r.priority);
    }
  });

  it("중복 제품 추천이 없다", () => {
    const ids = idsOf(profile({ industry: "manufacturing_ot" }));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("ruleBasedRecommendation — OT/제조 휴리스틱", () => {
  it("OT 환경이면 EPS가 Phase 1로 추천된다", () => {
    const p = profile({
      industry: "manufacturing_ot",
      infrastructure: { otEnvironment: true },
    });
    expect(priorityOf(p, "eps")).toBe(1);
  });

  it("OT 환경이면 XTD·Xcanner도 추천된다", () => {
    const p = profile({ industry: "manufacturing_ot" });
    const ids = idsOf(p);
    expect(ids).toContain("xtd");
    expect(ids).toContain("xcanner");
  });

  it("OT가 아니면 EPS는 추천되지 않는다", () => {
    const p = profile({ industry: "finance" });
    expect(idsOf(p)).not.toContain("eps");
  });
});

describe("ruleBasedRecommendation — 페인포인트/인프라 매핑", () => {
  it("관제 인력 부족이면 MSS가 Phase 1로 추천된다", () => {
    const p = profile({ painPoints: ["soc_shortage"] });
    expect(priorityOf(p, "mss")).toBe(1);
  });

  it("APT 우려가 있으면 MDS가 Phase 1로 추천된다", () => {
    const p = profile({ painPoints: ["apt"] });
    expect(priorityOf(p, "mds")).toBe(1);
  });

  it("DDoS 우려가 있으면 TrusGuard DPX가 추천된다", () => {
    const p = profile({ painPoints: ["ddos"] });
    expect(idsOf(p)).toContain("trusguard_dpx");
  });

  it("클라우드 미사용 + 설정오류 우려 없음이면 CloudMate는 추천되지 않는다", () => {
    const p = profile({
      infrastructure: { cloudUsage: "none" },
      painPoints: [],
    });
    expect(idsOf(p)).not.toContain("cloudmate");
  });

  it("멀티 클라우드면 CloudMate가 추천된다", () => {
    const p = profile({ infrastructure: { cloudUsage: "multi" } });
    expect(idsOf(p)).toContain("cloudmate");
  });

  it("방화벽 미보유면 TrusGuard가 Phase 1로 추천된다", () => {
    const p = profile({ infrastructure: { hasFirewall: false } });
    expect(priorityOf(p, "trusguard")).toBe(1);
  });
});

describe("ruleBasedRecommendation — 컴플라이언스 매핑", () => {
  it("ISMS-P 선택 시 매핑의 control_id는 모두 카탈로그에 존재한다", () => {
    const p = profile({
      industry: "manufacturing_ot",
      compliance: ["ismsp"],
    });
    const mapping = ruleBasedRecommendation(p).compliance_mapping;
    const withId = mapping.filter((m) => m.control_id);
    expect(withId.length).toBeGreaterThan(0);
    for (const m of withId) {
      expect(
        VALID_CONTROL_IDS.has(m.control_id!),
        `unknown control: ${m.control_id}`,
      ).toBe(true);
    }
  });

  it("매핑의 covered_by는 모두 추천된 제품이다", () => {
    const p = profile({
      industry: "manufacturing_ot",
      compliance: ["ismsp", "network_separation", "critical_infra"],
    });
    const result = ruleBasedRecommendation(p);
    const chosen = new Set(result.recommendations.map((r) => r.product_id));
    for (const m of result.compliance_mapping) {
      for (const id of m.covered_by) {
        expect(chosen.has(id), `mapping references non-chosen: ${id}`).toBe(
          true,
        );
      }
    }
  });

  it("망분리 의무 선택 시 경계 보호 매핑이 생성된다", () => {
    const p = profile({
      industry: "manufacturing_ot",
      infrastructure: { networkSeparation: true, otEnvironment: true },
      compliance: ["network_separation"],
    });
    const mapping = ruleBasedRecommendation(p).compliance_mapping;
    expect(mapping.some((m) => m.requirement.includes("망분리"))).toBe(true);
  });

  it("ISMS-P 미선택이면 통제항목(control_id) 매핑이 생성되지 않는다", () => {
    const p = profile({ compliance: [] });
    const mapping = ruleBasedRecommendation(p).compliance_mapping;
    expect(mapping.every((m) => !m.control_id)).toBe(true);
  });
});

describe("ruleBasedRecommendation — 메타", () => {
  it("폴백 표식과 생성시각이 포함된다", () => {
    const r = ruleBasedRecommendation(profile());
    expect(r.model_used).toBe("rule-based fallback");
    expect(r.generated_at).toBeTruthy();
    expect(r.summary.length).toBeGreaterThan(0);
    expect(r.risks_and_notes.length).toBeGreaterThan(0);
  });
});
