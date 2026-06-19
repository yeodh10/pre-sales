# 안랩 Solution Fit Co-pilot

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

## 현재 진행 상황

- [x] **Phase 1** — Next.js + Tailwind 골격, 안랩 제품 KB(JSON), 고객 프로파일 입력 폼
- [ ] Phase 2 — 추천 엔진 (`/api/recommend`)
- [ ] Phase 3 — 제안 요약 렌더 + 컴플라이언스 매핑 + Markdown/PDF 내보내기
- [ ] Phase 4 (Stretch) — ISMS-P RAG 인용, 제안서 PDF 템플릿

## 제품 KB

`data/ahnlab-products.json`에 13개 제품/서비스가 정리되어 있습니다.

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
