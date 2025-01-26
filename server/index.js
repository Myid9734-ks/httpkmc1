require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/connection');
const { startScheduler } = require('./services/inspectionScheduler');
const { scheduleQuickInspections } = require('./services/quickInspectionScheduler');
const { startScheduler: startInventoryScheduler } = require('./scheduler');
const authRoutes = require('./routes/auth');
const inspectionRoutes = require('./routes/inspections');
const linesRoutes = require('./routes/lines');
const handoversRouter = require('./routes/handovers');
const equipmentsRouter = require('./routes/equipments');
const toolsRouter = require('./routes/tools');
const processesRouter = require('./routes/processes');
const telegramRouter = require('./routes/telegram');
const equipmentInspectionsRouter = require('./routes/equipment-inspections');
const quickInspectionsRouter = require('./routes/quick-inspections');
const transfersRouter = require('./routes/transfers');
const maintenancesRouter = require('./routes/maintenances');
const inventoryRouter = require('./routes/inventory');
const ordersRouter = require('./routes/orders');
const notificationsRouter = require('./routes/notifications');

const app = express();

// 미들웨어
app.use(cors());

// body-parser 설정
app.use(express.json({
  strict: true,
  limit: '50mb'
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '50mb'
}));

// 디버그 미들웨어
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('[요청 정보]', {
      url: req.url,
      method: req.method,
      contentType: req.headers['content-type'],
      body: req.body,
      rawBody: req.rawBody
    });
  }
  next();
});

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/lines', linesRoutes);
app.use('/api/handovers', handoversRouter);
app.use('/api/equipments', equipmentsRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/processes', processesRouter);
app.use('/api/telegram', telegramRouter);
app.use('/api/equipment-inspections', equipmentInspectionsRouter);
app.use('/api/quick-inspections', quickInspectionsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/maintenances', maintenancesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/notifications', notificationsRouter);

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('[서버 에러]', {
    name: err.name,
    message: err.message,
    type: err.type,
    body: err.body
  });

  // JSON 파싱 에러 처리
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      message: '잘못된 요청 형식입니다. JSON 형식이 올바르지 않습니다.',
      error: err.message 
    });
  }

  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// 서버 시작 전 데이터베이스 초기화
async function startServer() {
  try {
    await initializeDatabase();
    await startScheduler();
    await scheduleQuickInspections();
    await startInventoryScheduler();
    const port = process.env.PORT || 3001;
    app.listen(port, '0.0.0.0', () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer(); 