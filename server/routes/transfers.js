const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');

console.log('transfers 라우터가 로드됨');

// 이관 이력 조회
router.get('/', async (req, res) => {
  console.log('GET /api/transfers 요청 받음');
  try {
    const db = await getDb();
    console.log('DB 연결 성공');
    
    const transfers = await db.all(`
      SELECT * FROM equipment_transfers 
      ORDER BY transfer_date DESC
    `);
    console.log('조회된 이관 이력:', transfers);
    res.json(transfers);
  } catch (error) {
    console.error('이관 이력 조회 실패:', error);
    res.status(500).json({ error: '이관 이력 조회 중 오류가 발생했습니다.' });
  }
});

// 이관 이력 저장
router.post('/', async (req, res) => {
  console.log('POST /api/transfers 요청 받음');
  console.log('요청 데이터:', req.body);
  
  const {
    equipment_id,
    management_no,
    name,
    model,
    serial_no,
    manufacturer,
    manufacture_date,
    purchase_date,
    lifespan,
    factory,
    location,
    department,
    product_model,
    client,
    front_image,
    nameplate_image,
    reason
  } = req.body;

  try {
    const db = await getDb();
    console.log('DB 연결 성공');
    
    await db.run(`
      INSERT INTO equipment_transfers (
        equipment_id,
        management_no,
        name,
        model,
        serial_no,
        manufacturer,
        manufacture_date,
        purchase_date,
        lifespan,
        factory,
        location,
        department,
        product_model,
        client,
        front_image,
        nameplate_image,
        reason,
        transfer_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `, [
      equipment_id,
      management_no,
      name,
      model,
      serial_no,
      manufacturer,
      manufacture_date,
      purchase_date,
      lifespan,
      factory,
      location,
      department,
      product_model,
      client,
      front_image,
      nameplate_image,
      reason
    ]);
    console.log('이관 이력 저장 성공');

    res.json({ message: '이관 이력이 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('이관 이력 저장 실패:', error);
    console.error('에러 상세:', error.stack);
    res.status(500).json({ error: '이관 이력 저장 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 