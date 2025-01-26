const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'inventory.db'), (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
    return;
  }
  console.log('데이터베이스 연결됨');
});

db.all(`SELECT * FROM completed_inspections`, [], (err, rows) => {
  if (err) {
    console.error('데이터 조회 오류:', err);
    return;
  }
  console.log('=== 완료된 점검 데이터 ===');
  console.log(JSON.stringify(rows, null, 2));
  db.close();
}); 