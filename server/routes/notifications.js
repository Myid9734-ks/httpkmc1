const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');

// 최근 알림 목록 조회
router.get('/recent', async (req, res) => {
  try {
    const db = getDb();
    console.log('최근 알림 조회 시작');
    
    const query = `
      SELECT 
        n.id,
        n.type,
        n.message as title,
        n.created_at,
        n.read_at,
        CASE 
          WHEN n.type = 'TOOL_STOCK' THEN 'fa-solid fa-triangle-exclamation'
          WHEN n.type = 'TOOL_IN' THEN 'fa-solid fa-arrow-right-to-bracket'
          WHEN n.type = 'EQUIPMENT_CHECK' THEN 'fa-solid fa-calendar-check'
          WHEN n.type = 'MAINTENANCE_COMPLETE' THEN 'fa-solid fa-wrench'
        END as icon
      FROM notifications n
      WHERE n.deleted_at IS NULL
      ORDER BY n.created_at DESC
      LIMIT 10
    `;
    
    const notifications = await db.all(query);
    console.log('조회된 알림:', notifications);
    
    // 시간 형식 변환
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      time: formatTimeAgo(notification.created_at)
    }));
    
    res.json(formattedNotifications);
  } catch (error) {
    console.error('알림 조회 에러:', error);
    res.status(500).json({ error: '알림 목록을 가져오는데 실패했습니다.' });
  }
});

// 알림 읽음 처리
router.put('/:id/read', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    await db.run(
      'UPDATE notifications SET read_at = datetime("now", "localtime") WHERE id = ?',
      [id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('알림 읽음 처리 에러:', error);
    res.status(500).json({ error: '알림 읽음 처리에 실패했습니다.' });
  }
});

// 시간 형식 변환 함수 (예: "5분 전", "1시간 전" 등)
function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

module.exports = router; 