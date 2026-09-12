# MyStorage

React + TypeScript + Vite 기반의 모바일 우선 PWA입니다. 사진, 메모, 기억을 한 곳에 담는 첫 화면과 Supabase 연결 상태 표시를 포함합니다.

## 실행

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`에 Supabase의 URL과 프론트엔드용 anon/publishable key를 입력합니다. `service_role` 키는 절대 입력하지 않습니다.

## 검증

```bash
pnpm check
pnpm build
```

## 현재 범위

첫 화면, PWA manifest/service worker 설정, `public.notes` 조회를 통한 Supabase 연결 확인까지만 구현되어 있습니다. AI 기능과 벡터 검색은 포함하지 않았습니다.
