const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/inventory.db');

// 완료된 인수인계 데이터 조회
db.all(`
  SELECT 
    date,
    factory,
    department,
    shift,
    writer,
    line_name,
    handover_content,
    remarks,
    general_remarks,
    status,
    created_at,
    updated_at
  FROM daily_handovers 
  WHERE status = 'completed'
  ORDER BY date DESC, created_at DESC
  LIMIT 10
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('=== 완료된 인수인계 데이터 ===');
  rows.forEach(row => {
    console.log('\n-------------------');
    console.log('날짜:', row.date);
    console.log('공장:', row.factory);
    console.log('부서:', row.department);
    console.log('교대조:', row.shift);
    console.log('작성자:', row.writer);
    console.log('라인명:', row.line_name);
    console.log('인수인계 내용:', row.handover_content);
    console.log('비고:', row.remarks);
    console.log('전체 전달사항:', row.general_remarks);
    console.log('작성일:', row.created_at);
    console.log('수정일:', row.updated_at);
  });
  
  db.close();
}); 