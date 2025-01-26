const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/database.sqlite', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
    return;
  }
  console.log('데이터베이스 연결됨');
});

db.all(`
  SELECT sql FROM sqlite_master 
  WHERE type='table' AND name='daily_handovers'
`, [], (err, rows) => {
  if (err) {
    console.error('스키마 조회 오류:', err);
    return;
  }
  console.log('daily_handovers 테이블 스키마:');
  console.log(rows[0].sql);
  db.close();
}); 