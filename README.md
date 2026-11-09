# 도토리치 (La2on)

**배포 주소**: 준비 중

## 시작하기

```bash
nvm use        # Node 22 (.nvmrc)
npm install
npm run dev
```

| 스크립트                          | 설명                 |
| --------------------------------- | -------------------- |
| `npm run dev`                     | 개발 서버            |
| `npm run build`                   | 타입 체크 + 빌드     |
| `npm run lint`                    | oxlint 검사          |
| `npm run format` / `format:check` | Prettier 정리 / 검사 |
| `npm run typecheck`               | 타입 체크만          |

VS Code로 열면 권장 확장 설치 알림이 뜹니다. 아래 4개를 설치해 주세요. 저장할 때 자동으로 포맷됩니다.

- Prettier - Code formatter
- Tailwind CSS IntelliSense
- oxc
- EditorConfig for VS Code

## 기술 스택

- React + Vite + TypeScript
- Tailwind CSS v4
- react-router (중첩 라우트로 `AppLayout` / `PlainLayout` 적용)
- clsx (조건부 className)
- Prettier + prettier-plugin-tailwindcss, oxlint
- 백엔드 API: 아직 미연동

## 폴더 구조

```
src/
├── pages/
│   ├── onboarding/       # 로그인, 약관 동의, 닉네임 설정, 레벨 테스트, 레벨 테스트 결과
│   ├── home/             # 홈
│   ├── learn/            # 섹터·단계 선택, 용어 미리보기, 문제 풀이·해설, 단계 완료
│   ├── review/           # 카드뉴스 복습
│   ├── news/             # 뉴스
│   ├── wrong-note/       # 오답노트
│   ├── tools/            # 금융 도구 목록, 대출 상환 비교, 복리 계산기, 금리 변동 시뮬레이터
│   ├── tutor/            # AI 튜터
│   └── my/               # 마이페이지, 캐릭터 상점
│
├── components/
│   ├── layout/           # 화면 틀
│   │   ├── AppLayout.tsx     # 하단 바 있는 화면 (홈·뉴스·오답노트·금융도구·마이)
│   │   ├── PlainLayout.tsx   # 하단 바 없는 화면 (온보딩·학습 진행·상세)
│   │   └── BottomNav.tsx     # 하단 바 (플로팅)
│   │
│   ├── common/           # 공통 UI: Button, Card, OptionButton, ProgressBar, SectorChip
│   └── icons/            # 아이콘 (하단 바 아이콘 등)
│
├── constants/            # 섹터 정의 등 공통 상수
├── styles/
│   └── tokens.css        # 디자인 토큰 (색·글자·간격·모서리·그림자)
├── router/
│   ├── routes.ts         # 경로 정의 (ROUTES)
│   └── index.tsx         # 라우터
├── index.css             # Tailwind 진입점 + 전역 스타일
└── main.tsx
```

- import는 `@/` 별칭을 씁니다. 예: `import { Button } from '@/components/common'`
- 페이지 이동은 경로 문자열을 직접 쓰지 않고 `ROUTES`를 씁니다. 예: `navigate(ROUTES.quiz('stock', 2))`

## 디자인 토큰 (`styles/tokens.css`)

Figma는 화면 폭 975로 그려져 있고, 실제 기기는 390pt입니다. **Figma 수치 ÷ 2.5**로 넣어 두었습니다.

### 색

색은 항상 아래 이름으로만 씁니다. hex 값을 코드에 직접 쓰지 않습니다.
각 색은 `100`~`900` 단계가 있고, 단계 없이 쓰면 `500`입니다.

| 이름           | hex (500) | 주 용도                                                   |
| -------------- | --------- | --------------------------------------------------------- |
| `coconut`      | `#FDFBE4` | 배경(`200`), 카드(`100`), 그림자·비활성(`600`)            |
| `apricot`      | `#E0AA6A` | 주 버튼(`600`), 보조 버튼(`100`), 진행 바(`500`), 📈 주식 |
| `avocado`      | `#6C773F` | 보조 글자(`400`), 정답, 🏠 생활 금융                      |
| `burnt-orange` | `#C4762B` | 오답, 📘 금융 기초                                        |
| `herb`         | `#2E3E19` | 본문 글자                                                 |

사용 예: `bg-coconut-200`, `text-herb`, `border-apricot-500`

### 글자 (Noto Sans KR)

| 클래스            | 용도      | 크기                     |
| ----------------- | --------- | ------------------------ |
| `text-question`   | 문제 문장 | 22 Bold                  |
| `text-title`      | 화면 제목 | 20 Black                 |
| `text-card-title` | 카드 제목 | 15 Bold                  |
| `text-body`       | 본문      | 14 Regular, 줄 간격 150% |
| `text-sub`        | 보조      | 12 Medium                |
| `text-tag`        | 태그      | 11 Bold                  |

### 크기 · 모서리 · 그림자

| 클래스                                                                | 값                                         |
| --------------------------------------------------------------------- | ------------------------------------------ |
| `px-gutter` / `gap-gap` / `h-btn`                                     | 좌우 여백 20 / 요소 간격 14 / 버튼 높이 52 |
| `rounded-screen` / `rounded-card` / `rounded-option` / `rounded-full` | 화면 28 / 카드 20 / 보기 18 / 칩           |
| `shadow-card` / `shadow-option`                                       | 카드 그림자 / 보기 입체                    |
| `shadow-btn-primary` / `shadow-btn-secondary`                         | 주 버튼 입체 / 보조 버튼 입체              |

### 공통 컴포넌트

| 컴포넌트       | 사용 예                                                               |
| -------------- | --------------------------------------------------------------------- |
| `Button`       | `<Button />`, `<Button variant="secondary" />`, `<Button disabled />` |
| `Card`         | `<Card>...</Card>`                                                    |
| `OptionButton` | `<OptionButton state="default \| selected \| correct \| wrong" />`    |
| `ProgressBar`  | `<ProgressBar value={n} max={18} />`                                  |
| `SectorChip`   | `<SectorChip sector="stock \| life \| basic" />`                      |

---

## Git 규칙

### 브랜치 구조

- `main`: 배포용, 항상 안정적인 상태만 유지
- `develop`: 개발 중인 최신 상태, 기능 브랜치들이 여기로 모임
- `feat/기능명`: 각자 작업하는 기능 브랜치, **`develop`에서 분기**

### 작업 순서

1. 작업 시작 전 `develop`을 최신 상태로 받아옵니다.

```
git checkout develop
git pull origin develop
```

2. `develop`에서 기능 브랜치를 새로 만듭니다.

```
git checkout -b feat/기능명
```

3. 작업 후 커밋 → 푸시 → **`develop`으로 PR** 생성

### 브랜치 이름

```
feat/기능명
```

예: `feat/level-test`, `feat/loan-repayment`

### 커밋 메시지

한글로 자유롭게 쓰되, 아래 태그를 앞에 붙입니다.

```
[태그] 설명
```

| 태그       | 용도                           |
| ---------- | ------------------------------ |
| `[기능]`   | 새 기능/페이지 추가            |
| `[수정]`   | 기존 기능 동작 변경/버그 수정  |
| `[스타일]` | 동작 변화 없는 디자인/CSS 수정 |
| `[문서]`   | README 등 문서 변경            |
| `[설정]`   | 패키지 설치, 설정 파일 변경    |
| `[리팩터]` | 동작 변화 없는 코드 구조 개선  |

예: `[기능] 레벨 테스트 진행 바 추가`, `[수정] 하단 바 활성 탭 그림자 잘림 해결`

### PR / 머지

- `develop`에 직접 푸시하지 않습니다.
- 기능 브랜치에서 작업 후 PR을 올리고, 팀원들의 검토 후 머지합니다.
- `develop → main`은 배포 시점에 병합합니다 (PR 없이).
