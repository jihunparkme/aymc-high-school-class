# 고등부 학생 관리 시스템

Vite와 React로 구축된 학생 관리 시스템입니다.

## 필수 요구사항

- Node.js v20.19.0 이상 또는 v22.12.0 이상
- npm 10.8.2 이상

## 설치

```bash
npm install
```

## 개발 서버 실행

### 프론트엔드만 실행
```bash
npm run dev
```

### 프론트엔드 + 백엔드 함께 실행
```bash
npm run dev:full
```

### 백엔드만 실행
```bash
npm run server
```

## 빌드

```bash
npm run build
```

## 미리보기

```bash
npm run preview
```

## 기능

- **학급 관리**: 학년별, 반별 학생 관리
- **출석 관리**: 날짜별 출석 현황 추적
- **기도제목 관리**: 학생별 기도제목 기록
- **메모 관리**: 학생에 대한 메모 저장
- **주간 네비게이션**: 주간 단위로 날짜 선택 및 관리
- **데이터 저장**: JSON 파일로 영구 저장

## 데이터 저장

- **로컬 스토리지**: 브라우저 내 임시 저장
- **서버 파일**: `data.json` 파일로 영구 저장
- 서버가 다운되었을 때도 로컬 스토리지에서 복구 가능

## API

- `GET /api/data` - 데이터 조회
- `POST /api/data` - 데이터 저장
- `GET /api/export` - 데이터 내보내기
- `GET /api/health` - 서버 상태 확인

## 프로젝트 구조

```
src/
├── components/
│   ├── AdminPanel.jsx          # 관리자 메뉴
│   ├── ClassManagement.jsx     # 반 관리
│   ├── ClassSelector.jsx       # 반 선택
│   ├── DataManagement.jsx      # 데이터 관리 (내보내기/가져오기)
│   ├── GradeSelector.jsx       # 학년 선택
│   ├── InputModal.jsx          # 입력 모달
│   ├── PrayerView.jsx          # 기도제목 조회
│   ├── StudentCard.jsx         # 학생 카드
│   ├── StudentList.jsx         # 학생 목록
│   └── StudentManagement.jsx   # 학생 관리
├── styles/                     # CSS 파일
└── utils/
    └── dataManager.js          # 데이터 관리 유틸
server.js                        # Express 백엔드
```

## 주요 기능

### 날짜별 데이터 관리
- 주간 네비게이션으로 원하는 주 선택
- 각 요일별 버튼으로 날짜 선택
- 선택된 날짜의 데이터만 표시

### 학생 관리
- 출석 상태 토글
- 기도제목 추가
- 메모 작성

### 관리 기능
- 전체 기도제목 조회
- 반 관리 (추가/삭제/수정)
- 학생 관리 (추가/삭제)
- 데이터 내보내기/가져오기

