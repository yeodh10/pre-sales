import { NextResponse } from "next/server";
import { generateRecommendation } from "@/lib/anthropic";
import { ruleBasedRecommendation } from "@/lib/ruleEngine";
import { sanitizeRecommendation } from "@/lib/validation";
import type { CustomerProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let profile: CustomerProfile;
  try {
    profile = (await req.json()) as CustomerProfile;
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 },
    );
  }

  if (!profile?.industry || !profile?.size) {
    return NextResponse.json(
      { error: "industry와 size는 필수 입력입니다." },
      { status: 400 },
    );
  }

  // API 키가 없으면 LLM 호출을 시도하지 않고 곧바로 룰 엔진 폴백.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(ruleBasedRecommendation(profile));
  }

  try {
    const raw = await generateRecommendation(profile);
    const { result, report } = sanitizeRecommendation(raw);
    if (
      report.droppedRecommendations.length > 0 ||
      report.droppedComplianceProductIds.length > 0 ||
      report.droppedControlIds.length > 0
    ) {
      console.warn("[/api/recommend] dropped invalid ids:", report);
    }
    return NextResponse.json(result);
  } catch (err) {
    // LLM 호출 실패(네트워크/레이트리밋/파싱 등) 시에도 데모가 멈추지 않도록
    // 룰 기반 폴백으로 응답한다.
    console.error("[/api/recommend] LLM 실패, 룰 엔진으로 폴백:", err);
    return NextResponse.json(ruleBasedRecommendation(profile));
  }
}
