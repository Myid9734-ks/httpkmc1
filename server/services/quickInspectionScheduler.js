const schedule = require('node-schedule')
const { getDb } = require('../database/connection')
const { sendTelegramMessage } = require('../utils/telegram')

async function scheduleQuickInspections() {
  try {
    const db = await getDb()
    
    // DB에서 모든 간단점검 데이터 조회
    console.log('간단점검 목록 조회 시도')
    const quickInspections = await db.all('SELECT * FROM quick_inspections')
    console.log('간단점검 목록 조회 결과:', quickInspections)
    
    // 기존 스케줄 모두 취소
    for (let jobName in schedule.scheduledJobs) {
      schedule.scheduledJobs[jobName].cancel();
    }
    
    // 각 간단점검에 대해 스케줄 등록
    quickInspections.forEach(inspection => {
      const weekdays = JSON.parse(inspection.weekdays)
      
      // 각 요일별로 스케줄 등록 (오전 9시에 알림)
      weekdays.forEach(day => {
        const rule = new schedule.RecurrenceRule()
        rule.dayOfWeek = day
        rule.hour = 9
        rule.minute = 0
        
        schedule.scheduleJob(rule, async () => {
          const message = `[간단점검 알림]
점검항목: ${inspection.inspection_name}
점검주기: ${inspection.cycle}
담당자님 점검을 진행해주세요.`
          
          try {
            await sendTelegramMessage(message)
            console.log(`간단점검 알림 전송 완료: ${inspection.inspection_name}`)
          } catch (error) {
            console.error('텔레그램 메시지 전송 실패:', error)
          }
        })
      })
    })
    
    console.log('간단점검 스케줄러 설정 완료')
  } catch (error) {
    console.error('간단점검 스케줄러 설정 실패:', error)
  }
}

module.exports = {
  scheduleQuickInspections
} 