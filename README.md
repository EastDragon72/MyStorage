# MyStorage

React + TypeScript + Vite 기반의 모바일 우선 PWA입니다. MyStorage의 기본 화면과 Supabase 클라이언트 연결만 포함합니다.

## 실행

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`에 아래 환경변수를 입력합니다.

```env
VITE_SUPABASE_URL=https://sxoxtdwipxdxkmmdfskb.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

`service_role` key는 사용하지 않습니다. `.env.local`은 Git에 커밋되지 않습니다.

## 빌드

```bash
pnpm check
pnpm build
```

## 현재 단계 범위

이번 단계에는 Supabase JS 클라이언트와 환경변수 구성, `public.notes`에 대한 연결 상태 확인만 포함되어 있습니다. 다음 기능은 아직 구현하지 않았습니다.

- Notes/Memories CRUD
- 검색 기능
- AI 기능
- Vector/Embedding
- 로그인/Auth
