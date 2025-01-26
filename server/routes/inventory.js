const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');
const path = require('path');
const fs = require('fs');
const { checkInventory } = require('../scheduler');

// 디버깅을 위한 미들웨어
router.use((req, res, next) => {
  console.log('Inventory Router 요청:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  next();
});

// 이미지 제공 API (라우트 순서 변경: 상단으로 이동)
router.get('/tools/images/thumbnails/:filename', async (req, res) => {
  const { filename } = req.params;
  const thumbnailPath = path.join(__dirname, '../uploads/tools/thumbnails', filename);
  const originalPath = path.join(__dirname, '../uploads/tools', filename);
  
  try {
    console.log('썸네일 요청:', { filename, thumbnailPath, originalPath });
    
    if (fs.existsSync(thumbnailPath)) {
      res.sendFile(thumbnailPath);
    } else if (fs.existsSync(originalPath)) {
      res.sendFile(originalPath);
    } else {
      console.log('이미지 파일 없음:', { thumbnailPath, originalPath });
      res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('썸네일 제공 실패:', error);
    res.status(500).json({ error: '썸네일 제공 중 오류가 발생했습니다.' });
  }
});

router.get('/tools/images/:filename', async (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '../uploads/tools', filename);
  
  try {
    console.log('이미지 요청:', { filename, imagePath });
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      console.log('이미지 파일 없음:', imagePath);
      res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('이미지 제공 실패:', error);
    res.status(500).json({ error: '이미지 제공 중 오류가 발생했습니다.' });
  }
});

// 공구 검색 API
router.get('/tools', async (req, res) => {
  const db = getDb();
  const { search, factory, department, line } = req.query;
  
  try {
    console.log('공구 검색 요청:', { search, factory, department, line });
    
    const query = `
      SELECT t.*,
             GROUP_CONCAT(ti.image) as images,
             COUNT(DISTINCT ti.id) as image_count
      FROM tools t
      LEFT JOIN tool_images ti ON t.id = ti.tool_id
      WHERE t.status = 'active'
      AND (t.code LIKE ? OR t.name LIKE ? OR t.specification LIKE ?)
      ${factory ? 'AND t.factory = ?' : ''}
      ${department ? 'AND t.department = ?' : ''}
      ${line ? 'AND t.line_name = ?' : ''}
      GROUP BY t.id
    `;
    
    const params = [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      ...(factory ? [factory] : []),
      ...(department ? [department] : []),
      ...(line ? [line] : [])
    ];
    
    console.log('실행될 쿼리:', query);
    console.log('쿼리 파라미터:', params);
    
    const tools = await db.all(query, params);
    
    // 이미지 데이터 처리
    const processedTools = await Promise.all(tools.map(async tool => {
      // 이미지 정보 조회
      const images = await db.all(
        'SELECT image FROM tool_images WHERE tool_id = ?',
        [tool.id]
      );
      
      return {
        ...tool,
        images: images.map(img => ({
          image: img.image ? img.image.toString('base64') : null
        })),
        image_count: images.length
      };
    }));
    
    console.log('이미지 처리 완료:', processedTools.map(t => ({
      code: t.code,
      image_count: t.image_count
    })));
    
    res.json(processedTools);
    
  } catch (error) {
    console.error('공구 검색 실패:', error);
    res.status(500).json({ error: '공구 검색 중 오류가 발생했습니다.' });
  }
});

// formatDateTime 함수 수정
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    // DB의 날짜 문자열을 그대로 반환
    return dateStr;
  } catch (error) {
    console.error('[날짜변환 오류]:', error, dateStr);
    return dateStr;
  }
};

// 거래 내역 조회 API
router.get('/transactions', async (req, res) => {
  const db = getDb();
  const { startDate, endDate, factory, department, line, type } = req.query;
  
  try {
    console.log('[거래내역 API] 요청 파라미터:', { 
      startDate, 
      endDate, 
      factory, 
      department, 
      line, 
      type 
    });
    
    let query = `
      SELECT 
        tt.*,
        t.name as tool_name,
        t.code as tool_code,
        t.factory as tool_factory,
        t.department as tool_department,
        tt.transaction_date as formatted_date
      FROM tool_transactions tt
      JOIN tools t ON tt.tool_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ` AND date(tt.transaction_date) >= date(?)`;
      params.push(startDate);
      console.log('[거래내역 API] 시작일자 필터 추가:', startDate);
    }
    
    if (endDate) {
      query += ` AND date(tt.transaction_date) <= date(?)`;
      params.push(endDate);
      console.log('[거래내역 API] 종료일자 필터 추가:', endDate);
    }
    
    if (factory) {
      query += ` AND t.factory = ?`;
      params.push(factory);
      console.log('[거래내역 API] 공장 필터 추가:', factory);
    }
    
    if (department) {
      query += ` AND t.department = ?`;
      params.push(department);
      console.log('[거래내역 API] 부서 필터 추가:', department);
    }
    
    if (line) {
      query += ` AND t.line_name = ?`;
      params.push(line);
      console.log('[거래내역 API] 라인 필터 추가:', line);
    }
    
    if (type && type !== 'all') {
      query += ` AND tt.type = ?`;
      params.push(type);
      console.log('[거래내역 API] 거래유형 필터 추가:', type);
    }
    
    query += ` ORDER BY tt.transaction_date DESC`;
    
    console.log('[거래내역 API] 실행될 쿼리:', query);
    console.log('[거래내역 API] 쿼리 파라미터:', params);
    
    const transactions = await db.all(query, params);
    console.log(`[거래내역 API] 조회된 데이터 수: ${transactions.length}`);
    
    // 날짜 형식 변환 및 유효성 검사
    const processedTransactions = transactions.map(transaction => {
      const formattedDate = formatDateTime(transaction.formatted_date);
      return {
        ...transaction,
        transaction_date: formattedDate || transaction.formatted_date
      };
    });
    
    console.log('[거래내역 API] 응답 데이터 샘플:', 
      processedTransactions.slice(0, 2).map(t => ({
        id: t.id,
        date: t.transaction_date,
        type: t.type,
        tool: t.tool_code
      }))
    );
    
    res.json(processedTransactions);
    
  } catch (error) {
    console.error('[거래내역 API] 조회 실패:', error);
    res.status(500).json({ error: '거래 내역 조회 중 오류가 발생했습니다.' });
  }
});

// 공구 코드로 정보 조회 API
router.get('/tools/:code', async (req, res) => {
  const db = getDb();
  const { code } = req.params;
  
  try {
    console.log('공구 코드로 정보 조회:', code);
    
    const query = `
      SELECT t.*, 
             GROUP_CONCAT(DISTINCT ti.image) as images,
             COUNT(DISTINCT ti.id) as image_count
      FROM tools t 
      LEFT JOIN tool_images ti ON t.id = ti.tool_id 
      WHERE t.code = ? COLLATE NOCASE AND t.status = 'active'
      GROUP BY t.id
    `;
    
    const tool = await db.get(query, [code]);
    
    if (!tool) {
      return res.status(404).json({ error: '존재하지 않는 공구입니다.' });
    }
    
    // 이미지 데이터 처리
    const processedTool = {
      ...tool,
      image_count: tool.image_count || 0,
      images: tool.images ? await db.all(
        'SELECT image FROM tool_images WHERE tool_id = ?',
        [tool.id]
      ).then(images => images.map(img => ({
        image: img.image ? img.image.toString('base64') : null
      }))) : []
    };
    
    console.log('공구 정보 응답:', {
      ...processedTool,
      images: processedTool.images ? `${processedTool.images.length}개의 이미지` : '이미지 없음'
    });
    res.json(processedTool);
    
  } catch (error) {
    console.error('공구 정보 조회 실패:', error);
    res.status(500).json({ error: '공구 정보 조회 중 오류가 발생했습니다.' });
  }
});

// 거래 등록 API
router.post('/transactions', async (req, res) => {
  const db = getDb();
  const { tool_code, type, quantity, manager, remarks, location_zone, location_row, location_column, location_position } = req.body;
  
  try {
    console.log('거래 등록 요청:', req.body);
    
    await db.run('BEGIN TRANSACTION');
    
    // 공구 조회
    const tool = await db.get('SELECT * FROM tools WHERE code = ? COLLATE NOCASE AND status = "active"', [tool_code]);
    console.log('찾은 공구:', tool);
    
    if (!tool) {
      throw new Error(`존재하지 않는 공구입니다. (코드: ${tool_code})`);
    }
    
    // 출고 시 재고 확인
    if (type === 'out' && tool.current_stock < quantity) {
      throw new Error(`재고가 부족합니다. (현재: ${tool.current_stock}, 요청: ${quantity})`);
    }
    
    // 재고 업데이트
    const newStock = type === 'in' ? tool.current_stock + quantity : tool.current_stock - quantity;
    console.log('재고 업데이트:', { 현재재고: tool.current_stock, 변경수량: quantity, 새재고: newStock });
    
    await db.run('UPDATE tools SET current_stock = ?, updated_at = datetime("now", "localtime") WHERE id = ?', [newStock, tool.id]);
    
    // 거래 내역 등록
    const result = await db.run(
      `INSERT INTO tool_transactions (
        tool_id, type, quantity, manager, remarks,
        location_zone, location_row, location_column, location_position,
        transaction_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
      [tool.id, type, quantity, manager, remarks || '', 
       location_zone || tool.location_zone, 
       location_row || tool.location_row,
       location_column || tool.location_column, 
       location_position || tool.location_position]
    );

    // 알림 생성
    if (type === 'in') {
      // 입고 알림 생성
      console.log('입고 알림 생성 시도:', {
        type: 'TOOL_IN',
        message: `${tool.name} ${quantity}개가 입고되었습니다`,
        tool_id: tool.id
      });

      try {
        await db.run(
          `INSERT INTO notifications (
            type, message, reference_id, reference_type
          ) VALUES (?, ?, ?, ?)`,
          [
            'TOOL_IN',
            `${tool.name} ${quantity}개가 입고되었습니다`,
            tool.id,
            'tools'
          ]
        );
        console.log('입고 알림 생성 성공');
      } catch (error) {
        console.error('입고 알림 생성 실패:', error);
      }
    } else if (newStock <= tool.safety_stock) {
      // 재고 부족 알림 생성
      console.log('재고 부족 알림 생성 시도:', {
        type: 'TOOL_STOCK',
        message: `${tool.name}의 재고가 ${newStock}개 남았습니다`,
        tool_id: tool.id
      });

      try {
        await db.run(
          `INSERT INTO notifications (
            type, message, reference_id, reference_type
          ) VALUES (?, ?, ?, ?)`,
          [
            'TOOL_STOCK',
            `${tool.name}의 재고가 ${newStock}개 남았습니다`,
            tool.id,
            'tools'
          ]
        );
        console.log('재고 부족 알림 생성 성공');
      } catch (error) {
        console.error('재고 부족 알림 생성 실패:', error);
      }
    }
    
    await db.run('COMMIT');
    
    // 등록된 거래 내역 조회
    const transaction = await db.get(
      `SELECT tt.*, t.name as tool_name, t.code as tool_code,
              t.factory as tool_factory, t.department as tool_department,
              t.line_name as tool_line_name, t.category,
              t.specification, t.manufacturer, t.unit_price
       FROM tool_transactions tt
       JOIN tools t ON tt.tool_id = t.id
       WHERE tt.id = ?`,
      [result.lastID]
    );
    
    console.log('거래 등록 성공:', transaction);
    res.json(transaction);
    
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('거래 등록 실패:', error);
    res.status(500).json({ error: error.message || '거래 등록 중 오류가 발생했습니다.' });
  }
});

// 재고 체크 테스트 엔드포인트
router.get('/check-stock', async (req, res) => {
  console.log('재고 체크 GET 요청 받음');
  try {
    await checkInventory();
    res.json({ message: '재고 체크가 완료되었습니다.' });
  } catch (error) {
    console.error('재고 체크 실행 중 오류:', error);
    res.status(500).json({ error: '재고 체크 실행 중 오류가 발생했습니다.' });
  }
});

router.post('/check-stock', async (req, res) => {
  try {
    await checkInventory();
    res.json({ message: '재고 체크가 완료되었습니다.' });
  } catch (error) {
    console.error('재고 체크 실행 중 오류:', error);
    res.status(500).json({ error: '재고 체크 실행 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 