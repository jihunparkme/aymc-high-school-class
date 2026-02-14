# 고등부 학생 관리 시스템 (AYMC High School Class Management)

교회 고등부 분반 담임선생님들이 학생들의 출결, 기도제목, 특이사항을 효율적으로 관리할 수 있도록 돕는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 1. 학생 관리 (선생님용)
*   **학년/반 선택**: 직관적인 카드형 UI로 담당 학년과 반을 선택할 수 있습니다.
*   **주간별 관리**: 주차별로 학생들의 데이터를 관리하며, 이전/다음 주차로 쉽게 이동할 수 있습니다.
*   **출석 체크**: 버튼 클릭 한 번으로 간편하게 출석/결석을 체크할 수 있습니다.
*   **기도제목 & 특이사항**: 학생별로 기도제목과 특이사항을 기록하고 관리할 수 있습니다.
*   **필터링**: 전체/출석/결석 학생을 필터링하여 볼 수 있습니다.

### 2. 관리자 모드
*   **출결 관리**: 학년별, 반별 주간 출결 현황을 한눈에 파악할 수 있습니다.
*   **기도제목/특이사항 조회**: 전체 학생의 기도제목과 특이사항을 모아서 보고 검색할 수 있습니다.
*   **반 관리**: 학년별 반을 추가, 수정, 삭제할 수 있습니다.
*   **학생 관리**: 반별 학생을 추가, 수정, 삭제할 수 있으며 성별 정보를 포함합니다.
*   **데이터 관리**: 현재 데이터를 JSON 파일로 백업하거나 복원할 수 있습니다.

## 🛠 기술 스택

*   **Frontend**: React 18, Vite
*   **Backend (Database)**: Supabase (PostgreSQL)
*   **Styling**: CSS3 (Apple Human Interface Guidelines 스타일 적용)
*   **Deployment**: Vercel (권장)

## 📂 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── AdminPanel.jsx       # 관리자 패널 메인
│   ├── AttendanceManagement.jsx # 출결 현황 조회
│   ├── ClassManagement.jsx  # 반 관리
│   ├── ClassSelector.jsx    # 반 선택 화면
│   ├── DataManagement.jsx   # 데이터 백업/복원
│   ├── GradeSelector.jsx    # 학년 선택 (메인) 화면
│   ├── InputModal.jsx       # 입력 모달
│   ├── NotesView.jsx        # 특이사항 조회
│   ├── PrayerView.jsx       # 기도제목 조회
│   ├── ScrollToTopButton.jsx # 맨 위로 이동 버튼
│   ├── StudentCard.jsx      # 학생 카드
│   ├── StudentList.jsx      # 학생 목록 화면
│   └── StudentManagement.jsx # 학생 관리
├── styles/              # 컴포넌트별 CSS 스타일
├── utils/               # 유틸리티 함수
│   ├── dataManager.js       # 데이터 처리 및 DB 연동 로직
│   └── supabaseClient.js    # Supabase 클라이언트 설정
├── App.jsx              # 메인 앱 컴포넌트 (라우팅 및 상태 관리)
└── main.jsx             # 진입점
```

## 🏁 설치 및 실행 방법

### 1. 저장소 클론 및 의존성 설치

```bash
git clone [repository-url]
cd aymc-high-school-class
npm install
```

### 2. Supabase 설정

1.  [Supabase](https://supabase.com/) 프로젝트를 생성합니다.
2.  SQL 에디터에서 `schema.sql` 파일의 내용을 실행하여 테이블을 생성합니다.
3.  프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력합니다.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 확인합니다.

## 🎨 디자인 컨셉

*   **Minimalism & Clean**: 불필요한 장식을 배제하고 컨텐츠에 집중할 수 있는 깔끔한 디자인.
*   **Apple Style**: San Francisco 폰트, 부드러운 둥근 모서리, 은은한 그림자, 블러 효과 등을 사용하여 세련된 사용자 경험 제공.
*   **Responsive**: 모바일과 데스크탑 환경 모두에서 최적화된 레이아웃.

## 📝 라이선스

This project is licensed under the MIT License.
