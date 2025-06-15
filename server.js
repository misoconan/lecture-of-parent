const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 보안 미들웨어
app.use(helmet());
app.use(cors({
    origin: ['http://localhost', 'http://127.0.0.1', 'http://localhost:80', 'http://127.0.0.1:80', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15분
    max: process.env.RATE_LIMIT_REQUESTS || 100, // 요청 제한
    message: {
        error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
});
app.use('/api/', limiter);

// 회원가입 전용 더 엄격한 제한
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 5, // 15분당 5회까지만 회원가입 시도 가능
    message: {
        error: '회원가입 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
    }
});

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 제거 (아파치에서 처리)
// app.use(express.static('.'));

// MariaDB 데이터베이스 설정
let db;

// 데이터베이스 연결 함수
async function connectDB() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ai_parent_education',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ MariaDB 데이터베이스 연결 성공');
        await initializeDatabase();
    } catch (error) {
        console.error('❌ MariaDB 연결 실패:', error.message);
        throw error;
    }
}

// 데이터베이스 및 테이블 초기화
async function initializeDatabase() {
    try {
        // 회원 테이블 생성
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                child_grade VARCHAR(20),
                agree_marketing BOOLEAN DEFAULT FALSE,
                email_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await db.execute(createUsersTable);
        console.log('✅ users 테이블 생성/확인 완료');
        
        // 사용자 로그 테이블 생성
        const createLogTable = `
            CREATE TABLE IF NOT EXISTS user_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        
        await db.execute(createLogTable);
        console.log('✅ user_logs 테이블 생성/확인 완료');
        
    } catch (error) {
        console.error('❌ 테이블 생성 실패:', error.message);
        throw error;
    }
}

// 입력 검증 함수들
function validateSignupData(data) {
    const errors = {};
    
    // 이름 검증
    if (!data.name || data.name.trim().length < 2 || data.name.trim().length > 20) {
        errors.name = '이름은 2-20자 사이여야 합니다.';
    } else if (!/^[가-힣a-zA-Z\s]+$/.test(data.name.trim())) {
        errors.name = '이름은 한글 또는 영문만 입력 가능합니다.';
    }
    
    // 이메일 검증
    if (!data.email || !validator.isEmail(data.email)) {
        errors.email = '올바른 이메일 주소를 입력해주세요.';
    }
    
    // 비밀번호 검증
    if (!data.password || data.password.length < 8) {
        errors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(data.password)) {
        errors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.';
    }
    
    // 연락처 검증 (선택사항)
    if (data.phone && !/^010-\d{4}-\d{4}$/.test(data.phone)) {
        errors.phone = '연락처 형식이 올바르지 않습니다. (010-1234-5678)';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// 로그 기록 함수
async function logUserAction(userId, action, req) {
    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        
        await db.execute(
            'INSERT INTO user_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [userId, action, ip, userAgent]
        );
    } catch (error) {
        console.error('로그 기록 실패:', error.message);
    }
}

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '로그인이 필요합니다.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }
        req.user = user;
        next();
    });
}

// 관리자 권한 체크 미들웨어
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.'
        });
    }
    next();
}

// API 라우트들

// 로그인 API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 입력 데이터 검증
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: '올바른 이메일 주소를 입력해주세요.',
                field: 'email'
            });
        }
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: '비밀번호를 입력해주세요.',
                field: 'password'
            });
        }
        
        // 사용자 조회
        const [users] = await db.execute(
            'SELECT id, name, email, password, role FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                field: 'email'
            });
        }
        
        const user = users[0];
        
        // 비밀번호 확인
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                field: 'password'
            });
        }
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // 로그인 로그 기록
        await logUserAction(user.id, 'login', req);
        
        console.log(`✅ 로그인 성공: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
        
        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
        
    } catch (error) {
        console.error('로그인 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

// 회원가입 API
app.post('/api/signup', signupLimiter, async (req, res) => {
    try {
        const { name, email, password, phone, childGrade, agreeMarketing } = req.body;
        
        // 입력 데이터 검증
        const validation = validateSignupData(req.body);
        if (!validation.isValid) {
            const firstError = Object.keys(validation.errors)[0];
            return res.status(400).json({
                success: false,
                message: validation.errors[firstError],
                field: firstError
            });
        }
        
        // 이메일 중복 검사
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );
        
        const existingUser = existingUsers[0];
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: '이미 가입된 이메일입니다.',
                field: 'email'
            });
        }
        
        // 비밀번호 해싱
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 사용자 정보 저장
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, phone, child_grade, agree_marketing) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                email.toLowerCase().trim(),
                hashedPassword,
                phone || null,
                childGrade || null,
                agreeMarketing ? 1 : 0
            ]
        );
        
        const userId = result.insertId;
        
        // 회원가입 로그 기록
        await logUserAction(userId, 'signup', req);
        
        console.log(`✅ 새 회원 가입: ${email} (ID: ${userId})`);
        
        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                id: userId,
                name: name.trim(),
                email: email.toLowerCase().trim()
            }
        });
        
    } catch (error) {
        console.error('회원가입 처리 오류:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: '이미 가입된 이메일입니다.',
                field: 'email'
            });
        }
        
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

// 이메일 중복 검사 API
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: '올바른 이메일 주소를 입력해주세요.'
            });
        }
        
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );
        
        res.json({
            success: true,
            available: existingUsers.length === 0
        });
        
    } catch (error) {
        console.error('이메일 중복 검사 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 헬스 체크 API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'disconnected',
        dbType: 'MariaDB'
    });
});

// 회원 통계 API (관리자용)
app.get('/api/stats', (req, res) => {
    try {
        // 전체 회원 수
        db.get('SELECT COUNT(*) as total FROM users', (err, totalResult) => {
            if (err) {
                console.error('통계 조회 오류:', err);
                return res.status(500).json({
                    success: false,
                    message: '통계 조회 중 오류가 발생했습니다.'
                });
            }
            
            // 오늘 가입자 수
            db.get("SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = DATE('now')", (err, todayResult) => {
                if (err) {
                    console.error('오늘 가입자 조회 오류:', err);
                    return res.status(500).json({
                        success: false,
                        message: '통계 조회 중 오류가 발생했습니다.'
                    });
                }
                
                // 주간 가입자 수
                db.get("SELECT COUNT(*) as weekly FROM users WHERE created_at >= DATE('now', '-7 days')", (err, weeklyResult) => {
                    if (err) {
                        console.error('주간 가입자 조회 오류:', err);
                        return res.status(500).json({
                            success: false,
                            message: '통계 조회 중 오류가 발생했습니다.'
                        });
                    }
                    
                    res.json({
                        success: true,
                        data: {
                            totalUsers: totalResult.total,
                            todaySignups: todayResult.today,
                            weeklySignups: weeklyResult.weekly
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회 중 오류가 발생했습니다.'
        });
    }
});

// 회원 목록 API (개발/테스트용)
app.get('/api/users', (req, res) => {
    db.all(
        'SELECT id, name, email, phone, child_grade, created_at FROM users ORDER BY created_at DESC LIMIT 10',
        (err, rows) => {
            if (err) {
                console.error('회원 목록 조회 오류:', err);
                return res.status(500).json({
                    success: false,
                    message: '회원 목록 조회 중 오류가 발생했습니다.'
                });
            }
            
            res.json({
                success: true,
                data: rows
            });
        }
    );
});

// 사용자 프로필 조회 API (로그인 필요)
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, child_grade, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: users[0]
        });
        
    } catch (error) {
        console.error('프로필 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '프로필 조회 중 오류가 발생했습니다.'
        });
    }
});

// 관리자 전용 - 모든 사용자 목록 조회
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, child_grade, role, created_at FROM users ORDER BY created_at DESC'
        );
        
        res.json({
            success: true,
            data: users
        });
        
    } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 목록 조회 중 오류가 발생했습니다.'
        });
    }
});

// 관리자 전용 - 사용자 권한 변경
app.patch('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 권한입니다.'
            });
        }
        
        await db.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );
        
        res.json({
            success: true,
            message: '사용자 권한이 변경되었습니다.'
        });
        
    } catch (error) {
        console.error('권한 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '권한 변경 중 오류가 발생했습니다.'
        });
    }
});

// 로그아웃 API (토큰 무효화를 위한 클라이언트 측 처리)
app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        // 로그아웃 로그 기록
        await logUserAction(req.user.id, 'logout', req);
        
        res.json({
            success: true,
            message: '로그아웃되었습니다.'
        });
        
    } catch (error) {
        console.error('로그아웃 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '로그아웃 처리 중 오류가 발생했습니다.'
        });
    }
});

// 404 핸들러 (API 전용)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API 엔드포인트를 찾을 수 없습니다.'
    });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
    console.error('서버 에러:', error);
    
    if (res.headersSent) {
        return next(error);
    }
    
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
    });
});

// 서버 시작
async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
🚀 AI 부모 교육 사이트 서버가 시작되었습니다!
📍 포트: ${PORT}
🌐 URL: http://localhost:${PORT}
💾 데이터베이스: MariaDB
📅 시작 시간: ${new Date().toLocaleString('ko-KR')}
            `);
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
}

// 우아한 종료 처리
process.on('SIGTERM', async () => {
    console.log('\n⏹️  서버 종료 신호를 받았습니다. 우아하게 종료 중...');
    if (db) {
        try {
            await db.end();
            console.log('✅ 데이터베이스 연결이 정상적으로 종료되었습니다.');
        } catch (error) {
            console.error('❌ 데이터베이스 종료 중 오류:', error.message);
        }
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n⏹️  Ctrl+C를 눌러 서버를 종료합니다...');
    if (db) {
        try {
            await db.end();
            console.log('✅ 데이터베이스 연결이 정상적으로 종료되었습니다.');
        } catch (error) {
            console.error('❌ 데이터베이스 종료 중 오류:', error.message);
        }
    }
    process.exit(0);
});

// 서버 시작
startServer();