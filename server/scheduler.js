const schedule = require('node-schedule');
const { initializeDatabase } = require('./database/connection');
const { sendTelegramMessage } = require('./utils/telegram');

// 재고 상태 체크 함수
const checkInventory = async () => {
  let db;
  try {
    console.log('[재고 체크] 시작');
    db = await initializeDatabase();

    // 1. 활성 공구 조회
    console.log('[재고 체크] 활성 공구 조회 시작');
    const tools = await db.all(`
      SELECT t.*, 
        COALESCE((
          SELECT SUM(CASE WHEN type = 'in' THEN quantity ELSE -quantity END)
          FROM tool_transactions 
          WHERE tool_id = t.id
        ), 0) as current_stock
      FROM tools t
      WHERE t.status = 'active'
    `);
    console.log(`[재고 체크] ${tools.length}개 활성 공구 조회됨`);

    // 각 공구별 처리
    for (const tool of tools) {
      try {
        // 현재 재고 계산
        const current_stock = tool.current_stock;
        
        // 알림 상태 확인
        const notification = await db.get(
          'SELECT id FROM tool_notifications WHERE tool_id = ? AND resolved = 0',
          [tool.id]
        );

        console.log(`[재고 체크] ${tool.name} (${tool.code}) - 현재재고: ${current_stock}, 안전재고: ${tool.safety_stock}`);

        // 현재 재고가 안전재고보다 많으면 알림 해제
        if (current_stock > tool.safety_stock && notification) {
          console.log(`[재고 체크] 알림 해제 - ${tool.name} (${tool.code})`);
          await db.run(
            'UPDATE tool_notifications SET resolved = 1 WHERE id = ?',
            [notification.id]
          );
          continue;
        }

        // 현재 재고가 안전재고 이하이고 아직 알림을 보내지 않은 경우에만 알림 발송
        if (current_stock <= tool.safety_stock && !notification) {
          console.log(`[재고 체크] 안전재고 미달 알림 발송 - ${tool.name} (${tool.code})`);
          
          // 텔레그램 메시지 전송
          const message = `⚠️ 안전재고 미달 알림\n\n공구: ${tool.name} (${tool.code})\n현재고: ${current_stock}\n안전재고: ${tool.safety_stock}\n`;
          await sendTelegramMessage(message);

          // 알림 기록 저장
          await db.run(
            'INSERT INTO tool_notifications (tool_id, resolved) VALUES (?, 0)',
            [tool.id]
          );
        }
      } catch (error) {
        console.error(`[재고 체크] 개별 공구 처리 중 오류 - ${tool.name} (${tool.code}):`, error);
      }
    }
    console.log('[재고 체크] 완료');
  } catch (error) {
    console.error('[재고 체크] 오류 발생:', error);
    throw error;
  }
};

// 스케줄러 시작
const startScheduler = () => {
  // 매일 오전 9시에 실행
  schedule.scheduleJob('0 9 * * *', async () => {
    try {
      await checkInventory();
      console.log('[스케줄러] 재고 체크 작업 완료');
    } catch (error) {
      console.error('[스케줄러] 재고 체크 작업 실패:', error);
    }
  });
  console.log('[스케줄러] 재고 체크 스케줄러가 시작되었습니다.');
};

module.exports = {
  startScheduler,
  checkInventory  // 테스트를 위해 함수도 export
}; 