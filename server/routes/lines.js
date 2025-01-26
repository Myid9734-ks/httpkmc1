const express = require('express');
const router = express.Router();
const { initializeDatabase } = require('../database/connection');

// 전체 라인 트리 구조 조회
router.get('/', async (req, res) => {
  try {
    const db = await initializeDatabase();
    const lines = await db.all('SELECT * FROM lines ORDER BY level, name');
    
    // 트리 구조로 변환
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    const treeData = buildTree(lines);
    console.log('트리 구조로 변환된 라인:', JSON.stringify(treeData, null, 2));
    
    res.json({ data: treeData });
  } catch (error) {
    console.error('라인 목록 조회 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 새 라인 추가
router.post('/', async (req, res) => {
  const { parent_id, level, name, status } = req.body;

  try {
    const db = await initializeDatabase();

    // 레벨 제한 체크
    if (level < 1 || level > 4) {
      return res.status(400).json({ error: '유효하지 않은 레벨입니다.' });
    }

    // 부모 라인 체크
    if (parent_id) {
      const parent = await db.get('SELECT level FROM lines WHERE id = ?', parent_id);
      
      if (!parent) {
        return res.status(400).json({ error: '상위 라인이 존재하지 않습니다.' });
      }
      if (parent.level >= level) {
        return res.status(400).json({ error: '상위 라인의 레벨이 올바르지 않습니다.' });
      }
    }

    const result = await db.run(
      'INSERT INTO lines (parent_id, level, name, status) VALUES (?, ?, ?, ?)',
      [parent_id, level, name, status || 'active']
    );

    const newLine = await db.get('SELECT * FROM lines WHERE id = ?', result.lastID);
    res.status(201).json(newLine);
  } catch (error) {
    // SQLite 제약조건 오류 처리
    if (error.code === 'SQLITE_CONSTRAINT') {
      if (level === 1) {
        return res.status(400).json({ 
          error: `이미 존재하는 공장명입니다: ${name}`
        });
      }
    }
    
    res.status(500).json({ error: '라인 생성 중 오류가 발생했습니다.' });
  }
});

// 라인 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    const db = await initializeDatabase();

    const result = await db.run(
      'UPDATE lines SET name = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, status, id]
    );

    const updatedLine = await db.get('SELECT * FROM lines WHERE id = ?', id);
    if (!updatedLine) {
      return res.status(404).json({ error: '라인을 찾을 수 없습니다.' });
    }

    res.json(updatedLine);
  } catch (error) {
    res.status(500).json({ error: '라인 수정 중 오류가 발생했습니다.' });
  }
});

// 라인 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await initializeDatabase();

    const result = await db.run('DELETE FROM lines WHERE id = ?', id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '라인을 찾을 수 없습니다.' });
    }

    res.json({ message: '라인이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '라인 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 