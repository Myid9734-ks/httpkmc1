const cron = require('node-cron')
const { getDb } = require('../database/connection')
const { sendTelegramMessage } = require('../utils/telegram')

// D-day 체크 함수
const checkDdayInspections = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const db = await getDb()

    console.log('D-day 체크 시작:', today.toISOString())

    // D-day인 점검 항목 조회
    const sql = `
      SELECT * FROM equipment_inspections 
      WHERE status = 'pending' 
      AND execution_due_date IS NULL 
      AND scheduled_date = ?
    `
    const ddayInspections = await db.all(sql, [today.toISOString().split('T')[0]])

    console.log(`D-day 항목 ${ddayInspections.length}개 발견`)

    // 각 D-day 항목에 대해 처리
    for (const inspection of ddayInspections) {
      try {
        // 실행기한 설정 (5일 후)
        const dueDate = new Date(today)
        dueDate.setDate(dueDate.getDate() + 5)

        console.log(`항목 처리 중 - ID: ${inspection.id}, 라인: ${inspection.line_name}`)

        // DB 업데이트
        await db.run(
          'UPDATE equipment_inspections SET execution_due_date = ? WHERE id = ?',
          [dueDate.toISOString().split('T')[0], inspection.id]
        )

        // 텔레그램 메시지 구성
        const message = `[설비점검 알림]
라인: ${inspection.line_name}
점검항목: ${inspection.inspection_name}
점검기준: ${inspection.inspection_standard}
예정일: ${inspection.scheduled_date}
실행기한: ${dueDate.toISOString().split('T')[0]}까지

※ ${dueDate.toISOString().split('T')[0]}까지 점검을 완료해주세요.`

        // 텔레그램 메시지 전송
        await sendTelegramMessage(message, 'group')
        console.log(`알림 전송 완료 - ID: ${inspection.id}`)

      } catch (error) {
        console.error(`항목 ${inspection.id} 처리 중 오류:`, error)
      }
    }

    console.log('D-day 체크 완료')
    return ddayInspections.length

  } catch (error) {
    console.error('D-day 체크 중 오류 발생:', error)
    throw error
  }
}

// 매일 자정에 실행되는 스케줄러 설정
const startScheduler = () => {
  console.log('D-day 체크 스케줄러 초기화...')

  // 즉시 한 번 실행
  console.log('초기 D-day 체크 실행...')
  checkDdayInspections()
    .then(count => console.log(`초기 D-day 체크 완료: ${count}개 항목 처리됨`))
    .catch(error => console.error('초기 D-day 체크 실패:', error))

  // 매일 자정(00:00)에 실행되도록 예약
  cron.schedule('0 0 * * *', async () => {
    console.log('일일 D-day 체크 실행:', new Date().toISOString())
    try {
      const count = await checkDdayInspections()
      console.log(`일일 D-day 체크 완료: ${count}개 항목 처리됨`)
    } catch (error) {
      console.error('일일 D-day 체크 실패:', error)
    }
  })

  console.log('D-day 체크 스케줄러 시작 완료')
}

module.exports = {
  startScheduler
} 