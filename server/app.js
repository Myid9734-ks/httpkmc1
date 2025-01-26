const express = require('express')
const cors = require('cors')
const { startScheduler } = require('./services/inspectionScheduler')
const { initializeDatabase } = require('./database/connection')

const app = express()

// 미들웨어 설정
app.use(cors())
app.use(express.json())

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log('[요청]', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
  })
  next()
})

// 데이터베이스 초기화
initializeDatabase().catch(console.error)

// 라우터 설정
console.log('라우터 로드 시작');

const authRouter = require('./routes/auth')
console.log('auth 라우터 로드됨');

const equipmentsRouter = require('./routes/equipments')
console.log('equipments 라우터 로드됨');

const transfersRouter = require('./routes/transfers')
console.log('transfers 라우터 로드됨');

const inspectionsRouter = require('./routes/inspections')
console.log('inspections 라우터 로드됨');

const quickInspectionsRouter = require('./routes/quick-inspections')
console.log('quick-inspections 라우터 로드됨');

const telegramRouter = require('./routes/telegram')
console.log('telegram 라우터 로드됨');

const maintenancesRouter = require('./routes/maintenances')
console.log('maintenances 라우터 로드됨');

const inventoryRouter = require('./routes/inventory')
console.log('inventory 라우터 로드됨');

const toolsRouter = require('./routes/tools');
const linesRouter = require('./routes/lines');
const ordersRouter = require('./routes/orders');
const notificationsRouter = require('./routes/notifications');
console.log('notifications 라우터 로드됨');

console.log('모든 라우터 로드 완료');

// 더 구체적인 경로를 먼저 매칭
console.log('라우터 등록 시작');

app.use('/api/auth', authRouter)
app.use('/api/equipments', equipmentsRouter)
app.use('/api/transfers', transfersRouter)
app.use('/api/inspections', inspectionsRouter)
app.use('/api/quick-inspections', quickInspectionsRouter)
app.use('/api/telegram', telegramRouter)
app.use('/api/maintenances', maintenancesRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/tools', toolsRouter);
app.use('/api/lines', linesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/notifications', notificationsRouter);

console.log('모든 라우터 등록 완료');

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

// 서버 포트 설정
const PORT = process.env.PORT || 3001

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  
  // D-day 체크 스케줄러 시작
  startScheduler()
  console.log('D-day 체크 스케줄러가 시작되었습니다.')
})

module.exports = app 