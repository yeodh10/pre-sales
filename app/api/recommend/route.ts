import { NextResponse } from "next/server";
import { generateRecommendation } from "@/lib/anthropic";
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

  try {
    const result = await generateRecommendation(profile);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "추천 생성 중 알 수 없는 오류가 발생했습니다.";
    console.error("[/api/recommend]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
