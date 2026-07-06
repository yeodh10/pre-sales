# 안랩 Solution Fit Co-pilot

[![CI](https://github.com/yeodh10/pre-sales/actions/workflows/ci.yml/badge.svg)](https://github.com/yeodh10/pre-sales/actions/workflows/ci.yml)

고객 환경/요구사항을 입력하면 → 적합한 안랩 제품 조합을 추천하고 → 컴플라이언스 충족 매핑 + 도입 우선순위를 포함한 제안 요약을 자동 생성하는 **프리세일즈 코파일럿** (포트폴리오 데모).

> 비공식 개인 포트폴리오 데모입니다. 안랩과 무관하며, 공개된 자료만 사용했습니다.
> 경쟁사 비교가 포함된 경우 공개 정보에 한합니다.

## 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic Claude API (Phase 2부터)

## 개발 시작

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY 입력
npm run dev
```

브라우저: <http://localhost:3000>

## 테스트

룰 엔진과 검증 레이어의 회귀를 막는 단위 테스트 (vitest, 23 cases).

```bash
npm test          # 1회 실행
npm run test:watch
```

주요 보장: "OT면 EPS가 항상 Phase 1", "추천 product_id는 모두 KB에 존재",
"ISMS-P 미선택 시 통제 매핑 없음", "환각 product_id/control_id 자동 제거" 등.

## 배포

면접 데모용 Vercel 배포 절차는 [`DEPLOY.md`](./DEPLOY.md) 참고. URL 하나로 어디서든 데모 가능.

## 현재 진행 상황

- [x] **Phase 1** — Next.js + Tailwind 골격, 안랩 제품 KB(JSON), 고객 프로파일 입력 폼
- [x] **Phase 2** — 추천 엔진 (`/api/recommend`) + Claude Sonnet tool_use 강제
- [x] **Phase 3** — 제안 요약 렌더, 컴플라이언스 매핑 표, KB 외 product_id 검증/필터링, Markdown 다운로드, 인쇄/PDF 저장 스타일
- [x] **Phase 4** — ISMS-P 통제항목 카탈로그 + LLM 컨텍스트 주입 + `control_id` 인용,
  KB 외 통제 ID 환각 차단, 매핑 카드에 통제 명칭·영역·요지·공식 출처 부착
- [x] **데모 안정화** — 룰 기반 폴백 추천 엔진 (`lib/ruleEngine.ts`).
  API 키 미설정/LLM 호출 실패 시 결정론적 규칙으로 추천 생성 → 데모가 멈추지 않음

## 추천 엔진 (LLM + 룰 폴백)

`POST /api/recommend`는 다음 순서로 동작합니다.

1. `ANTHROPIC_API_KEY`가 있으면 Claude(`claude-sonnet-4-6`)로 추천 생성
2. 키가 없거나 LLM 호출이 실패하면 **룰 기반 폴백 엔진**으로 결정론적 추천 생성
   (결과의 `model_used`가 `"rule-based fallback"`으로 표시되고 UI에 안내 배너 노출)

덕분에 면접장 네트워크 문제나 키 누락에도 데모가 항상 동작합니다.
LLM 경로는 더 풍부한 맥락 반영, 룰 경로는 일관성·무비용·오프라인 보장이 강점입니다.

## 컴플라이언스 KB

`data/compliance/ismsp-controls.json` — ISMS-P 인증기준 「2. 보호대책 요구사항」
중 안랩 제품과 연관 깊은 16개 통제항목을 정리.

- 2.6 접근통제: 2.6.1, 2.6.7
- 2.9 시스템·서비스 운영관리: 2.9.3, 2.9.4, 2.9.5, 2.9.6
- 2.10 시스템·서비스 보안관리: 2.10.1, 2.10.2, 2.10.6, 2.10.7, 2.10.8
- 2.11 사고 예방·대응: 2.11.1, 2.11.2, 2.11.3, 2.11.4, 2.11.5

LLM에게 KB와 함께 컨텍스트로 제공되어 `compliance_mapping.control_id`로
정확한 통제 ID를 인용하도록 강제하고, 검증 레이어가 카탈로그 외 ID는 제거합니다.

## 제품 KB

`data/products/<id>.json` — 제품마다 1파일 (13개 제품/서비스) + `_meta.json`.

`lib/kb.ts`가 모듈 로드 시점에 스키마를 검증하며, **필수 필드 누락·id 중복·
잘못된 `source_url` 발견 시 `next build`가 실패**합니다. 즉 KB 품질이 CI에서
자동으로 강제됩니다.

| 카테고리 | 제품 |
| --- | --- |
| 엔드포인트 EPP | V3, EPP |
| 엔드포인트 EDR | EDR |
| 네트워크 APT | MDS |
| 네트워크 NGFW/IPS/DDoS | TrusGuard, AIPS, TrusGuard DPX |
| 통합 관제 | TMS |
| OT/CPS | EPS, XTD, Xcanner |
| 클라우드 | CloudMate |
| 서비스 | MSS |

각 항목은 `solves`, `fits_industry`, `compliance_support`, `source_url`을 포함합니다.

## 면접 데모 시나리오 (3분)

1. 제조/OT 샘플 케이스 클릭 → 폼 자동 채워짐
2. "솔루션 추천 받기" → EPS + XTD + MDS + MSS 조합 제안
3. ISMS-P · 망분리 의무 충족 매핑 표 확인
4. 제안 요약 Markdown 다운로드

## 디스클레이머

- 안랩 공식 공개 자료만 사용
- 비공개·내부 정보 사용하지 않음
- 화면·문서에 "비공식 데모" 명시
- 실제 도입 검토는 안랩 공식 SE의 확인을 받아야 함
