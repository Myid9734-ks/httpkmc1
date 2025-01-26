const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initializeDatabase, getDb } = require('../database/connection');

// 로그 레벨 상수
const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info'
};

// 로그 유틸리티 함수
const log = (level, message, data = {}) => {
  // 민감한 정보 마스킹
  if (data.password) {
    data.password = '********';
  }
  
  // 프로덕션 환경에서는 info 레벨 로그 제외
  if (process.env.NODE_ENV === 'production' && level === LOG_LEVEL.INFO) {
    return;
  }

  console.log(`[${level.toUpperCase()}] ${message}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

// 로그인 라우트
router.post('/login', async (req, res) => {
  try {
    const body = req.body;

    // body 유효성 검사
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ 
        message: '잘못된 요청 형식입니다. 객체 형태의 데이터가 필요합니다.' 
      });
    }

    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: '아이디와 비밀번호를 모두 입력해주세요.' 
      });
    }

    const db = await initializeDatabase();
    const user = await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      log(LOG_LEVEL.WARN, '로그인 실패: 사용자 없음', { username });
      return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    if (user.status === 'inactive') {
      log(LOG_LEVEL.WARN, '로그인 실패: 비활성화된 계정', { username });
      return res.status(403).json({ message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
    }

    if (user.status === 'pending') {
      log(LOG_LEVEL.WARN, '로그인 실패: 승인 대기중', { username });
      return res.status(403).json({ message: '승인 대기중인 계정입니다. 관리자의 승인을 기다려주세요.' });
    }

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      log(LOG_LEVEL.WARN, '로그인 실패: 비밀번호 불일치', { username });
      return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 마지막 로그인 시간 업데이트
    await db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    log(LOG_LEVEL.INFO, '로그인 성공', {
      username: user.username,
      role: user.role
    });

    // 응답
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        factory: user.factory,
        department: user.department,
        position: user.position,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
  } catch (error) {
    log(LOG_LEVEL.ERROR, '로그인 오류', { error: error.message });
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 토큰 검증 미들웨어
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    log(LOG_LEVEL.WARN, '인증 실패: 토큰 없음');
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    log(LOG_LEVEL.INFO, '토큰 검증 성공', {
      username: decoded.username,
      userId: decoded.id,
      role: decoded.role
    });
    next();
  } catch (error) {
    log(LOG_LEVEL.ERROR, '토큰 검증 실패', { error: error.message });
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 사용자 정보 조회 라우트
router.get('/me', verifyToken, async (req, res) => {
  log(LOG_LEVEL.INFO, '사용자 정보 요청', {
    userId: req.user.id,
    username: req.user.username
  });

  try {
    const db = await initializeDatabase();
    
    const user = await db.get(
      'SELECT id, username, name, email, factory, department, position, role, status, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      log(LOG_LEVEL.WARN, '사용자 정보 조회 실패: 사용자 없음', { userId: req.user.id });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    log(LOG_LEVEL.INFO, '사용자 정보 조회 성공', { username: user.username });

    res.json({ user });
  } catch (error) {
    log(LOG_LEVEL.ERROR, '데이터베이스 오류', { error: error.message });
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 프로필 업데이트
router.put('/profile', verifyToken, async (req, res) => {
  const { name, email, factory, department, position, currentPassword, newPassword } = req.body;

  console.log('[프로필 업데이트 요청]', {
    userId: req.user.id,
    hasCurrentPassword: !!currentPassword,
    hasNewPassword: !!newPassword,
    requestBody: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    const db = await initializeDatabase();
    let updateFields = [];
    let params = [];

    // 기본 정보 업데이트
    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      params.push(email);
    }
    if (factory) {
      updateFields.push('factory = ?');
      params.push(factory);
    }
    if (department) {
      updateFields.push('department = ?');
      params.push(department);
    }
    if (position) {
      updateFields.push('position = ?');
      params.push(position);
    }

    // 비밀번호 변경 처리
    if (currentPassword && newPassword) {
      console.log('[비밀번호 변경 시도]', {
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });

      const user = await db.get('SELECT password FROM users WHERE id = ?', [req.user.id]);
      const validPassword = await bcrypt.compare(currentPassword, user.password);

      if (!validPassword) {
        console.log('[프로필 업데이트 실패] 현재 비밀번호 불일치', {
          userId: req.user.id,
          timestamp: new Date().toISOString()
        });
        return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '업데이트할 정보가 없습니다.' });
    }

    params.push(req.user.id);
    await db.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    const updatedUser = await db.get(
      'SELECT id, username, name, email, factory, department, position, role, status, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    console.log('[프로필 업데이트 성공]', {
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('[프로필 업데이트 오류]', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원가입 라우트
router.post('/register', async (req, res) => {
  console.log('[회원가입 요청]', {
    username: req.body.username,
    timestamp: new Date().toISOString()
  });

  const { username, password, name, email, factory, department, position } = req.body;

  try {
    const db = await initializeDatabase();
    
    // 필수 필드 검증
    if (!username || !password || !name || !email || !factory || !department || !position) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '유효한 이메일 주소를 입력해주세요.' });
    }

    // 사용자 ID 중복 검사
    const existingUser = await db.get('SELECT username FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 사용자 ID입니다.' });
    }

    // 이메일 중복 검사
    const existingEmail = await db.get('SELECT email FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await db.run(
      `INSERT INTO users (username, password, name, email, factory, department, position, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 'pending')`,
      [username, hashedPassword, name, email, factory, department, position]
    );

    console.log('[회원가입 성공]', {
      username,
      email,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ 
      message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.' 
    });

  } catch (error) {
    console.error('[회원가입 오류]', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 권한 확인 미들웨어
const verifySystemAdmin = (req, res, next) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({ message: '시스템 관리자만 접근할 수 있습니다.' });
  }
  next();
};

// 전체 사용자 목록 조회 (시스템 관리자 전용)
router.get('/users', verifyToken, verifySystemAdmin, async (req, res) => {
  console.log('[사용자 목록 조회]', {
    adminId: req.user.id,
    timestamp: new Date().toISOString()
  });

  try {
    const db = await initializeDatabase();
    
    const users = await db.all(
      `SELECT id, username, name, factory, department, position, role, status, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({ users });
  } catch (error) {
    console.error('[데이터베이스 오류]', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 상태 변경 (시스템 관리자 전용)
router.put('/users/:id/status', verifyToken, verifySystemAdmin, async (req, res) => {
  const { status } = req.body;
  const userId = req.params.id;

  // 상태값 검증
  if (!['pending', 'active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: '잘못된 상태값입니다.' });
  }

  try {
    const db = await initializeDatabase();
    
    await db.run(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    res.json({ message: '사용자 상태가 변경되었습니다.' });
  } catch (error) {
    console.error('[데이터베이스 오류]', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 역할 변경 (시스템 관리자 전용)
router.put('/users/:id/role', verifyToken, verifySystemAdmin, async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  // 역할값 검증
  if (!['user', 'admin', 'system_admin'].includes(role)) {
    return res.status(400).json({ message: '잘못된 역할입니다.' });
  }

  try {
    const db = await initializeDatabase();
    
    await db.run(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    res.json({ message: '사용자 역할이 변경되었습니다.' });
  } catch (error) {
    console.error('[데이터베이스 오류]', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 현재 진행중인 보전 작업 조회
router.get('/maintenances', verifyToken, async (req, res) => {
  const { status } = req.query;
  
  try {
    const db = await initializeDatabase();
    
    let query = `
      SELECT m.id, e.name as equipmentName, m.title, 
             strftime('%Y-%m-%dT%H:%M:%S.000Z', m.start_time) as startTime, 
             strftime('%Y-%m-%dT%H:%M:%S.000Z', m.expected_end_time) as expectedEndTime, 
             m.worker
      FROM maintenances m
      JOIN equipments e ON m.equipment_id = e.id
      WHERE m.status = ?
      AND m.start_time <= CURRENT_TIMESTAMP
      AND (m.end_time IS NULL OR m.end_time > CURRENT_TIMESTAMP)
      ORDER BY m.start_time DESC
    `;
    
    const maintenances = await db.all(query, [status]);
    
    res.json(maintenances);
  } catch (error) {
    console.error('[보전 작업 조회 오류]', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 