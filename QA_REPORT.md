# QA Report

검수 일자: 2026-10-01

- 6개 HTML 페이지 존재 확인: index / menu / story / space / reservation / visit
- 모든 로컬 CSS/JS/favicon 상대경로 존재 확인
- JavaScript 3개 파일 `node --check` 문법 검사 통과
- Navigation / Mobile Menu / Season Tabs / Accordion / Fake Location Notice / Reservation 4-step 로직 구현
- 예약 필수 단계 검증 및 이름·전화번호·이메일 inline validation 구현
- `prefers-reduced-motion` 대응 구현
- iPhone safe-area 하단 여백 대응 구현
- 390/393/430px 모바일 대응 미디어쿼리 포함
- `100vw` 기반 레이아웃 미사용 및 전역 `box-sizing:border-box` 적용
- 이미지 `max-width:100%`, 콘텐츠 `max-width` 적용
- 실제 예약 서버 전송 없음 / 완료 화면에 포트폴리오 데모 명시

참고: 현재 빌드의 사진은 Pexels 정적 CDN에서 로드되는 실제 스톡 사진입니다. 실행 환경에서 인터넷 연결이 필요합니다.
