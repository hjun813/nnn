# 개발 계획서

## 1. 개발 전략

수동 등록 기반의 완결된 지원 관리 기능을 먼저 만들고 AI 분석을 별도 단계로 붙인다. 초기에는 모듈형 단일 애플리케이션으로 시작하며, 분석 작업만 비동기 경계를 유지한다.

권장 기준 스택:

- TypeScript, Next.js
- PostgreSQL
- Prisma 또는 Drizzle
- Auth.js 또는 관리형 인증
- Tailwind CSS 기반 UI
- 구조화 출력 지원 AI API
- 예약 작업 또는 queue

스택은 구현 시작 시 팀 경험, 배포 환경, 비용을 기준으로 ADR에서 최종 확정한다.

## 2. 마일스톤

2주 스프린트 기준 약 8주 계획이며 1~2인 팀을 가정한다.

### Sprint 0 — 기반과 설계

- 저장소, 린트, 포맷, 테스트, CI
- 환경 변수와 secret 정책
- DB 스키마·migration
- 인증 PoC
- UI 토큰과 핵심 컴포넌트
- 이벤트 명세 확정

완료 조건: 배포 환경에서 로그인 후 빈 Dashboard 확인.

### Sprint 1 — 수동 공고 관리

- 공고 CRUD
- 날짜·상시·미정 처리
- 중복 URL 경고
- 작업 CRUD와 상태 변경
- 공고 상세
- 소유권 테스트

완료 조건: 사용자별로 공고와 작업을 완전히 관리.

### Sprint 2 — 행동 중심 Dashboard

- 다음 행동 알고리즘
- D-Day 및 이번 주 계산
- 상태 전환과 이력
- Expired/Archived
- 반응형 Applications와 필터
- 핵심 이벤트

완료 조건: 수동 등록만으로 Find 이후 Apply까지 전 과정 수행.

### Sprint 3 — AI 등록

- URL·SSRF 검증
- 페이지 수집기
- 구조화 추출과 validator
- 분석 상태 API
- 결과 확인·수정 화면
- 실패 fallback
- 골든 데이터셋 평가

완료 조건: 지원 도메인의 목표 성공률 충족, 실패해도 수동 저장 가능.

### Sprint 4 — 알림과 출시 준비

- D-7/D-3/D-1 인앱 알림
- cron 멱등성
- 접근성·성능·보안 점검
- 오류 추적과 대시보드
- 데이터 삭제 흐름
- 베타 피드백 및 결함 수정

완료 조건: 출시 체크리스트와 P0 테스트 통과.

## 3. 작업 분해 구조

### Frontend

- 인증 화면
- Today / Applications / Add / Detail / Settings
- 공통 날짜·상태·진행률 컴포넌트
- optimistic update와 오류 복구
- 접근성 및 모바일 대응

### Backend

- 인증·인가 middleware
- 공고·작업·상태 API
- Dashboard query/service
- 만료·알림 scheduler
- 분석 orchestration
- audit와 analytics events

### Data

- schema와 migration
- seed와 factory
- 인덱스 및 query 측정
- 백업·복구 절차

### Quality

- 단위·통합·E2E 테스트
- AI 평가 데이터셋
- 보안 테스트
- 배포 smoke test

## 4. 우선순위 백로그

### P0

- 인증과 소유권
- 공고·작업 CRUD
- 날짜·상시·미정
- 상태와 진행률
- Today와 Applications
- 만료·보관
- 기본 관측성

### P1

- AI 분석 전체 흐름
- 인앱 알림
- 상태 자동 제안
- 분석 품질 대시보드

### P2

- 외부 알림
- 파일과 자기소개서 답변
- 후속 전형과 통계
- 캘린더·확장 프로그램

## 5. Definition of Done

- 인수 조건과 오류 상태를 구현했다.
- 단위 또는 통합 테스트가 있다.
- 인증·인가와 입력 검증을 확인했다.
- 모바일과 키보드 사용을 점검했다.
- 로그에 민감 정보가 없다.
- 문서와 migration을 갱신했다.
- CI를 통과하고 staging에서 smoke test했다.

## 6. 주요 의존성과 의사결정

- 인증 공급자 및 계정 삭제 기능
- AI 모델과 비용 한도
- 동적 페이지 렌더링 방식
- 예약 작업 제공 환경
- 원문 저장 여부와 보존 기간
- 초기 지원 대상 플랫폼

결정은 [의사결정 기록](09-decisions.md)에 남긴다.

## 7. 출시 후 첫 4주

- 10~30명의 목표 사용자로 비공개 베타
- 등록 실패와 이탈 세션 우선 분석
- 주 1회 Saved → Applied 퍼널 검토
- AI 필드 수정률이 높은 유형 개선
- 사용 빈도가 낮은 기능보다 등록 속도와 Today 정확도를 우선 개선

