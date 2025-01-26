const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 연결
const db = new sqlite3.Database(
  path.join(__dirname, '../database/inventory.db'),
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error('데이터베이스 연결 실패:', err.message);
    } else {
      console.log('데이터베이스 연결 성공');
      
      // maintenances 테이블이 없을 경우에만 생성
      db.run(`CREATE TABLE IF NOT EXISTS maintenances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serial_no TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        photos TEXT,
        inspector TEXT NOT NULL,
        factory TEXT,
        department TEXT,
        line TEXT,
        status TEXT DEFAULT 'register',
        is_other INTEGER DEFAULT 0,
        scheduled_date TEXT NOT NULL,
        completed_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('테이블 생성 실패:', err.message);
        } else {
          console.log('테이블 준비 완료');
        }
      });

      // completed_maintenances 테이블이 없을 경우에만 생성
      db.run(`CREATE TABLE IF NOT EXISTS completed_maintenances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serial_no TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        photos TEXT,
        inspector TEXT NOT NULL,
        factory TEXT NOT NULL,
        department TEXT NOT NULL,
        line TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        is_other INTEGER DEFAULT 0,
        scheduled_date TEXT NOT NULL,
        completed_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('테이블 생성 실패:', err.message);
        } else {
          console.log('테이블 준비 완료');
        }
      });
    }
  }
);

// 유지보수 목록 조회
router.get('/', (req, res) => {
  console.log('GET /api/maintenances - 유지보수 목록 조회');
  const sql = 'SELECT * FROM maintenances ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('유지보수 목록 조회 실패:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('조회된 유지보수 목록:', rows);
    res.json(rows);
  });
});

// 완료된 기타 유지보수 목록 조회
router.get('/completed', (req, res) => {
  console.log('GET /api/maintenances/completed - 완료된 기타 유지보수 목록 조회');
  const sql = 'SELECT * FROM completed_maintenances WHERE is_other = 1 ORDER BY completed_date DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('완료된 기타 유지보수 목록 조회 실패:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('조회된 완료된 기타 유지보수 목록:', rows);
    res.json(rows);
  });
});

// 완료된 유지보수 상세 조회
router.get('/completed/:id', async (req, res) => {
  console.log(`GET /api/maintenances/completed/${req.params.id} - 완료된 유지보수 상세 조회 요청`);
  try {
    const sql = 'SELECT * FROM completed_maintenances WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
      if (err) {
        console.error('완료된 유지보수 상세 조회 실패:', err);
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        console.log('완료된 유지보수 정보를 찾을 수 없음');
        return res.status(404).json({ error: '완료된 유지보수 정보를 찾을 수 없습니다.' });
      }
      console.log('조회된 완료된 유지보수:', row);
      res.json(row);
    });
  } catch (error) {
    console.error('완료된 유지보수 상세 조회 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

// 유지보수 등록
router.post('/', (req, res) => {
  console.log('POST /api/maintenances - 유지보수 등록');
  const {
    serial_no,
    title,
    description,
    photos,
    inspector,
    factory,
    department,
    line,
    status,
    is_other,
    scheduled_date
  } = req.body;

  const sql = `
    INSERT INTO maintenances (
      serial_no,
      title,
      description,
      photos,
      inspector,
      factory,
      department,
      line,
      status,
      is_other,
      scheduled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    serial_no,
    title,
    description,
    photos || '[]',
    inspector,
    factory,
    department,
    line,
    status || 'register',
    is_other ? 1 : 0,
    scheduled_date
  ];

  console.log('실행할 SQL:', sql);
  console.log('파라미터:', params);

  db.run(sql, params, function(err) {
    if (err) {
      console.error('유지보수 등록 실패:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('유지보수 등록 성공 - ID:', this.lastID);
    res.json({
      id: this.lastID,
      message: '유지보수가 등록되었습니다.'
    });
  });
});

// 유지보수 수정
router.put('/:id', (req, res) => {
  console.log(`PUT /api/maintenances/${req.params.id} - 유지보수 수정`);
  const id = req.params.id;
  const {
    serial_no,
    title,
    description,
    photos,
    inspector,
    factory,
    department,
    line,
    status,
    is_other,
    scheduled_date,
    completed_date
  } = req.body;

  // 완료 처리인 경우
  if (status === 'completed') {
    // 1. completed_maintenances 테이블에 데이터 복사
    const insertSql = `
      INSERT INTO completed_maintenances (
        serial_no,
        title,
        description,
        photos,
        inspector,
        factory,
        department,
        line,
        status,
        is_other,
        scheduled_date,
        completed_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      serial_no,
      title,
      description,
      photos || '[]',
      inspector,
      factory,
      department,
      line,
      'completed',
      is_other ? 1 : 0,
      scheduled_date,
      completed_date || new Date().toISOString().split('T')[0]
    ];

    console.log('보전 작업 완료 처리 시작:', { id, title });

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // completed_maintenances 테이블에 삽입
      db.run(insertSql, insertParams, function(err) {
        if (err) {
          console.error('완료된 유지보수 저장 실패:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        console.log('완료된 유지보수 저장 성공');

        // maintenances 테이블에서 삭제
        db.run('DELETE FROM maintenances WHERE id = ?', [id], function(err) {
          if (err) {
            console.error('기존 유지보수 삭제 실패:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          console.log('기존 유지보수 삭제 성공');

          // 알림 생성
          console.log('알림 생성 시작');
          db.run(
            `INSERT INTO notifications (type, message, reference_id, reference_type, created_at)
             VALUES (?, ?, ?, ?, datetime("now", "localtime"))`,
            [
              'MAINTENANCE_COMPLETE',
              `${title} 보전 작업이 완료되었습니다.`,
              id,
              'maintenances'
            ],
            function(err) {
              if (err) {
                console.error('알림 생성 실패:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              console.log('알림 생성 완료');
              
              // notifications 테이블 조회
              db.all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5', [], (err, rows) => {
                if (err) {
                  console.error('알림 조회 실패:', err);
                } else {
                  console.log('최근 알림 목록:', rows);
                }
                
                db.run('COMMIT');
                console.log('유지보수 완료 처리 성공 - ID:', id);
                res.json({ message: '유지보수가 완료 처리되었습니다.' });
              });
            }
          );
        });
      });
    });
    return;
  }

  // 일반 수정인 경우 기존 로직 실행
  const sql = `
    UPDATE maintenances SET
      serial_no = ?,
      title = ?,
      description = ?,
      photos = ?,
      inspector = ?,
      factory = ?,
      department = ?,
      line = ?,
      status = ?,
      is_other = ?,
      scheduled_date = ?,
      completed_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    serial_no,
    title,
    description,
    photos || '[]',
    inspector,
    factory,
    department,
    line,
    status,
    is_other ? 1 : 0,
    scheduled_date,
    completed_date,
    id
  ];

  console.log('실행할 SQL:', sql);
  console.log('파라미터:', params);

  db.run(sql, params, function(err) {
    if (err) {
      console.error('유지보수 수정 실패:', err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '해당 유지보수를 찾을 수 없습니다.' });
    }
    console.log('유지보수 수정 성공 - ID:', id);
    res.json({ message: '유지보수가 수정되었습니다.' });
  });
});

// 유지보수 삭제
router.delete('/:id', (req, res) => {
  console.log(`DELETE /api/maintenances/${req.params.id} - 유지보수 삭제`);
  const id = req.params.id;
  
  db.run('DELETE FROM maintenances WHERE id = ?', id, function(err) {
    if (err) {
      console.error('유지보수 삭제 실패:', err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '해당 유지보수를 찾을 수 없습니다.' });
    }
    console.log('유지보수 삭제 성공 - ID:', id);
    res.json({ message: '유지보수가 삭제되었습니다.' });
  });
});

// 특정 설비의 보전 이력 조회
router.get('/equipment/:serial_no', async (req, res) => {
  try {
    const serial_no = decodeURIComponent(req.params.serial_no)
    console.log('요청된 시리얼 번호:', serial_no)
    
    const sql = `
      SELECT * FROM maintenances 
      WHERE serial_no = ? AND status = 'completed' AND is_other = 0
      UNION ALL
      SELECT * FROM completed_maintenances 
      WHERE serial_no = ? AND status = 'completed' AND is_other = 0
      ORDER BY scheduled_date DESC
    `
    
    db.all(sql, [serial_no, serial_no], (err, rows) => {
      if (err) {
        console.error('설비 보전 이력 조회 실패:', err)
        return res.status(500).json({ error: '설비 보전 이력 조회 중 오류가 발생했습니다.' })
      }
      console.log('조회된 보전 이력:', rows)
      res.json(rows)
    })
  } catch (error) {
    console.error('설비 보전 이력 조회 실패:', error)
    res.status(500).json({ error: '설비 보전 이력 조회 중 오류가 발생했습니다.' })
  }
})

// 보전 작업 완료 처리
router.put('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { completed_date } = req.body;
  
  console.log('보전 작업 완료 처리 시작:', { id, completed_date });
  
  try {
    // 보전 작업 정보 조회
    const maintenance = await db.get('SELECT * FROM maintenances WHERE id = ?', [id]);
    console.log('조회된 보전 작업:', maintenance);
    
    if (!maintenance) {
      return res.status(404).json({ error: '보전 작업을 찾을 수 없습니다.' });
    }

    // 완료 처리
    await db.run(
      'UPDATE maintenances SET status = ?, completed_date = ?, updated_at = datetime("now", "localtime") WHERE id = ?',
      ['completed', completed_date, id]
    );
    console.log('보전 작업 상태 업데이트 완료');

    // 알림 생성
    console.log('알림 생성 시작');
    await db.run(
      `INSERT INTO notifications (type, message, reference_id, reference_type)
       VALUES (?, ?, ?, ?)`,
      [
        'MAINTENANCE_COMPLETE',
        `${maintenance.title} 보전 작업이 완료되었습니다.`,
        maintenance.id,
        'maintenances'
      ]
    );
    console.log('알림 생성 완료');

    // notifications 테이블 조회
    const notifications = await db.all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
    console.log('최근 알림 목록:', notifications);

    res.json({ success: true });
  } catch (error) {
    console.error('보전 작업 완료 처리 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 