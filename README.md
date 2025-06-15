# AI 부모 교육 사이트

중학생 자녀를 둔 학부모를 위한 AI 교육 플랫폼입니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일에서 데이터베이스 정보를 수정하세요:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_parent_education
```

### 3. MySQL 데이터베이스 준비
MySQL 서버가 실행 중인지 확인하고, 데이터베이스는 자동으로 생성됩니다.

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

### 5. 웹사이트 접속
브라우저에서 `http://localhost:3000` 으로 접속하세요.

## 📋 주요 기능

- ✅ 반응형 홈페이지 디자인
- ✅ 회원가입 모달 폼
- ✅ 실시간 폼 유효성 검증
- ✅ MySQL 데이터베이스 연동
- ✅ 비밀번호 암호화 (bcrypt)
- ✅ 보안 미들웨어 (helmet, rate limiting)
- ✅ 이메일 중복 검사
- ✅ 사용자 활동 로깅

## 🗄️ 데이터베이스 구조

### users 테이블
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(50), NOT NULL)
- email (VARCHAR(100), NOT NULL, UNIQUE)
- password (VARCHAR(255), NOT NULL)
- phone (VARCHAR(20))
- child_grade (VARCHAR(20))
- agree_marketing (BOOLEAN)
- email_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### user_logs 테이블
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- action (VARCHAR(100))
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- created_at (TIMESTAMP)

## 🔧 API 엔드포인트

### POST /api/signup
회원가입 처리
```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password123!",
  "phone": "010-1234-5678",
  "childGrade": "중1",
  "agreeMarketing": true
}
```

### POST /api/check-email
이메일 중복 검사
```json
{
  "email": "user@example.com"
}
```

### GET /api/health
서버 상태 확인

### GET /api/stats
회원 통계 (관리자용)

## 🔒 보안 기능

- Helmet을 통한 HTTP 헤더 보안
- bcrypt를 통한 비밀번호 해싱
- Rate limiting (회원가입: 15분당 5회)
- 입력 데이터 유효성 검증
- SQL Injection 방지 (Prepared Statements)
- XSS 방지

## 📱 프론트엔드 기능

- 반응형 디자인 (PC/태블릿/모바일)
- 동적 애니메이션
- 실시간 폼 검증
- 모달 인터페이스
- 드롭다운 네비게이션
- 후기 슬라이더

## 🛠️ 기술 스택

### Backend
- Node.js
- Express.js
- MySQL
- bcryptjs
- helmet
- cors
- express-rate-limit

### Frontend
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript
- Font Awesome Icons
- Google Fonts (Noto Sans KR)

## 📦 프로젝트 구조

```
📁 ai-parent-education-site/
├── 📄 index.html          # 메인 홈페이지
├── 📄 style.css           # 스타일시트
├── 📄 script.js           # 클라이언트 JavaScript
├── 📄 server.js           # Node.js 서버
├── 📄 package.json        # 의존성 관리
├── 📄 .env               # 환경 변수
├── 📄 README.md          # 프로젝트 문서
└── 📄 회원가입.png       # 회원가입 버튼 이미지
```

## 🚧 향후 개발 계획

- [ ] 로그인 기능
- [ ] 마이페이지
- [ ] 강의 관리 시스템
- [ ] 결제 시스템 연동
- [ ] 이메일 인증
- [ ] 소셜 로그인
- [ ] 관리자 대시보드

## 📞 지원

문의사항이 있으시면 이메일로 연락주세요.