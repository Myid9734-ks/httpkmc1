const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/inventory.db'));

// 간단점검 생성
async function createQuickInspection(data) {
  console.log('간단점검 생성 시도:', data);
  
  return new Promise((resolve, reject) => {
    const { inspection_name, cycle, weekdays } = data;
    const weekdaysJson = JSON.stringify(weekdays);
    
    const sql = `
      INSERT INTO quick_inspections (inspection_name, cycle, weekdays)
      VALUES (?, ?, ?)
    `;
    
    db.run(sql, [inspection_name, cycle, weekdaysJson], function(err) {
      if (err) {
        console.error('간단점검 생성 중 오류:', err);
        reject(err);
        return;
      }
      
      // 생성된 데이터 조회
      db.get(
        'SELECT * FROM quick_inspections WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('생성된 데이터 조회 중 오류:', err);
            reject(err);
            return;
          }
          console.log('간단점검 생성 성공:', row);
          resolve(row);
        }
      );
    });
  });
}

// 간단점검 목록 조회
async function getQuickInspections() {
  return new Promise((resolve, reject) => {
    console.log('간단점검 목록 조회 시도');
    const sql = `SELECT * FROM quick_inspections ORDER BY created_at DESC`;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('간단점검 목록 조회 중 오류:', err);
        reject(err);
        return;
      }
      console.log('간단점검 목록 조회 결과:', rows);
      resolve(rows);
    });
  });
}

// 간단점검 삭제
async function deleteQuickInspection(id) {
  return new Promise((resolve, reject) => {
    console.log('간단점검 삭제 시도:', id);
    const sql = `DELETE FROM quick_inspections WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
      if (err) {
        console.error('간단점검 삭제 중 오류:', err);
        reject(err);
        return;
      }
      console.log('간단점검 삭제 성공:', this.changes);
      resolve({ success: true });
    });
  });
}

module.exports = {
  createQuickInspection,
  getQuickInspections,
  deleteQuickInspection
}; 