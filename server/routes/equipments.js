const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

// 설비 목록 조회
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const equipments = await db.all(`
      SELECT 
        id, management_no, name, model, serial_no,
        manufacturer, manufacture_date, purchase_date,
        lifespan, factory, location, department,
        product_model, client, created_at, updated_at
      FROM equipments 
      ORDER BY created_at DESC
    `);
    console.log('설비 목록 조회 결과:', equipments);
    res.json(equipments);
  } catch (error) {
    console.error('설비 목록 조회 실패:', error);
    res.status(500).json({ error: '설비 목록을 불러오는데 실패했습니다.' });
  }
});

// 새로운 장비 목록 조회 (database/inventory.db 사용)
router.get('/from-database', async (req, res) => {
  try {
    console.log('데이터베이스 조회 시작');
    const dbPath = path.join(__dirname, '../database/inventory.db');
    console.log('데이터베이스 경로:', dbPath);
    
    if (!fs.existsSync(dbPath)) {
      console.error('데이터베이스 파일이 존재하지 않습니다:', dbPath);
      return res.status(500).json({ error: '데이터베이스 파일을 찾을 수 없습니다.' });
    }
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('데이터베이스 연결 성공');
    const equipments = await db.all(`
      SELECT 
        id, management_no, name, model, serial_no,
        manufacturer, manufacture_date, purchase_date,
        lifespan, factory, location, department,
        product_model, client, created_at, updated_at
      FROM equipments 
      ORDER BY created_at DESC
    `);
    
    console.log('조회된 장비 수:', equipments.length);
    console.log('조회된 장비 목록:', equipments);
    
    await db.close();
    res.json(equipments);
  } catch (error) {
    console.error('설비 목록 조회 실패:', error);
    res.status(500).json({ error: '설비 목록을 불러오는데 실패했습니다.' });
  }
});

// 설비 상세 조회 (이미지 포함)
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const equipment = await db.get('SELECT * FROM equipments WHERE id = ?', req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: '설비를 찾을 수 없습니다.' });
    }
    res.json(equipment);
  } catch (error) {
    console.error('설비 상세 조회 실패:', error);
    res.status(500).json({ error: '설비 정보를 불러오는데 실패했습니다.' });
  }
});

// 설비 등록
router.post('/', async (req, res) => {
  const {
    management_no, name, model, serial_no,
    manufacturer, manufacture_date, purchase_date,
    lifespan, factory, location, department,
    product_model, client, front_image, nameplate_image
  } = req.body;

  // 필수 필드 검증
  if (!serial_no || !front_image || !nameplate_image) {
    return res.status(400).json({ 
      error: 'SERIAL NO, 정면 사진, 명판 사진은 필수 항목입니다.' 
    });
  }

  try {
    const db = await getDb();
    
    // SERIAL NO 중복 검사
    const existing = await db.get('SELECT id FROM equipments WHERE serial_no = ?', serial_no);
    if (existing) {
      return res.status(400).json({ error: '이미 등록된 SERIAL NO입니다.' });
    }

    const result = await db.run(`
      INSERT INTO equipments (
        management_no, name, model, serial_no,
        manufacturer, manufacture_date, purchase_date,
        lifespan, factory, location, department,
        product_model, client, front_image, nameplate_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      management_no, name, model, serial_no,
      manufacturer, manufacture_date, purchase_date,
      lifespan, factory, location, department,
      product_model, client, front_image, nameplate_image
    ]);

    res.status(201).json({ 
      id: result.lastID,
      message: '설비가 성공적으로 등록되었습니다.' 
    });
  } catch (error) {
    console.error('설비 등록 실패:', error);
    res.status(500).json({ error: '설비 등록에 실패했습니다.' });
  }
});

// 설비 수정
router.put('/:id', async (req, res) => {
  const {
    management_no, name, model, serial_no,
    manufacturer, manufacture_date, purchase_date,
    lifespan, factory, location, department,
    product_model, client, front_image, nameplate_image
  } = req.body;

  // 필수 필드 검증
  if (!serial_no) {
    return res.status(400).json({ error: 'SERIAL NO는 필수 항목입니다.' });
  }

  try {
    const db = await getDb();
    
    // SERIAL NO 중복 검사 (자기 자신 제외)
    const existing = await db.get(
      'SELECT id FROM equipments WHERE serial_no = ? AND id != ?', 
      [serial_no, req.params.id]
    );
    if (existing) {
      return res.status(400).json({ error: '이미 등록된 SERIAL NO입니다.' });
    }

    const updateFields = [];
    const updateValues = [];

    // 동적으로 업데이트할 필드 생성
    const fields = {
      management_no, name, model, serial_no,
      manufacturer, manufacture_date, purchase_date,
      lifespan, factory, location, department,
      product_model, client
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    // 이미지 필드 추가
    if (front_image) {
      updateFields.push('front_image = ?');
      updateValues.push(front_image);
    }
    if (nameplate_image) {
      updateFields.push('nameplate_image = ?');
      updateValues.push(nameplate_image);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.params.id);

    const query = `
      UPDATE equipments 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.run(query, updateValues);
    res.json({ message: '설비 정보가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('설비 수정 실패:', error);
    res.status(500).json({ error: '설비 정보 수정에 실패했습니다.' });
  }
});

// 설비 삭제
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();

    // 1. 삭제할 설비 정보 조회
    const equipment = await db.get('SELECT * FROM equipments WHERE id = ?', req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: '설비를 찾을 수 없습니다.' });
    }

    // 2. equipment_transfers 테이블에 이력 저장
    await db.run(`
      INSERT INTO equipment_transfers (
        equipment_id, management_no, name, model, serial_no,
        manufacturer, manufacture_date, purchase_date, lifespan,
        factory, location, department, product_model, client,
        front_image, nameplate_image, reason,
        transfer_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      equipment.id, equipment.management_no, equipment.name, equipment.model, equipment.serial_no,
      equipment.manufacturer, equipment.manufacture_date, equipment.purchase_date, equipment.lifespan,
      equipment.factory, equipment.location, equipment.department, equipment.product_model, equipment.client,
      equipment.front_image, equipment.nameplate_image, req.body.reason || '설비 삭제'
    ]);

    // 3. 설비 삭제
    await db.run('DELETE FROM equipments WHERE id = ?', req.params.id);

    res.json({ message: '설비가 삭제되었습니다.' });
  } catch (error) {
    console.error('설비 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '설비 삭제 중 오류가 발생했습니다.' });
  }
});

// 설비 이관 이력 저장
router.post('/equipment-transfers', async (req, res) => {
  try {
    const db = await getDb();
    
    const {
      equipment_id, management_no, name, model, serial_no,
      manufacturer, manufacture_date, purchase_date, lifespan,
      factory, location, department, product_model, client,
      front_image, nameplate_image, reason
    } = req.body;

    await db.run(`
      INSERT INTO equipment_transfers (
        equipment_id, management_no, name, model, serial_no,
        manufacturer, manufacture_date, purchase_date, lifespan,
        factory, location, department, product_model, client,
        front_image, nameplate_image, reason,
        transfer_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      equipment_id, management_no, name, model, serial_no,
      manufacturer, manufacture_date, purchase_date, lifespan,
      factory, location, department, product_model, client,
      front_image, nameplate_image, reason
    ]);

    res.json({ message: '이관 이력이 저장되었습니다.' });
  } catch (error) {
    console.error('이관 이력 저장 실패:', error);
    res.status(500).json({ error: '이관 이력 저장 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 