const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// 데이터베이스 연결
const dbPath = path.join(__dirname, '..', 'inventory.db');
const db = new sqlite3.Database(dbPath);

async function createInitialUser() {
  try {
    // 비밀번호 해시 생성
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 사용자 생성
    db.run(
      'INSERT INTO users (username, password, name, email, factory, department, position, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      ['admin', hashedPassword, '관리자', 'admin@ilkwang.co.kr', '본사', '전산팀', '관리자', 'system_admin', 'active'],
      (err) => {
        if (err) {
          console.error('Error creating initial user:', err);
        } else {
          console.log('Initial admin user created successfully');
          console.log('Admin credentials:');
          console.log('Username: admin');
          console.log('Password: admin123');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createInitialUser(); 