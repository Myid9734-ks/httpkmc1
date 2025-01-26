const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');

// 간단점검 목록 조회
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const inspections = await db.all('SELECT * FROM quick_inspections ORDER BY created_at DESC');
    res.json(inspections.map(inspection => ({
      ...inspection,
      weekdays: JSON.parse(inspection.weekdays)
    })));
  } catch (error) {
    console.error('간단점검 목록 조회 실패:', error);
    res.status(500).json({ error: '간단점검 목록을 조회하는데 실패했습니다.' });
  }
});

// 간단점검 생성
router.post('/', async (req, res) => {
  try {
    console.log('POST 요청 수신:', req.body);
    
    // 필수 필드 검증
    const { inspection_name, cycle, weekdays } = req.body;
    if (!inspection_name || !cycle || !weekdays) {
      return res.status(400).json({ 
        error: '필수 필드가 누락되었습니다.',
        required: ['inspection_name', 'cycle', 'weekdays'],
        received: req.body
      });
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO quick_inspections (inspection_name, cycle, weekdays) VALUES (?, ?, ?)',
      [inspection_name, cycle, JSON.stringify(weekdays)]
    );

    const inspection = await db.get('SELECT * FROM quick_inspections WHERE id = ?', [result.lastID]);
    console.log('생성된 간단점검:', inspection);
    
    res.json({
      ...inspection,
      weekdays: JSON.parse(inspection.weekdays)
    });
  } catch (error) {
    console.error('간단점검 생성 실패:', error);
    res.status(500).json({ 
      error: '간단점검을 생성하는데 실패했습니다.',
      details: error.message
    });
  }
});

// 간단점검 삭제
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM quick_inspections WHERE id = ?', [req.params.id]);
    res.json({ message: '간단점검이 삭제되었습니다.' });
  } catch (error) {
    console.error('간단점검 삭제 실패:', error);
    res.status(500).json({ error: '간단점검을 삭제하는데 실패했습니다.' });
  }
});

module.exports = router; 