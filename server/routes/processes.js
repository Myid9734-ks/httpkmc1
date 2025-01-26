const express = require('express');
const router = express.Router();
const { initializeDatabase } = require('../database/connection');

// 모든 공정 조회
router.get('/', async (req, res) => {
    try {
        const db = await initializeDatabase();
        const processes = await db.all('SELECT * FROM processes WHERE status = "active" ORDER BY created_at DESC');
        res.json(processes);
    } catch (error) {
        console.error('공정 목록 조회 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 단일 공정 조회
router.get('/:id', async (req, res) => {
    try {
        const db = await initializeDatabase();
        const process = await db.get('SELECT * FROM processes WHERE id = ? AND status = "active"', [req.params.id]);
        if (!process) {
            return res.status(404).json({ error: '공정을 찾을 수 없습니다.' });
        }
        res.json(process);
    } catch (error) {
        console.error('공정 조회 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 공정 생성
router.post('/', async (req, res) => {
    try {
        console.log('[POST] /api/processes - 요청 데이터:', JSON.stringify(req.body, null, 2));
        
        const { 
            name, processCode, ct, setupTime, isInternal, 
            description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine 
        } = req.body;

        console.log('[POST] /api/processes - 파싱된 데이터:', {
            name, processCode, ct, setupTime, isInternal,
            description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine
        });

        const db = await initializeDatabase();

        // 필수 필드 검증
        if (!name || !processCode) {
            console.log('[POST] /api/processes - 필수 필드 누락:', { name, processCode });
            return res.status(400).json({ error: '공정명과 공정코드는 필수 항목입니다.' });
        }

        if (isInternal === undefined || isInternal === null) {
            console.log('[POST] /api/processes - 공정구분 누락:', { isInternal });
            return res.status(400).json({ error: '공정구분은 필수 항목입니다.' });
        }

        // 공정코드 중복 검사
        const existing = await db.get(
            'SELECT id FROM processes WHERE processCode = ? AND selectedLine = ? AND status = "active"', 
            [processCode, selectedLine]
        );
        if (existing) {
            console.log('[POST] /api/processes - 중복된 공정코드:', { processCode, selectedLine });
            return res.status(400).json({ error: '동일한 라인에 이미 존재하는 공정코드입니다.' });
        }

        // 라인 ID 유효성 검사
        if (selectedFactory) {
            const factory = await db.get('SELECT id FROM lines WHERE id = ? AND level = 1', [selectedFactory]);
            if (!factory) {
                console.log('[POST] /api/processes - 유효하지 않은 공장:', { selectedFactory });
                return res.status(400).json({ error: '유효하지 않은 공장입니다.' });
            }
        }
        if (selectedDepartment) {
            const department = await db.get('SELECT id FROM lines WHERE id = ? AND level = 2', [selectedDepartment]);
            if (!department) {
                console.log('[POST] /api/processes - 유효하지 않은 부서:', { selectedDepartment });
                return res.status(400).json({ error: '유효하지 않은 부서입니다.' });
            }
        }
        if (selectedLine) {
            const line = await db.get('SELECT id FROM lines WHERE id = ? AND level = 3', [selectedLine]);
            if (!line) {
                console.log('[POST] /api/processes - 유효하지 않은 라인:', { selectedLine });
                return res.status(400).json({ error: '유효하지 않은 라인입니다.' });
            }
        }

        if (selectedSubLine) {
            const subLine = await db.get('SELECT id FROM lines WHERE id = ? AND level = 4', [selectedSubLine]);
            if (!subLine) {
                console.log('[POST] /api/processes - 유효하지 않은 서브라인:', { selectedSubLine });
                return res.status(400).json({ error: '유효하지 않은 서브라인입니다.' });
            }
        }

        console.log('[POST] /api/processes - SQL 실행 데이터:', {
            name, processCode, ct, setupTime, isInternal: isInternal ? 1 : 0,
            description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine
        });

        const result = await db.run(
            `INSERT INTO processes (
                name, processCode, ct, setupTime, isInternal,
                description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, processCode, ct, setupTime, isInternal ? 1 : 0,
             description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine]
        );

        const newProcess = await db.get('SELECT * FROM processes WHERE id = ?', [result.lastID]);
        console.log('[POST] /api/processes - 생성된 데이터:', newProcess);
        res.status(201).json(newProcess);
    } catch (error) {
        console.error('[POST] /api/processes - 오류 발생:', {
            message: error.message,
            stack: error.stack,
            error
        });
        res.status(500).json({ error: error.message });
    }
});

// 공정 수정
router.put('/:id', async (req, res) => {
    const { 
        name, processCode, ct, setupTime, isInternal,
        description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine, status 
    } = req.body;
    
    try {
        const db = await initializeDatabase();

        // 필수 필드 검증
        if (!name || !processCode) {
            return res.status(400).json({ error: '공정명과 공정코드는 필수 항목입니다.' });
        }

        // 공정코드 중복 검사 (자기 자신 제외)
        const existing = await db.get(
            'SELECT id FROM processes WHERE processCode = ? AND id != ?',
            [processCode, req.params.id]
        );
        if (existing) {
            return res.status(400).json({ error: '이미 존재하는 공정코드입니다.' });
        }

        await db.run(
            `UPDATE processes SET 
                name = ?, processCode = ?, ct = ?, setupTime = ?, isInternal = ?,
                description = ?, selectedFactory = ?, selectedDepartment = ?, selectedLine = ?,
                selectedSubLine = ?, status = ?
            WHERE id = ?`,
            [name, processCode, ct, setupTime, isInternal ? 1 : 0,
             description, selectedFactory, selectedDepartment, selectedLine, selectedSubLine,
             status || 'active', req.params.id]
        );

        const updatedProcess = await db.get('SELECT * FROM processes WHERE id = ?', [req.params.id]);
        if (!updatedProcess) {
            return res.status(404).json({ error: '공정을 찾을 수 없습니다.' });
        }
        res.json(updatedProcess);
    } catch (error) {
        console.error('공정 수정 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

// 공정 삭제 (소프트 삭제)
router.delete('/:id', async (req, res) => {
    try {
        const db = await initializeDatabase();
        const result = await db.run(
            'UPDATE processes SET status = "inactive" WHERE id = ?',
            [req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: '공정을 찾을 수 없습니다.' });
        }

        res.json({ message: '공정이 삭제되었습니다.' });
    } catch (error) {
        console.error('공정 삭제 실패:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 