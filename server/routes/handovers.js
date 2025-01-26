const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');

// 일일 인수인계 목록 조회
router.get('/daily', async (req, res) => {
  try {
    const { date, factory, department, shift } = req.query;
    const db = await getDb();
    
    let query = 'SELECT * FROM daily_handovers WHERE 1=1';
    const params = [];

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (factory) {
      query += ' AND factory = ?';
      params.push(factory);
    }
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (shift) {
      query += ' AND shift = ?';
      params.push(shift);
    }

    query += ' ORDER BY created_at DESC';
    
    const handovers = await db.all(query, params);
    res.json(handovers);
  } catch (error) {
    console.error('일일 인수인계 조회 오류:', error);
    res.status(500).json({ error: '일일 인수인계 조회 중 오류가 발생했습니다.' });
  }
});

// 완료된 인수인계 목록 조회
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDb();
    
    let query = `
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
        updated_at
      FROM daily_handovers
      WHERE status = 'completed'
    `;
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC';
    
    console.log('실행되는 쿼리:', query);
    console.log('파라미터:', params);
    
    const rows = await db.all(query, params);
    console.log('DB에서 조회된 데이터:', rows);
    
    // 데이터 그룹화
    const groupedData = rows.reduce((acc, row) => {
      const key = `${row.date}_${row.factory}_${row.department}_${row.shift}_${row.writer}`;
      if (!acc[key]) {
        acc[key] = {
          date: row.date,
          factory: row.factory,
          department: row.department,
          shift: row.shift,
          writer: row.writer,
          lines: [],
          general_remarks: row.general_remarks
        };
      }
      
      acc[key].lines.push({
        line_name: row.line_name,
        handover_content: row.handover_content,
        remarks: row.remarks
      });
      
      return acc;
    }, {});

    // 배열로 변환
    const handovers = Object.values(groupedData).map(group => ({
      ...group,
      line_contents: group.lines.map(line => `${line.line_name}\n${line.handover_content}`).join('\n'),
      remarks_list: group.lines.map(line => line.remarks).join('\n')
    }));

    console.log('최종 응답 데이터:', handovers);
    res.json(handovers);
  } catch (error) {
    console.error('인수인계 이력 조회 오류:', error);
    res.status(500).json({ error: '인수인계 이력 조회 중 오류가 발생했습니다.' });
  }
});

// 일일 인수인계 등록
router.post('/daily', async (req, res) => {
  try {
    const { 
      date, factory, department, shift, writer, line_name, 
      handover_content, remarks, general_remarks, status 
    } = req.body;
    const db = await getDb();

    // 기존 데이터 확인
    const existingHandover = await db.get(
      `SELECT id FROM daily_handovers 
       WHERE date = ? AND factory = ? AND department = ? 
       AND shift = ? AND writer = ? AND line_name = ?`,
      [date, factory, department, shift, writer, line_name]
    );

    let result;
    if (existingHandover) {
      // 기존 데이터가 있으면 UPDATE
      result = await db.run(
        `UPDATE daily_handovers 
         SET handover_content = ?,
             remarks = ?,
             general_remarks = ?,
             status = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [handover_content, remarks, general_remarks, status || 'pending', existingHandover.id]
      );
      res.json({ id: existingHandover.id, updated: true });
    } else {
      // 새로운 데이터 INSERT
      result = await db.run(
        `INSERT INTO daily_handovers (
          date, factory, department, shift, writer, line_name, 
          handover_content, remarks, general_remarks, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [date, factory, department, shift, writer, line_name, 
         handover_content, remarks, general_remarks, status || 'pending']
      );
      res.json({ id: result.lastID, updated: false });
    }
  } catch (error) {
    console.error('일일 인수인계 등록 오류:', error);
    res.status(500).json({ error: '일일 인수인계 등록 중 오류가 발생했습니다.' });
  }
});

// 일일 인수인계 수정
router.put('/daily/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { handover_content, remarks, general_remarks, status } = req.body;
    const db = await getDb();
    
    await db.run(
      `UPDATE daily_handovers 
       SET handover_content = ?, 
           remarks = ?, 
           general_remarks = ?,
           status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [handover_content, remarks, general_remarks, status, id]
    );
    
    res.json({ message: '수정되었습니다.' });
  } catch (error) {
    console.error('일일 인수인계 수정 오류:', error);
    res.status(500).json({ error: '일일 인수인계 수정 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 