import productsKb from "@/lib/kb";
import ismspControls from "@/data/compliance/ismsp-controls.json";
import type { CustomerProfile } from "./types";
import type {
  ComplianceMapping,
  Priority,
  ProductRecommendation,
  RecommendationResult,
} from "./recommendation";

/**
 * 결정론적 룰 기반 추천 엔진.
 * LLM(Anthropic API)이 없거나 호출이 실패할 때의 폴백.
 * 핸드오프 문서의 "룰 + LLM 추론" 설계 중 룰 레이어이며,
 * 면접 데모에서 네트워크/키 문제로 LLM이 죽어도 데모가 멈추지 않게 한다.
 */

interface KbProduct {
  id: string;
  name_ko: string;
  compliance_support: string[];
}
interface IsmspControl {
  id: string;
  name: string;
  relevant_solutions: string[];
}

const PRODUCTS = productsKb.products as KbProduct[];
const VALID_IDS = new Set(PRODUCTS.map((p) => p.id));
const CONTROLS = ismspControls.controls as IsmspControl[];
const NAME = (id: string) =>
  PRODUCTS.find((p) => p.id === id)?.name_ko ?? id;

interface Pick {
  id: string;
  priority: Priority;
  rationale: string;
  key_outcomes: string[];
}

export function ruleBasedRecommendation(
  profile: CustomerProfile,
): RecommendationResult {
  const picks = new Map<string, Pick>();

  // 더 높은 우선순위(낮은 숫자)로만 갱신
  const add = (
    id: string,
    priority: Priority,
    rationale: string,
    key_outcomes: string[],
  ) => {
    if (!VALID_IDS.has(id)) return;
    const existing = picks.get(id);
    if (!existing || priority < existing.priority) {
      picks.set(id, { id, priority, rationale, key_outcomes });
    }
  };

  const infra = profile.infrastructure;
  const isOt = profile.industry === "manufacturing_ot" || infra.otEnvironment;
  const pains = new Set(profile.painPoints);
  const comp = new Set(profile.compliance);

  // 1) 엔드포인트 기본 보호 — 항상
  if (profile.size === "enterprise" || profile.size === "mid") {
    add(
      "epp",
      1,
      "단일 에이전트·중앙 콘솔로 다수 단말을 통합 관리하기 위한 엔드포인트 기반 플랫폼입니다.",
      ["엔드포인트 통합 관리", "에이전트 충돌 최소화", "운영 효율화"],
    );
  }
  add(
    "v3",
    1,
    "랜섬웨어·악성코드로부터 PC·서버를 보호하는 기본 안티멀웨어로 모든 환경의 출발점입니다.",
    ["랜섬웨어 차단", "실시간 악성코드 탐지·치료"],
  );

  // 2) 탐지·대응
  if (
    pains.has("ransomware") ||
    pains.has("apt") ||
    pains.has("insider_leak") ||
    !infra.hasEdr
  ) {
    add(
      "edr",
      pains.has("apt") || pains.has("ransomware") ? 1 : 2,
      "행위 기반 분석으로 알려지지 않은 위협을 탐지하고 침해 경로를 가시화해 신속히 대응합니다.",
      ["위협 헌팅", "침해 경로 가시성", "감염 단말 격리·복구"],
    );
  }

  // 3) APT / 이메일·네트워크 침투
  if (pains.has("apt") || profile.industry === "finance" || profile.industry === "public") {
    add(
      "mds",
      pains.has("apt") ? 1 : 2,
      "샌드박스 기반으로 이메일·웹 경로의 지능형 위협(APT)과 제로데이를 선제 차단합니다.",
      ["APT 선제 대응", "제로데이 샌드박싱", "네트워크-엔드포인트 통합 대응"],
    );
  }

  // 4) OT/폐쇄망
  if (isOt) {
    add(
      "eps",
      1,
      "ICS·레거시 설비 등 패치가 어려운 폐쇄망 특수목적시스템을 화이트리스트 기반으로 보호합니다.",
      ["폐쇄망 단말 보호", "레거시 OS 대응", "변경 통제·무결성 보호"],
    );
    add(
      "xtd",
      2,
      "OT 자산 가시성을 확보하고 OT망 내부의 이상행위를 탐지합니다.",
      ["OT 자산 인벤토리", "OT 네트워크 이상행위 탐지"],
    );
    add(
      "xcanner",
      2,
      "에이전트 설치가 불가한 OT 시스템을 휴대형으로 비파괴 점검합니다.",
      ["에이전트리스 진단", "정기 OT 점검"],
    );
  }

  // 5) 경계 보호 — 방화벽 미보유 또는 망분리
  if (!infra.hasFirewall || infra.networkSeparation) {
    add(
      "trusguard",
      infra.hasFirewall ? 2 : 1,
      "방화벽·IPS·VPN·C&C 탐지를 통합한 NGFW로 망 경계를 보호하고 망분리 구성을 뒷받침합니다.",
      ["경계 통합 방어", "C&C 통신 차단", "망분리 경계 보호"],
    );
  }
  if (infra.networkSeparation || profile.industry === "public") {
    add(
      "aips",
      2,
      "취약점 기반 네트워크 공격과 악성코드 전파를 시그니처로 탐지·차단합니다.",
      ["취약점 익스플로잇 차단", "내부 확산 억제"],
    );
  }

  // 6) DDoS
  if (pains.has("ddos") || profile.industry === "ecommerce") {
    add(
      "trusguard_dpx",
      2,
      "복합 DDoS 공격을 인텔리전스 기반으로 차단해 서비스 가용성을 보장합니다.",
      ["DDoS 방어", "서비스 가용성 확보"],
    );
  }

  // 7) 클라우드
  if (infra.cloudUsage !== "none" || pains.has("cloud_misconfig")) {
    add(
      "cloudmate",
      infra.cloudUsage === "none" ? 3 : 2,
      "멀티 클라우드 보안 설정(CSPM)을 형상 관리하고 관제센터와 연동해 모니터링합니다.",
      ["클라우드 설정 오류 점검", "멀티 클라우드 가시성"],
    );
  }

  // 8) 관제
  if (!infra.hasSoc || pains.has("soc_shortage")) {
    add(
      "mss",
      pains.has("soc_shortage") ? 1 : 2,
      "자체 관제 인력 부족을 24/7 보안관제 서비스로 보완하고 침해사고 대응을 지원합니다.",
      ["24/7 SOC 관제", "침해사고 대응(IR) 지원", "운영 인력 부담 완화"],
    );
  }
  if (
    profile.size === "enterprise" ||
    (pains.has("soc_shortage") && infra.hasSoc)
  ) {
    add(
      "tms",
      2,
      "다중 보안 장비 이벤트를 단일 플랫폼에서 상관분석해 통합 가시성을 제공합니다.",
      ["통합 관제 대시보드", "ML 기반 상관분석"],
    );
  }

  const recommendations: ProductRecommendation[] = Array.from(picks.values())
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
    .map(({ id, priority, rationale, key_outcomes }) => ({
      product_id: id,
      priority,
      rationale,
      key_outcomes,
    }));

  const chosenIds = new Set(recommendations.map((r) => r.product_id));

  // 컴플라이언스 매핑: ISMS-P 통제항목 중 추천 제품과 연관된 것을 인용
  const compliance_mapping: ComplianceMapping[] = [];
  const wantsIsmsp = comp.has("ismsp") || comp.has("isms");
  if (wantsIsmsp) {
    for (const ctrl of CONTROLS) {
      const covered = ctrl.relevant_solutions.filter((id) =>
        chosenIds.has(id),
      );
      if (covered.length > 0) {
        compliance_mapping.push({
          requirement: `ISMS-P ${ctrl.id} ${ctrl.name}`,
          control_id: ctrl.id,
          covered_by: covered,
        });
      }
    }
  }

  // 망분리 의무는 별도 명시 (ISMS-P 통제와 별개 요구)
  if (comp.has("network_separation")) {
    const boundary = ["trusguard", "aips", "eps"].filter((id) =>
      chosenIds.has(id),
    );
    if (boundary.length > 0) {
      compliance_mapping.push({
        requirement: "망분리 의무 — 경계 보호 및 폐쇄망 단말 보호",
        covered_by: boundary,
      });
    }
  }
  if (comp.has("critical_infra")) {
    const ci = ["eps", "xtd", "xcanner", "aips"].filter((id) =>
      chosenIds.has(id),
    );
    if (ci.length > 0) {
      compliance_mapping.push({
        requirement: "주요정보통신기반시설 보호지침 — OT/기반시설 보호·점검",
        covered_by: ci,
      });
    }
  }

  const summary = buildSummary(profile, recommendations, isOt);

  const risks_and_notes: string[] = [
    "본 결과는 LLM이 아닌 결정론적 룰 엔진으로 생성된 폴백입니다. 실제 제안 시 안랩 SE 검토가 필요합니다.",
    "제품 사양·라인업은 변경될 수 있으므로 안랩 공식 페이지에서 최신 정보를 확인하세요.",
  ];
  if (isOt) {
    risks_and_notes.push(
      "OT 환경은 가용성이 최우선이므로 도입 전 생산 영향도 평가와 단계적 PoC를 권장합니다.",
    );
  }

  return {
    summary,
    recommendations,
    compliance_mapping,
    risks_and_notes,
    model_used: "rule-based fallback",
    generated_at: new Date().toISOString(),
  };
}

function buildSummary(
  profile: CustomerProfile,
  recs: ProductRecommendation[],
  isOt: boolean,
): string {
  const top = recs
    .filter((r) => r.priority === 1)
    .map((r) => NAME(r.product_id));
  const focus = isOt
    ? "OT/폐쇄망 보호를 중심으로"
    : profile.industry === "finance"
      ? "내부 위협 탐지와 관제를 중심으로"
      : "엔드포인트 보호와 위협 대응을 중심으로";
  const topList = top.length > 0 ? top.join(", ") : "엔드포인트 보안";
  return `${focus} 총 ${recs.length}개 안랩 제품을 단계적으로 제안합니다. 즉시 도입 권장: ${topList}.`;
}
