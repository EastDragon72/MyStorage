# MyStorage

React + TypeScript + Vite 기반의 모바일 우선 PWA입니다. Supabase `public.notes` 테이블을 사용하는 Notes CRUD 화면을 포함합니다.

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

- Notes 목록 보기
- Note 작성, 상세 보기, 수정, 삭제
- 저장·수정·삭제 후 화면 목록 즉시 반영
- 모바일 우선 UI
- Supabase 환경변수 클라이언트 연결

현재 프로젝트에는 로그인/Auth가 아직 없습니다. 따라서 현재 Supabase RLS 정책이 `authenticated` 사용자만 허용하도록 설정되어 있다면, 실제 브라우저 CRUD에는 Auth 구현 또는 별도의 RLS 정책 설정이 추가로 필요합니다. `service_role` key를 프론트엔드에 넣어 우회하지 않습니다.

아직 구현하지 않은 기능:

- Memories CRUD
- 검색
- AI
- Vector/Embedding
