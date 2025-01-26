const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDb } = require('../database/connection');

// 메모리에 이미지를 임시 저장
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// 전체 공구/도구 목록 조회
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const tools = await db.all('SELECT * FROM tools WHERE status = "active" ORDER BY created_at DESC');
    
    // 각 도구의 이미지 정보 조회
    for (const tool of tools) {
      const images = await db.all('SELECT id, image FROM tool_images WHERE tool_id = ?', tool.id);
      tool.images = images.map(img => ({
        id: img.id,
        image: img.image.toString('base64')
      }));
    }
    
    res.json(tools);
  } catch (error) {
    console.error('공구/도구 목록 조회 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공구/도구 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const tool = await db.get('SELECT * FROM tools WHERE id = ? AND status = "active"', req.params.id);
    
    if (!tool) {
      return res.status(404).json({ error: '해당 공구/도구를 찾을 수 없습니다.' });
    }

    // 이미지 정보 조회 및 Base64 변환
    const images = await db.all('SELECT id, image FROM tool_images WHERE tool_id = ?', tool.id);
    tool.images = images.map(img => ({
      id: img.id,
      image: img.image.toString('base64')
    }));
    
    res.json(tool);
  } catch (error) {
    console.error('공구/도구 상세 조회 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공구/도구 등록
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    console.log('받은 데이터:', req.body);  // 요청 바디 로깅
    console.log('받은 파일들:', req.files);  // 파일 데이터 로깅

    const db = getDb();
    const {
      code,
      category,
      name,
      specification,
      manufacturer,
      manager,
      current_stock,
      safety_stock,
      unit_price,
      location_zone,
      location_row,
      location_column,
      location_position,
      factory,
      department,
      line_name,
      remarks
    } = req.body;
    
    // 필수 필드 검증
    if (!code || !category || !name || !specification || !current_stock || !safety_stock) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    const result = await db.run(
      `INSERT INTO tools (
        code, category, name, specification, manufacturer, manager,
        current_stock, safety_stock, unit_price,
        location_zone, location_row, location_column, location_position,
        factory, department, line_name,
        remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, category, name, specification, manufacturer, manager,
        current_stock, safety_stock, unit_price,
        location_zone, location_row, location_column, location_position,
        factory, department, line_name,
        remarks
      ]
    );

    // 이미지 저장
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.run(
          'INSERT INTO tool_images (tool_id, image) VALUES (?, ?)',
          [result.lastID, file.buffer]
        );
      }
    }
    
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error('공구/도구 등록 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공구/도구 수정
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const db = getDb();
    const {
      code,
      category,
      name,
      specification,
      manufacturer,
      manager,
      current_stock,
      safety_stock,
      unit_price,
      location_zone,
      location_row,
      location_column,
      location_position,
      factory,
      department,
      line_name,
      remarks,
      delete_image_ids
    } = req.body;
    const { id } = req.params;
    
    // 필수 필드 검증
    if (!code || !category || !name || !specification || !current_stock || !safety_stock) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    const result = await db.run(
      `UPDATE tools 
       SET code = ?, category = ?, name = ?, specification = ?,
           manufacturer = ?, manager = ?,
           current_stock = ?, safety_stock = ?, unit_price = ?,
           location_zone = ?, location_row = ?, location_column = ?, location_position = ?,
           factory = ?, department = ?, line_name = ?,
           remarks = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        code, category, name, specification,
        manufacturer, manager,
        current_stock, safety_stock, unit_price,
        location_zone, location_row, location_column, location_position,
        factory, department, line_name,
        remarks, id
      ]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '해당 공구/도구를 찾을 수 없습니다.' });
    }

    // 삭제할 이미지가 있다면 삭제
    if (delete_image_ids) {
      const imageIds = JSON.parse(delete_image_ids);
      for (const imageId of imageIds) {
        await db.run('DELETE FROM tool_images WHERE id = ? AND tool_id = ?', [imageId, id]);
      }
    }

    // 새로운 이미지 추가
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.run(
          'INSERT INTO tool_images (tool_id, image) VALUES (?, ?)',
          [id, file.buffer]
        );
      }
    }
    
    res.json({ message: '수정되었습니다.' });
  } catch (error) {
    console.error('공구/도구 수정 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공구/도구 삭제 (상태 변경)
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run(
      'UPDATE tools SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      req.params.id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '해당 공구/도구를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '삭제되었습니다.' });
  } catch (error) {
    console.error('공구/도구 삭제 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공구/도구 이미지 조회
router.get('/:id/images', async (req, res) => {
  try {
    const db = getDb();
    const images = await db.all('SELECT id FROM tool_images WHERE tool_id = ?', req.params.id);
    res.json(images);
  } catch (error) {
    console.error('이미지 조회 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 공구/도구 특정 이미지 조회
router.get('/:id/images/:imageId', async (req, res) => {
  try {
    const db = getDb();
    const image = await db.get(
      'SELECT image FROM tool_images WHERE id = ? AND tool_id = ?',
      [req.params.imageId, req.params.id]
    );
    
    if (!image) {
      return res.status(404).send('이미지를 찾을 수 없습니다.');
    }
    
    res.setHeader('Content-Type', 'image/png');  // 또는 적절한 이미지 타입
    res.send(image.image);
  } catch (error) {
    console.error('이미지 조회 실패:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// 공구 정보 업데이트
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    category,
    name,
    specification,
    manufacturer,
    manager,
    current_stock,
    safety_stock,
    unit_price,
    location_zone,
    location_row,
    location_column,
    location_position,
    factory,
    department,
    line_name,
    remarks
  } = req.body;

  try {
    const result = await getDb().query(
      `UPDATE tools 
       SET category = $1,
           name = $2,
           specification = $3,
           manufacturer = $4,
           manager = $5,
           current_stock = $6,
           safety_stock = $7,
           unit_price = $8,
           location_zone = $9,
           location_row = $10,
           location_column = $11,
           location_position = $12,
           factory = $13,
           department = $14,
           line_name = $15,
           remarks = $16,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $17
       RETURNING *`,
      [
        category,
        name,
        specification,
        manufacturer,
        manager,
        current_stock,
        safety_stock,
        unit_price,
        location_zone,
        location_row,
        location_column,
        location_position,
        factory,
        department,
        line_name,
        remarks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '해당 공구를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(500).json({ error: '공구 정보 업데이트 실패' });
  }
});

// 공구 검색 API
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: '검색어를 입력해주세요.' });
    }

    const db = getDb();
    const searchQuery = `%${query}%`;
    
    const tools = await db.all(
      `SELECT id, code, name, specification, current_stock 
       FROM tools 
       WHERE (code LIKE ? OR name LIKE ? OR specification LIKE ?) 
       AND status = "active" 
       ORDER BY name ASC 
       LIMIT 10`,
      [searchQuery, searchQuery, searchQuery]
    );
    
    res.json(tools);
  } catch (error) {
    console.error('공구 검색 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 