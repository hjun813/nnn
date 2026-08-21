# 수동 등록 MVP 출시 체크리스트

## 확정 범위

- 이메일 회원가입·로그인
- 공고 수동 등록·조회·수정·삭제·보관·복원
- 제출 작업 추가·삭제와 상태 관리
- Saved/In Progress/Applied/Expired/Archived
- 목표일·실제 마감·Dashboard 다음 행동
- D-7/D-3/D-1 인앱 알림
- Swagger/OpenAPI와 health endpoint

AI URL 분석은 MVP 이후 별도 모듈로 추가한다. `CreateJobInput`을 최종 저장 계약으로 유지하여 향후 분석 결과도 같은 검증·저장 경로를 사용한다.

## 출시 전 필수 확인

- [ ] Docker Compose 이미지 빌드와 전체 서비스 기동
- [ ] migration 컨테이너 성공 후 앱 기동
- [ ] `/api/health` 200 응답
- [ ] Playwright 수동 등록 E2E 통과
- [ ] 다른 사용자 공고 API 접근 시 404
- [ ] 실제 마감 이후 Expired 작업 확인
- [ ] 알림 작업 중복 실행 확인
- [ ] 운영 secret 교체
- [ ] PostgreSQL 백업과 복원 시험
- [ ] 개인정보처리방침·이용약관 게시
- [x] 회원가입·로그인 rate limit 적용
- [x] 계정과 연결 데이터 삭제 API·UI 제공

## 배포 후 관찰

- API 5xx 비율과 p95 응답 시간
- DB health와 migration 실패
- 가입 → 첫 공고 등록 전환율
- Saved → Applied 전환율
- 만료 및 알림 작업 마지막 성공 시각
- 사용자 피드백 중 등록 불편과 다음 행동 정확도
