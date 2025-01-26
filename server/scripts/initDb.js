const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 데이터베이스 디렉토리 확인 (database 폴더는 스키마 파일을 위해 필요)
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 데이터베이스 연결 (경로 수정)
const db = new sqlite3.Database(path.join(__dirname, '..', 'inventory.db'));

// 스키마 파일 읽기
const schema = fs.readFileSync(path.join(dbDir, 'migrations/schema.sql'), 'utf8');

// 스키마 적용
db.exec(schema, (err) => {
  if (err) {
    console.error('Error creating schema:', err);
  } else {
    console.log('Database schema created successfully');
  }
  db.close();
}); 