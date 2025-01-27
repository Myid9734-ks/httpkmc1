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

// 평일 체크 함수 추가
const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;  // 0은 일요일, 6은 토요일
};

// 다음 예정일 계산 함수
const calculateNextScheduledDate = (baseDate, cycle) => {
  // 한글 주기를 영문으로 변환
  const koreanToEnglish = {
    '일': 'day',
    '주': 'week',
    '개월': 'month',
    '년': 'year'
  };

  // 숫자와 단위 분리 (예: "12개월" -> ["12", "개월"])
  const cycleMatch = cycle.match(/(\d+)([가-힣]+)/);
  if (!cycleMatch) return null;

  const [, number, koreanUnit] = cycleMatch;
  const unit = koreanToEnglish[koreanUnit];
  if (!unit) return null;

  const nextDate = new Date(baseDate);
  
  // 기본 다음 예정일 계산
  switch(unit) {
    case 'day':
      nextDate.setDate(nextDate.getDate() + parseInt(number));
      break;
    case 'week':
      nextDate.setDate(nextDate.getDate() + (parseInt(number) * 7));
      break;
    case 'month':
      nextDate.setMonth(nextDate.getMonth() + parseInt(number));
      break;
    case 'year':
      nextDate.setFullYear(nextDate.getFullYear() + parseInt(number));
      break;
    default:
      return null;
  }

  // ±5일 범위 내에서 평일 찾기
  const minDate = new Date(nextDate);
  const maxDate = new Date(nextDate);
  minDate.setDate(minDate.getDate() - 5);
  maxDate.setDate(maxDate.getDate() + 5);

  // 범위 내 평일 수집
  const weekdays = [];
  let checkDate = new Date(minDate);
  while (checkDate <= maxDate) {
    if (isWeekday(checkDate)) {
      weekdays.push(new Date(checkDate));
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  // 랜덤하게 평일 선택
  const randomIndex = Math.floor(Math.random() * weekdays.length);
  return weekdays[randomIndex];
};

// 점검실행 API 수정
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

    // 3. 다음 예정일 계산 및 원본 데이터 업데이트
    const nextScheduledDate = calculateNextScheduledDate(
      inspection.scheduled_date,
      inspection.inspection_cycle
    );

    if (nextScheduledDate) {
      await db.run(`
        UPDATE equipment_inspections 
        SET scheduled_date = ?,
            execution_due_date = NULL
        WHERE id = ?
      `, [nextScheduledDate.toISOString().split('T')[0], id]);
    }

    // 4. 알림 생성
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

    // 트랜잭션 커밋
    await db.run('COMMIT');

    res.json({ 
      message: '점검이 완료되었습니다.',
      completedInspectionId: result.lastID,
      nextScheduledDate: nextScheduledDate
    });
  } catch (error) {
    // 오류 발생 시 롤백
    await db.run('ROLLBACK');
    console.error('[ERROR] 점검완료 처리 중 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 