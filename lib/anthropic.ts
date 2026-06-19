import Anthropic from "@anthropic-ai/sdk";
import productsKb from "@/data/ahnlab-products.json";
import ismspControls from "@/data/compliance/ismsp-controls.json";
import type { CustomerProfile } from "./types";
import {
  RECOMMENDATION_TOOL_SCHEMA,
  type RecommendationResult,
} from "./recommendation";

const DEFAULT_MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `당신은 안랩(AhnLab) 프리세일즈 솔루션 아키텍트입니다.
제공된 안랩 제품 카탈로그(KB)만 사용해 고객 환경에 적합한 제품 조합을 추천하고,
ISMS-P 통제항목 카탈로그를 인용하여 컴플라이언스 매핑과 도입 우선순위를 제시합니다.

규칙:
- KB에 없는 제품은 절대 추천하지 않습니다.
- product_id는 KB의 id 값을 정확히 사용합니다.
- OT/산업제어 환경이면 EPS·XTD·Xcanner 같은 OT 라인을 우선 고려합니다.
- 망분리 의무가 있으면 폐쇄망·OT 보안과 경계 보호(TrusGuard/AIPS)를 매핑합니다.
- 자체 관제 인력 부족이면 MSS를 우선순위에 포함합니다.
- ISMS-P 관련 컴플라이언스 매핑은 반드시 제공된 controls 카탈로그의 id로 control_id를 채우세요.
  (예: "ISMS-P 2.10.1 보안시스템 운영" → control_id = "2.10.1")
- 카탈로그에 없는 ISMS-P id를 만들어내지 마세요. 모르면 control_id를 비웁니다.
- 추천 제품은 보통 3~6개로 구성합니다 (과도한 과잉 제안 금지).
- 모든 텍스트는 한국어로 작성합니다.
- 출력은 반드시 submit_recommendation 도구 호출로만 응답합니다 (자연어 답변 금지).`;

function buildUserMessage(profile: CustomerProfile): string {
  return [
    "## 안랩 제품 KB (이 목록 외 제품 추천 금지)",
    "```json",
    JSON.stringify(productsKb, null, 2),
    "```",
    "",
    "## ISMS-P 통제항목 카탈로그 (compliance_mapping의 control_id로 사용)",
    "```json",
    JSON.stringify(ismspControls, null, 2),
    "```",
    "",
    "## 고객 프로파일",
    "```json",
    JSON.stringify(profile, null, 2),
    "```",
    "",
    "위 고객에게 적합한 안랩 제품 조합과 ISMS-P 통제항목 매핑을 submit_recommendation 도구로 제출하세요.",
  ].join("\n");
}

export async function generateRecommendation(
  profile: CustomerProfile,
): Promise<RecommendationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다. .env.local 파일에 키를 추가하세요.",
    );
  }

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [RECOMMENDATION_TOOL_SCHEMA as unknown as Anthropic.Tool],
    tool_choice: {
      type: "tool",
      name: RECOMMENDATION_TOOL_SCHEMA.name,
    },
    messages: [
      {
        role: "user",
        content: buildUserMessage(profile),
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error(
      "모델이 도구 호출 대신 자연어로 응답했습니다. 재시도가 필요합니다.",
    );
  }

  const result = toolUse.input as RecommendationResult;
  return {
    ...result,
    model_used: model,
    generated_at: new Date().toISOString(),
  };
}
