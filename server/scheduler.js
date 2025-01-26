const schedule = require('node-schedule');
const { getDb } = require('./database/connection');
const { sendTelegramMessage } = require('./utils/telegram');

// 매일 오전 9시에 재고 상태 체크
const checkInventory = async () => {
  const db = getDb();
  try {
    const query = `
      SELECT t.*, 
             (SELECT SUM(CASE 
                WHEN tt.type = 'in' THEN tt.quantity 
                WHEN tt.type = 'out' THEN -tt.quantity 
                ELSE 0 
              END)
              FROM tool_transactions tt 
              WHERE tt.tool_id = t.id) as current_stock
      FROM tools t
      WHERE t.status = 'active'
    `;

    const tools = await db.all(query);
    const lowStockTools = tools.filter(tool => 
      tool.current_stock !== null && 
      tool.current_stock <= tool.safety_stock
    );

    if (lowStockTools.length > 0) {
      // 텔레그램 메시지 전송
      const message = `⚠️ 안전재고 미달 알림\n\n${lowStockTools.map(tool => 
        `공구: ${tool.name} (${tool.code})\n` +
        `현재고: ${tool.current_stock}\n` +
        `안전재고: ${tool.safety_stock}\n`
      ).join('\n')}`;

      await sendTelegramMessage(message);

      // 각 공구별로 알림 생성
      for (const tool of lowStockTools) {
        const notificationMessage = `${tool.name} 공구의 재고가 ${tool.current_stock}개 남았습니다`;
        await db.run(`
          INSERT INTO notifications (type, message, reference_id, reference_type)
          VALUES (?, ?, ?, ?)
        `, ['TOOL_STOCK', notificationMessage, tool.id, 'tools']);
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