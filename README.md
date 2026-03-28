# EducationAI Demo

학년, 과목, 단원(주제)을 입력하면 템플릿 기반으로 수업 결과물 `md`와 `pptx`를 생성하는 Vercel 배포용 데모입니다.

현재 버전은 `AI 없이도 바로 보여줄 수 있는 데모`를 목표로 합니다.

- 로그인 없음
- Next.js + Vercel 배포
- 입력 폼 제출 후 결과 요약 표시
- Markdown 다운로드
- PPTX 다운로드

## 현재 구현 범위

- `4학년 / 수학 / 평면에서 점의 이동`
  - 비교적 구체적인 샘플 결과물 생성
- `2학년 / 국어 / 겪은 일을 순서대로 말하고 쓰기`
  - 저신뢰 샘플 결과물 생성
- 그 외 조합
  - 일반 템플릿 기반 결과물 생성

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- PptxGenJS
- Zod

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 빌드 확인

```bash
npm run build
```

## 배포 절차

### 1. GitHub에 올리기

이 폴더를 GitHub 저장소로 올립니다.

### 2. Vercel에서 Import

Vercel 대시보드에서:

1. `Add New Project`
2. GitHub 저장소 선택
3. Framework Preset은 `Next.js`
4. Root Directory는 현재 프로젝트 루트

### 3. Environment Variables

현재 버전은 별도 env var가 필요 없습니다.

나중에 OpenAI API를 붙일 때만 아래처럼 추가하면 됩니다.

```bash
OPENAI_API_KEY=...
```

### 4. Deploy

바로 배포하면 됩니다.

## 프로젝트 구조

```text
app/
  api/generate/route.ts     # md/pptx 생성 API
  globals.css               # 전역 스타일
  layout.tsx
  page.tsx                  # 메인 페이지
components/
  generator-form.tsx        # 입력 폼 + 결과 화면
lib/
  lesson-generator.ts       # 템플릿 기반 결과물 로직
  markdown.ts               # md 생성
  pptx.ts                   # pptx 생성
```

## 현재 제약

- `pdf`는 배포 서버에서 바로 생성하지 않음
  - 로컬 Windows + PowerPoint COM 환경에서는 가능
  - Vercel 서버에서는 해당 방식 사용 불가
- 결과물은 아직 `AI 생성`이 아니라 `템플릿 생성`
- 교과서 정합형이 아니라 데모 중심

## 다음 단계

### 1. OpenAI API 연결

입력값을 바탕으로:

- 수업 주제 요약
- 학습 목표
- 문항
- 해설
- 오개념
- 피드백

을 AI가 생성하도록 바꿀 수 있습니다.

### 2. 자산/시드 강화

- 공개 자료 기반 seed 확장
- 교사 검수 반영
- 교과별 프롬프트 보강

### 3. PDF 생성 분리

필요하면:

- 별도 변환 서버
- 외부 렌더링 워커
- 또는 클라이언트 측 PDF 다운로드

구조로 확장할 수 있습니다.
