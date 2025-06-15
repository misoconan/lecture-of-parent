# AI 부모 교육 사이트 프로젝트

## 프로젝트 개요
중학생 자녀를 둔 학부모를 위한 AI 교육 플랫폼

## 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MariaDB (MySQL2)
- **보안**: bcryptjs, helmet, express-rate-limit

## 주요 기능
- ✅ 반응형 홈페이지 (완료)
- ✅ 회원가입 모달 폼 (완료)
- ✅ 실시간 폼 유효성 검증 (완료)
- ✅ MariaDB 데이터베이스 연동 (완료)
- ✅ 회원 정보 실제 DB 저장 (완료)

## 서버 실행 방법
```bash
npm install        # 의존성 설치
npm run dev       # 개발 모드 실행
npm start         # 프로덕션 모드 실행
```

## 접속 URL
- http://localhost:3000
- http://172.29.207.30:3000
- http://127.0.0.1:3000

## 데이터베이스
- 데이터베이스: `ai_parent_education` (MariaDB)
- 테이블: `users`, `user_logs`

## 환경 변수
데이터베이스 연결을 위한 환경 변수:
- DB_HOST (default: localhost)
- DB_USER (default: root)
- DB_PASSWORD (default: 비어있음)
- DB_NAME (default: ai_parent_education)
- DB_PORT (default: 3306)

## API 엔드포인트
- POST /api/signup - 회원가입
- POST /api/check-email - 이메일 중복 확인
- GET /api/health - 서버 상태 확인
- GET /api/stats - 회원 통계
- GET /api/users - 회원 목록 (개발용)

## 현재 상태
서버가 정상 실행 중이며, 회원가입 기능이 완전히 작동합니다.
SQLite에서 MariaDB로 데이터베이스를 변경하여 보다 산업적인 환경에 적합하도록 개선했습니다.

**주의**: MariaDB 사용을 위해 로컬에 MariaDB 서버가 설치되어 있어야 하며, 위 환경 변수를 설정해야 합니다.

## 다음 단계 계획
- [ ] 로그인 기능
- [ ] 마이페이지
- [ ] 강의 관리 시스템
- [ ] 결제 시스템