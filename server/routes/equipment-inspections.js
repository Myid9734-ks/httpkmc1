const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');

// 모든 점검 계획 조회
router.get('/', async (req, res) => {
  console.log('[GET] /api/equipment-inspections - 점검 계획 조회');
  const db = await getDb();
  
  try {
    const inspections = await db.all('SELECT * FROM equipment_inspections');
    
    // 체크리스트 JSON 문자열을 객체로 변환
    const inspectionsWithParsedChecklist = inspections.map(inspection => ({
      ...inspection,
      checklist: JSON.parse(inspection.checklist || '[]'),
      check_results: JSON.parse(inspection.check_results || '[]')
    }));
    
    console.log(`- 조회된 점검 계획 수: ${inspections.length}`);
    res.json(inspectionsWithParsedChecklist);
  } catch (error) {
    console.error('[ERROR] 점검 계획 조회 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 완료된 점검 목록 조회
router.get('/completed', async (req, res) => {
  console.log('[GET] /api/equipment-inspections/completed - 완료된 점검 목록 조회');
  const db = await getDb();
  
  try {
    const completedInspections = await db.all(`
      SELECT 
        ci.*,
        l1.name as factory_name,
        l2.name as department_name,
        l3.name as line_name,
        l4.name as sub_line_name
      FROM completed_inspections ci
      LEFT JOIN lines l1 ON ci.level1_id = l1.id
      LEFT JOIN lines l2 ON ci.level2_id = l2.id
      LEFT JOIN lines l3 ON ci.level3_id = l3.id
      LEFT JOIN lines l4 ON ci.level4_id = l4.id
      ORDER BY ci.completion_date DESC
    `);
    
    // JSON 문자열을 객체로 변환
    const parsedInspections = completedInspections.map(inspection => ({
      ...inspection,
      checklist_results: JSON.parse(inspection.checklist_results || '[]')
    }));
    
    console.log(`- 조회된 완료 점검 수: ${completedInspections.length}`);
    res.json(parsedInspections);
  } catch (error) {
    console.error('[ERROR] 완료된 점검 목록 조회 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검 계획 생성 (기존 데이터 삭제 후 새로 생성)
router.post('/generate', async (req, res) => {
  const db = await getDb();
  
  try {
    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');
    
    // 기존 데이터 삭제
    await db.run('DELETE FROM equipment_inspections');
    
    // Auto Increment 초기화
    await db.run('DELETE FROM sqlite_sequence WHERE name = "equipment_inspections"');
    
    // 새로운 점검 계획들 저장
    const stmt = await db.prepare(`
      INSERT INTO equipment_inspections (
        level1_id,
        level2_id,
        level3_id,
        level4_id,
        line_name,
        inspection_id,
        inspection_name,
        inspection_standard,
        inspection_cycle,
        scheduled_date,
        checklist
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const inspection of req.body.inspections) {
      await stmt.run([
        inspection.level1_id,
        inspection.level2_id,
        inspection.level3_id,
        inspection.level4_id || null,
        inspection.line_name,
        inspection.inspection_id,
        inspection.inspection_name,
        inspection.inspection_standard,
        inspection.inspection_cycle,
        inspection.scheduled_date,
        JSON.stringify(inspection.checklist)
      ]);
    }

    await stmt.finalize();
    await db.run('COMMIT');
    
    // 생성된 데이터 조회
    const createdInspections = await db.all('SELECT * FROM equipment_inspections');
    
    // 체크리스트 JSON 문자열을 객체로 변환
    const inspectionsWithParsedChecklist = createdInspections.map(inspection => ({
      ...inspection,
      checklist: JSON.parse(inspection.checklist || '[]')
    }));
    
    res.json({
      message: '점검 계획이 생성되었습니다.',
      inspections: inspectionsWithParsedChecklist
    });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('점검 계획 생성 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검 실행기한 업데이트
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { execution_due_date } = req.body;
  
  try {
    const db = await getDb();
    await db.run(
      'UPDATE equipment_inspections SET execution_due_date = ? WHERE id = ?',
      [execution_due_date, id]
    );
    
    res.json({ message: '실행기한이 업데이트되었습니다.' });
  } catch (error) {
    console.error('실행기한 업데이트 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검실행 API
router.post('/complete/:id', async (req, res) => {
  const { id } = req.params;
  const { inspector, checklist_results, photos, notes } = req.body;
  console.log(`[POST] /api/equipment-inspections/complete/${id} - 점검실행`, { inspector });

  const db = await getDb();
  
  try {
    // 트랜잭션 시작
    await db.run('BEGIN TRANSACTION');
    
    // 1. 원본 점검 데이터 조회
    const inspection = await db.get(`
      SELECT * FROM equipment_inspections WHERE id = ?
    `, [id]);

    if (!inspection) {
      throw new Error('점검 데이터를 찾을 수 없습니다.');
    }

    console.log('- 원본 점검 데이터 조회 완료');

    // 2. 완료된 점검 테이블에 데이터 저장
    const result = await db.run(`
      INSERT INTO completed_inspections (
        original_inspection_id,
        level1_id,
        level2_id,
        level3_id,
        level4_id,
        line_name,
        inspection_name,
        inspection_standard,
        inspection_cycle,
        scheduled_date,
        completion_date,
        inspector,
        checklist_results,
        photos,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?, ?, ?, ?)
    `, [
      id,
      inspection.level1_id,
      inspection.level2_id,
      inspection.level3_id,
      inspection.level4_id,
      inspection.line_name,
      inspection.inspection_name,
      inspection.inspection_standard,
      inspection.inspection_cycle,
      inspection.scheduled_date,
      inspector,
      JSON.stringify(checklist_results),
      photos,
      notes
    ]);

    console.log('- 원본 점검 데이터 업데이트 완료');

    // 알림 생성
    console.log('알림 생성 시작:', {
      type: 'EQUIPMENT_CHECK',
      message: `${inspection.inspection_name} 점검이 완료되었습니다.`,
      reference_id: inspection.id
    });

    await db.run(
      `INSERT INTO notifications (type, message, reference_id, reference_type)
       VALUES (?, ?, ?, ?)`,
      [
        'EQUIPMENT_CHECK',
        `${inspection.inspection_name} 점검이 완료되었습니다.`,
        inspection.id,
        'equipment_inspections'
      ]
    );

    console.log('알림 생성 완료');

    // notifications 테이블 조회
    const notifications = await db.all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
    console.log('최근 알림 목록:', notifications);

    // 트랜잭션 커밋
    await db.run('COMMIT');

    res.json({ 
      message: '점검이 완료되었습니다.',
      completedInspectionId: result.lastID
    });
  } catch (error) {
    // 오류 발생 시 롤백
    await db.run('ROLLBACK');
    console.error('[ERROR] 점검완료 처리 중 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 점검 완료 처리
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { inspector, inspection_date, check_results, notes } = req.body;
  const db = await getDb();
  
  try {
    // 점검 정보 조회
    const inspection = await db.get('SELECT * FROM equipment_inspections WHERE id = ?', [id]);
    if (!inspection) {
      return res.status(404).json({ error: '점검 계획을 찾을 수 없습니다.' });
    }

    // 완료 처리
    await db.run(
      `UPDATE equipment_inspections 
       SET status = ?, inspector = ?, inspection_date = ?, 
           check_results = ?, notes = ?, 
           updated_at = datetime("now", "localtime") 
       WHERE id = ?`,
      ['completed', inspector, inspection_date, JSON.stringify(check_results), notes, id]
    );

    // 알림 생성
    await db.run(
      `INSERT INTO notifications (type, message, reference_id, reference_type)
       VALUES (?, ?, ?, ?)`,
      [
        'EQUIPMENT_CHECK',
        `${inspection.inspection_name} 점검이 완료되었습니다.`,
        inspection.id,
        'equipment_inspections'
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('점검 완료 처리 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 