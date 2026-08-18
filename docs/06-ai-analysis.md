# AI 채용 공고 분석 설계

## 1. 목적

AI의 목적은 공고 등록 시간을 줄이는 것이다. 분석 결과는 초안이며, 사용자가 검토하기 전에는 공고의 확정 데이터가 아니다.

## 2. 처리 흐름

```text
URL 제출
→ URL 정규화·중복 검사
→ SSRF 방어
→ robots/약관 및 접근 정책 확인
→ HTML 수집 또는 렌더링
→ 본문·메타데이터 정제
→ 구조화 추출
→ 스키마·날짜 검증
→ 필드별 근거와 경고 생성
→ 사용자 검토·수정
→ 공고 저장
```

## 3. 출력 스키마

```json
{
  "company": { "value": "토스", "confidence": "high", "evidence": "..." },
  "position": { "value": "Server Developer", "confidence": "high", "evidence": "..." },
  "deadline": {
    "type": "FIXED",
    "value": "2026-08-25T23:59:00+09:00",
    "timezoneAssumption": "Asia/Seoul",
    "confidence": "medium",
    "evidence": "..."
  },
  "documents": [
    { "type": "RESUME", "title": "이력서", "required": true, "evidence": "..." }
  ],
  "essayQuestions": ["지원 동기를 작성해주세요."],
  "assessment": { "assignment": false, "codingTest": true },
  "applicationMethod": { "type": "EXTERNAL_URL", "value": "https://..." },
  "warnings": []
}
```

## 4. 추출 규칙

- 원문에 없는 값은 추측하지 않고 null 또는 UNKNOWN으로 둔다.
- 날짜와 시간은 원문 표현, 해석한 값, 시간대 가정을 분리한다.
- `채용 시 마감`은 ALWAYS_OPEN으로 분류한다.
- 날짜만 있으면 임의로 확정하지 않고 UI에서 23:59 가정을 확인받는다.
- 우대사항을 필수 제출물로 분류하지 않는다.
- 자소서 예시나 FAQ 문장을 실제 문항으로 오인하지 않도록 섹션 근거를 사용한다.
- 모든 핵심 필드는 짧은 원문 근거 또는 DOM 위치를 제공한다.

## 5. 수집 전략

1. Open Graph, JSON-LD의 JobPosting 데이터 우선
2. 서버 렌더링 HTML 본문 추출
3. 허용된 사이트에서만 브라우저 렌더링 fallback
4. 접근 불가·로그인 필요·차단 시 수동 입력 전환

사이트별 전용 파서는 사용량과 실패율이 높은 도메인부터 추가한다. 원문 전체를 장기 저장하는 경우 서비스 약관과 개인정보·저작권 정책을 검토하고 보존 기간을 최소화한다.

## 6. 보안

- DNS 확인 전후 모두 사설, 루프백, 링크로컬, 메타데이터 IP를 차단한다.
- 리디렉션 횟수와 응답 크기, 다운로드 시간을 제한한다.
- HTML 안의 지시문은 데이터로만 취급하여 prompt injection을 방어한다.
- AI가 URL 호출, 도구 실행 또는 저장 결정을 직접 하지 않게 한다.
- 스키마 validator를 통과한 출력만 클라이언트에 제공한다.
- 로그에서 토큰, 세션, URL query의 민감값을 제거한다.

## 7. 실패 코드

- INVALID_URL
- BLOCKED_DESTINATION
- PAGE_NOT_FOUND
- LOGIN_REQUIRED
- FETCH_BLOCKED
- CONTENT_EMPTY
- PARSE_FAILED
- MODEL_TIMEOUT
- UNSUPPORTED_LANGUAGE

사용자 메시지는 기술 코드가 아닌 해결 행동을 안내한다.

## 8. 평가 계획

대표 플랫폼, 기업 채용 사이트, 상시 채용, 날짜만 있는 공고, 이미지형 공고, 마감 공고를 포함한 골든 데이터셋을 만든다.

필드별 exact/normalized match와 필수 제출물 precision·recall을 측정한다. 마감일 오류는 다른 필드보다 높은 심각도로 평가하며, 실제 사용자의 수정률과 함께 모니터링한다.

