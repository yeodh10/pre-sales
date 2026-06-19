# Vercel 배포 가이드

면접 데모를 URL 하나로 보여주기 위한 Vercel 배포 절차입니다.
Next.js 프로젝트라 Vercel이 빌드 설정을 자동 감지하므로 별도 설정 파일은 필요 없습니다.

---

## 방법 A — GitHub 연동 (권장, CLI 불필요)

1. <https://vercel.com> 가입/로그인 (GitHub 계정으로 로그인하면 가장 간단)
2. **Add New… → Project**
3. `yeodh10/pre-sales` 저장소 **Import**
4. 설정 화면에서:
   - **Framework Preset**: `Next.js` (자동 감지됨)
   - **Root Directory**: `./` (그대로)
   - **Build Command / Output**: 기본값 그대로 (`next build`)
   - **Production Branch**: 데모용이면 `claude/charming-hamilton-8pj5ta`를 그대로 쓰거나,
     `main`에 머지한 뒤 `main`을 프로덕션 브랜치로 지정
5. **Environment Variables**에 아래 2개 추가 (아래 표 참고)
6. **Deploy** 클릭 → 1~2분 후 `https://<프로젝트명>.vercel.app` 발급

### 환경 변수

| Key | Value | 필수 |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (console.anthropic.com 발급) | ✅ 필수 |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` (미설정 시 기본값) | 선택 |

> 환경 변수는 **Production / Preview / Development** 환경 모두에 적용되도록 체크하세요.
> 키 없이 배포하면 폼·프리셋 UI는 뜨지만 "솔루션 추천 받기"가 500 에러를 냅니다.

---

## 방법 B — Vercel CLI

```bash
npm i -g vercel
vercel login

# 프로젝트 루트에서
vercel link            # 최초 1회: 프로젝트 연결
vercel env add ANTHROPIC_API_KEY production   # 키 입력
vercel env add ANTHROPIC_MODEL production      # (선택) claude-sonnet-4-6

vercel --prod          # 프로덕션 배포
```

---

## 배포 후 확인 체크리스트

- [ ] 발급된 URL 접속 → 헤더 "안랩 Solution Fit Co-pilot" + 입력 폼 표시
- [ ] **제조/OT 중견기업** 프리셋 클릭 → 폼 자동 채워짐
- [ ] **솔루션 추천 받기** → 수 초 내 추천 카드 + ISMS-P 통제항목 매핑 표시
- [ ] **Markdown 다운로드** / **인쇄 · PDF 저장** 동작
- [ ] 화면 상단/하단 "비공식 개인 포트폴리오 데모" 디스클레이머 노출

---

## 비용·운영 메모

- 추천 1회 = Claude Sonnet 호출 1회. KB + ISMS-P 카탈로그를 컨텍스트로 보내므로
  입력 토큰이 다소 큽니다(대략 수천 토큰). 데모 트래픽 수준에선 비용 미미.
- 키 노출 방지: 키는 **서버 라우트(`/api/recommend`)에서만** 사용되며 클라이언트로
  전달되지 않습니다. 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요.
- 면접장 와이파이가 불안하면, 데모 직전에 한 번 추천을 돌려 워밍업해두면 안전합니다.
