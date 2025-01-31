const schedule = require('node-schedule');
const { getDb } = require('./database/connection');
const { sendTelegramMessage } = require('./utils/telegram');

// 매일 오전 9시에 재고 상태 체크
const checkInventory = async () => {
  const db = getDb();
  try {
    // 현재 재고와 알림 상태를 함께 조회
    const query = `
      SELECT t.*, 
             (SELECT SUM(CASE 
                WHEN tt.type = 'in' THEN tt.quantity 
                WHEN tt.type = 'out' THEN -tt.quantity 
                ELSE 0 
              END)
              FROM tool_transactions tt 
              WHERE tt.tool_id = t.id) as current_stock,
             tn.id as notification_id,
             tn.resolved
      FROM tools t
      LEFT JOIN tool_notifications tn ON t.id = tn.tool_id AND tn.resolved = false
      WHERE t.status = 'active'
    `;

    const tools = await db.all(query);
    
    for (const tool of tools) {
      // 현재 재고가 안전재고보다 많으면 알림 해제
      if (tool.current_stock > tool.safety_stock && tool.notification_id) {
        await db.run(
          'UPDATE tool_notifications SET resolved = true WHERE id = ?',
          [tool.notification_id]
        );
        continue;
      }

      // 현재 재고가 안전재고 이하이고 아직 알림을 보내지 않은 경우에만 알림 발송
      if (tool.current_stock <= tool.safety_stock && !tool.notification_id) {
        // 텔레그램 메시지 전송
        const message = `⚠️ 안전재고 미달 알림\n\n공구: ${tool.name} (${tool.code})\n현재고: ${tool.current_stock}\n안전재고: ${tool.safety_stock}\n`;
        await sendTelegramMessage(message);

        // 알림 기록 저장
        await db.run(
          'INSERT INTO tool_notifications (tool_id) VALUES (?)',
          [tool.id]
        );
      }
    }
  } catch (error) {
    console.error('재고 체크 중 오류 발생:', error);
  }
};

// 스케줄러 시작
const startScheduler = () => {
  // 매일 오전 9시에 실행
  schedule.scheduleJob('0 9 * * *', checkInventory);
  console.log('재고 체크 스케줄러가 시작되었습니다.');
};

module.exports = {
  startScheduler,
  checkInventory  // 테스트를 위해 함수도 export
}; 