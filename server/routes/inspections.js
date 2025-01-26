const express = require('express');
const router = express.Router();
const { initializeDatabase, getDb } = require('../database/connection');

// 모든 점검항목 조회
router.get('/', async (req, res) => {
  console.log('GET /api/inspections 요청 받음');
  try {
    const db = await initializeDatabase();
    const inspections = await db.all(`
      SELECT * FROM inspections 
      ORDER BY CAST(REPLACE(code, 'INS', '') AS INTEGER) ASC
    `);
    console.log(`점검 데이터 ${inspections.length}개 조회 완료`);

    // 각 점검항목의 체크리스트 조회
    for (let inspection of inspections) {
      const checklists = await db.all(`
        SELECT * FROM inspection_checklists 
        WHERE inspection_id = ?
        ORDER BY created_at ASC
      `, [inspection.id]);
      
      inspection.checklist = checklists;
      console.log(`- 점검항목 ${inspection.id}의 체크리스트 수: ${checklists.length}`);
    }

    res.json({ data: inspections || [] });
  } catch (error) {
    console.error('점검 데이터 조회 실패:', error);
    res.status(500).json({ error: '점검 데이터 조회 실패' });
  }
});

// 새 점검코드 생성
async function generateInspectionCode(db) {
  const lastInspection = await db.get(`
    SELECT code FROM inspections 
    ORDER BY CAST(REPLACE(code, 'INS', '') AS INTEGER) DESC 
    LIMIT 1
  `);

  if (!lastInspection) return 'INS001';

  const lastNumber = parseInt(lastInspection.code.replace('INS', ''));
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  return `INS${newNumber}`;
}

// 날짜 포맷팅 유틸리티 함수 추가
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 랜덤 평일 생성 함수 추가
function generateRandomWeekday() {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);  // 현재 연도 1월 1일
  const endDate = new Date(currentYear, 11, 31);  // 현재 연도 12월 31일
  
  let randomDate;
  do {
    // 시작일과 종료일 사이의 랜덤한 날짜 생성
    randomDate = new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );
  } while (randomDate.getDay() === 0 || randomDate.getDay() === 6); // 주말 제외
  
  return formatDate(randomDate);
}

// 새 점검항목 추가
router.post('/', async (req, res) => {
  const { name, standard, cycle, priority, status = 'active', checklist = [] } = req.body;
  console.log('[POST] /api/inspections - 새 점검항목 추가 요청', { name });

  let db;
  try {
    db = await initializeDatabase();
    
    // 새 점검코드 생성
    const code = await generateInspectionCode(db);
    console.log('- 생성된 점검코드:', code);

    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');

    // 1. 점검항목 추가
    const result = await db.run(`
      INSERT INTO inspections (code, name, standard, cycle, priority, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [code, name, standard, cycle, priority, status]);
    console.log(`- 점검항목 추가 성공: ID ${result.lastID}`);

    // 2. 체크리스트 항목 추가
    if (checklist.length > 0) {
      for (const item of checklist) {
        await db.run(`
          INSERT INTO inspection_checklists (inspection_id, content, required)
          VALUES (?, ?, ?)
        `, [result.lastID, item.content, item.required ? 1 : 0]);
        console.log(`- 체크리스트 항목 추가: ${item.content}`);
      }
    }

    // 3. 활성 상태인 경우 점검계획 생성
    if (status === 'active') {
      // 모든 활성 라인 조회
      const lines = await db.all(`
        SELECT DISTINCT 
          l1.id as level1_id,
          l2.id as level2_id,
          l3.id as level3_id,
          l4.id as level4_id,
          COALESCE(l4.name, l3.name) as line_name
        FROM lines l1
        LEFT JOIN lines l2 ON l2.parent_id = l1.id
        LEFT JOIN lines l3 ON l3.parent_id = l2.id
        LEFT JOIN lines l4 ON l4.parent_id = l3.id
        WHERE l1.status = 'active'
        ORDER BY 
          l1.id ASC,
          l2.id ASC,
          l3.id ASC,
          l4.id ASC
      `);

      // 각 라인별 점검계획 생성
      for (const line of lines) {
        try {
          // 랜덤 평일 생성
          const scheduledDate = generateRandomWeekday();
          console.log('계산된 예정일:', scheduledDate);

          await db.run(`
            INSERT INTO equipment_inspections (
              inspection_id,
              level1_id,
              level2_id,
              level3_id,
              level4_id,
              line_name,
              inspection_name,
              inspection_standard,
              inspection_cycle,
              scheduled_date,
              status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          `, [
            result.lastID,
            line.level1_id,
            line.level2_id,
            line.level3_id,
            line.level4_id,
            line.line_name,
            name,
            standard,
            cycle,
            scheduledDate
          ]);
        } catch (err) {
          console.error('점검계획 생성 중 오류:', err);
          throw err;
        }
      }
      console.log('- 점검계획 생성 완료');
    }

    await db.run('COMMIT');
    res.json({ id: result.lastID, code, name, standard, cycle, priority, status, checklist });
  } catch (error) {
    if (db) await db.run('ROLLBACK');
    console.error('[ERROR] 점검항목 추가 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검항목 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, standard, cycle, priority } = req.body;
  console.log(`[PUT] /api/inspections/${id} - 점검항목 수정 요청`, { name, standard, cycle, priority });

  let db;
  try {
    db = await initializeDatabase();
    
    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');
    
    // 1. 수정 전 데이터 조회
    const beforeUpdate = await db.get('SELECT * FROM inspections WHERE id = ?', [id]);
    console.log('- 수정 전 데이터:', beforeUpdate);
    
    // 2. 점검항목 업데이트 (status 필드 제외)
    await db.run(`
      UPDATE inspections 
      SET name = ?, standard = ?, cycle = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, standard, cycle, priority, id]);

    // 3. 대기 상태인 점검계획 업데이트
    await db.run(`
      UPDATE equipment_inspections 
      SET inspection_name = ?,
          inspection_standard = ?,
          inspection_cycle = ?
      WHERE inspection_id = ? 
      AND status = 'pending'
    `, [
      name,
      standard,
      cycle,
      id
    ]);
    
    // 4. 업데이트된 점검항목 조회
    const inspection = await db.get('SELECT * FROM inspections WHERE id = ?', [id]);
    console.log('- 수정 후 데이터:', inspection);
    
    // 5. 체크리스트 조회
    const checklist = await db.all(`
      SELECT * FROM inspection_checklists 
      WHERE inspection_id = ?
      ORDER BY created_at ASC
    `, [id]);
    
    await db.run('COMMIT');

    // 응답 데이터 구성
    const responseData = {
      ...inspection,
      checklist
    };

    console.log('- 최종 응답 데이터:', responseData);
    res.json(responseData);
  } catch (error) {
    if (db) await db.run('ROLLBACK');
    console.error('[ERROR] 점검항목 수정 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검항목 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE] /api/inspections/${id} - 점검항목 삭제 요청`);

  let db;
  try {
    db = await initializeDatabase();
    
    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');

    // 1. 모든 점검계획 삭제
    await db.run(`
      DELETE FROM equipment_inspections 
      WHERE inspection_id = ?
    `, [id]);
    console.log('- 점검계획 삭제 완료');

    // 2. 체크리스트 삭제
    await db.run('DELETE FROM inspection_checklists WHERE inspection_id = ?', [id]);
    console.log('- 체크리스트 삭제 완료');

    // 3. 점검항목 삭제
    await db.run('DELETE FROM inspections WHERE id = ?', [id]);
    console.log('- 점검항목 삭제 완료');

    await db.run('COMMIT');
    res.json({ message: '점검항목이 삭제되었습니다.' });
  } catch (error) {
    if (db) await db.run('ROLLBACK');
    console.error('[ERROR] 점검항목 삭제 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 체크리스트 항목 추가
router.post('/:id/checklist', async (req, res) => {
  const { id } = req.params;
  const { content, required } = req.body;
  console.log(`[POST] /api/inspections/${id}/checklist - 체크리스트 항목 추가 요청`, { content });

  try {
    const db = await initializeDatabase();
    const result = await db.run(`
      INSERT INTO inspection_checklists (inspection_id, content, required)
      VALUES (?, ?, ?)
    `, [id, content, required ? 1 : 0]);

    console.log(`- 체크리스트 항목 추가 성공: ID ${result.lastID}`);
    res.json({ 
      id: result.lastID, 
      inspection_id: id, 
      content, 
      required 
    });
  } catch (error) {
    console.error('[ERROR] 체크리스트 항목 추가 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 체크리스트 항목 삭제
router.delete('/:id/checklist/:checklistId', async (req, res) => {
  const { id, checklistId } = req.params;
  console.log(`[DELETE] /api/inspections/${id}/checklist/${checklistId} - 체크리스트 항목 삭제 요청`);

  try {
    const db = await initializeDatabase();
    await db.run('DELETE FROM inspection_checklists WHERE id = ?', [checklistId]);
    console.log('- 체크리스트 항목 삭제 성공');
    res.json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('[ERROR] 체크리스트 항목 삭제 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 체크리스트 항목 수정
router.put('/:id/checklist/:checklistId', async (req, res) => {
  const { id, checklistId } = req.params;
  const { content, required } = req.body;
  console.log(`[PUT] /api/inspections/${id}/checklist/${checklistId} - 체크리스트 항목 수정 요청`, { content, required });

  try {
    const db = await initializeDatabase();
    await db.run(`
      UPDATE inspection_checklists 
      SET content = ?, required = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND inspection_id = ?
    `, [content, required ? 1 : 0, checklistId, id]);

    console.log('- 체크리스트 항목 수정 성공');
    res.json({ 
      id: parseInt(checklistId), 
      inspection_id: id, 
      content, 
      required 
    });
  } catch (error) {
    console.error('[ERROR] 체크리스트 항목 수정 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검항목 상태 변경
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`[PATCH] /api/inspections/${id}/status - 점검항목 상태 변경 요청`, { status });

  let db;
  try {
    db = await initializeDatabase();
    
    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');

    // 1. 상태 업데이트
    await db.run(`
      UPDATE inspections 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);

    // 2. 점검계획 처리
    if (status === 'inactive') {
      // 미사용으로 변경 시 해당 점검항목의 모든 점검계획 삭제
      await db.run(`
        DELETE FROM equipment_inspections 
        WHERE inspection_id = ? 
        AND status IN ('pending', 'in_progress')
      `, [id]);
      
      console.log('- 기존 점검계획 삭제 완료');
    } else if (status === 'active') {
      // 사용으로 변경 시 새로운 점검계획 생성
      const inspection = await db.get('SELECT * FROM inspections WHERE id = ?', [id]);
      
      // 모든 활성 라인 조회
      const lines = await db.all(`
        SELECT DISTINCT 
          l1.id as level1_id,
          l2.id as level2_id,
          l3.id as level3_id,
          l4.id as level4_id,
          COALESCE(l4.name, l3.name) as line_name
        FROM lines l1
        LEFT JOIN lines l2 ON l2.parent_id = l1.id
        LEFT JOIN lines l3 ON l3.parent_id = l2.id
        LEFT JOIN lines l4 ON l4.parent_id = l3.id
        WHERE l1.status = 'active'
        ORDER BY 
          l1.id ASC,
          l2.id ASC,
          l3.id ASC,
          l4.id ASC
      `);

      // 각 라인별 점검계획 생성
      for (const line of lines) {
        try {
          // 랜덤 평일 생성
          const scheduledDate = generateRandomWeekday();
          console.log('계산된 예정일:', scheduledDate);

          await db.run(`
            INSERT INTO equipment_inspections (
              inspection_id,
              level1_id,
              level2_id,
              level3_id,
              level4_id,
              line_name,
              inspection_name,
              inspection_standard,
              inspection_cycle,
              scheduled_date,
              status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          `, [
            id,
            line.level1_id,
            line.level2_id,
            line.level3_id,
            line.level4_id,
            line.line_name,
            inspection.name,
            inspection.standard,
            inspection.cycle,
            scheduledDate
          ]);
        } catch (err) {
          console.error('점검계획 생성 중 오류:', err);
          throw err;
        }
      }
    }

    await db.run('COMMIT');
    console.log('- 점검항목 상태 변경 성공');
    res.json({ id, status });
  } catch (error) {
    if (db) await db.run('ROLLBACK');
    console.error('[ERROR] 점검항목 상태 변경 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 