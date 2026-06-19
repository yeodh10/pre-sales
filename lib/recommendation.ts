export type Priority = 1 | 2 | 3;

export interface ProductRecommendation {
  product_id: string;
  priority: Priority;
  rationale: string;
  key_outcomes: string[];
}

export interface ComplianceMapping {
  requirement: string;
  covered_by: string[];
}

export interface RecommendationResult {
  summary: string;
  recommendations: ProductRecommendation[];
  compliance_mapping: ComplianceMapping[];
  risks_and_notes: string[];
  model_used?: string;
  generated_at?: string;
}

export const RECOMMENDATION_TOOL_SCHEMA = {
  name: "submit_recommendation",
  description:
    "Submit the AhnLab solution recommendation for the given customer profile. " +
    "Use only the product_ids that exist in the provided product knowledge base. " +
    "Group products into 3 phases by priority (1 = 즉시 도입, 2 = 6개월 내, 3 = 12개월 내).",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description:
          "한국어로 작성된 1~2문장 요약. 고객 상황과 추천 조합의 핵심 가치 제안.",
      },
      recommendations: {
        type: "array",
        description:
          "추천 제품 목록. 각 항목은 product_id, priority(1|2|3), rationale, key_outcomes 포함.",
        items: {
          type: "object",
          properties: {
            product_id: {
              type: "string",
              description: "KB의 제품 id (예: v3, edr, mds, eps, mss 등)",
            },
            priority: {
              type: "integer",
              enum: [1, 2, 3],
              description: "1=Phase 1 즉시 도입, 2=Phase 2 6개월, 3=Phase 3 12개월",
            },
            rationale: {
              type: "string",
              description:
                "왜 이 제품을 추천하는가. 고객의 산업/페인포인트/인프라와 연결해 1~3문장으로.",
            },
            key_outcomes: {
              type: "array",
              items: { type: "string" },
              description: "도입 시 기대 효과 2~4개 (짧은 구).",
            },
          },
          required: ["product_id", "priority", "rationale", "key_outcomes"],
        },
      },
      compliance_mapping: {
        type: "array",
        description:
          "고객의 컴플라이언스 요구별로 어떤 추천 제품이 충족에 기여하는지 매핑.",
        items: {
          type: "object",
          properties: {
            requirement: {
              type: "string",
              description:
                "구체적 요구 또는 통제항목 (예: 'ISMS-P 2.10.1 악성코드 통제', '망분리 의무').",
            },
            covered_by: {
              type: "array",
              items: { type: "string" },
              description: "이 요구를 충족하는 데 기여하는 product_id 배열.",
            },
          },
          required: ["requirement", "covered_by"],
        },
      },
      risks_and_notes: {
        type: "array",
        items: { type: "string" },
        description:
          "도입 시 유의사항, 추가 검증 필요 항목, 한계점 등 2~4개 짧은 문장.",
      },
    },
    required: [
      "summary",
      "recommendations",
      "compliance_mapping",
      "risks_and_notes",
    ],
  },
} as const;
