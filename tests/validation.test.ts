import { describe, it, expect } from "vitest";
import { sanitizeRecommendation } from "@/lib/validation";
import type { RecommendationResult } from "@/lib/recommendation";

function raw(overrides: Partial<RecommendationResult> = {}): RecommendationResult {
  return {
    summary: "test",
    recommendations: [],
    compliance_mapping: [],
    risks_and_notes: [],
    ...overrides,
  };
}

describe("sanitizeRecommendation — 환각 제거", () => {
  it("KB에 없는 product_id 추천을 제거한다", () => {
    const { result, report } = sanitizeRecommendation(
      raw({
        recommendations: [
          { product_id: "v3", priority: 1, rationale: "r", key_outcomes: [] },
          {
            product_id: "ghost_product",
            priority: 2,
            rationale: "r",
            key_outcomes: [],
          },
        ],
      }),
    );
    expect(result.recommendations.map((r) => r.product_id)).toEqual(["v3"]);
    expect(report.droppedRecommendations).toContain("ghost_product");
  });

  it("매핑의 covered_by에서 잘못된 product_id를 제거한다", () => {
    const { result } = sanitizeRecommendation(
      raw({
        compliance_mapping: [
          {
            requirement: "ISMS-P 2.10.1 보안시스템 운영",
            control_id: "2.10.1",
            covered_by: ["v3", "nope"],
          },
        ],
      }),
    );
    expect(result.compliance_mapping[0].covered_by).toEqual(["v3"]);
  });

  it("카탈로그에 없는 control_id는 비운다", () => {
    const { result, report } = sanitizeRecommendation(
      raw({
        compliance_mapping: [
          {
            requirement: "made up",
            control_id: "9.9.9",
            covered_by: ["v3"],
          },
        ],
      }),
    );
    expect(result.compliance_mapping[0].control_id).toBeUndefined();
    expect(report.droppedControlIds).toContain("9.9.9");
  });

  it("covered_by가 모두 무효하면 매핑 행 자체를 제거한다", () => {
    const { result } = sanitizeRecommendation(
      raw({
        compliance_mapping: [
          { requirement: "x", covered_by: ["nope1", "nope2"] },
        ],
      }),
    );
    expect(result.compliance_mapping).toHaveLength(0);
  });

  it("유효한 control_id는 유지한다", () => {
    const { result } = sanitizeRecommendation(
      raw({
        compliance_mapping: [
          {
            requirement: "ISMS-P 2.11.3 이상행위 분석 및 모니터링",
            control_id: "2.11.3",
            covered_by: ["edr"],
          },
        ],
      }),
    );
    expect(result.compliance_mapping[0].control_id).toBe("2.11.3");
  });
});
