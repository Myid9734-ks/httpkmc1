const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let db = null;

// 데이터베이스 초기화 함수
async function initializeDatabase() {
  try {
    if (db) return db;
    
    console.log('데이터베이스 연결 시작...');
    db = await open({
      filename: path.join(__dirname, 'inventory.db'),
      driver: sqlite3.Database
    });
    console.log('데이터베이스 연결 성공');
    
    // 외래키 활성화
    await db.run('PRAGMA foreign_keys = ON');
    console.log('외래키 활성화 완료');
    
    // 스키마 파일 읽기 및 실행
    const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
    console.log('스키마 파일 경로:', schemaPath);
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('스키마 파일 읽기 완료');
    
    // 스키마 적용
    console.log('스키마 적용 시작...');
    await db.exec(schema);
    console.log('스키마 적용 완료');
    
    // 테이블 확인
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('생성된 테이블 목록:', tables.map(t => t.name));
    
    return db;
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  getDb: () => db
}; 