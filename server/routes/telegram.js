const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// 텔레그램 메시지 전송 엔드포인트
router.post('/send-message', async (req, res) => {
  try {
    const { message, type = 'group' } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // 메시지 타입에 따라 채팅방 ID 선택
    const chatId = type === 'group' 
      ? process.env.TELEGRAM_GROUP_CHAT_ID 
      : process.env.TELEGRAM_CHAT_ID;

    if (!chatId) {
      throw new Error(`${type === 'group' ? '단체' : '개인'} 채팅방 ID가 설정되지 않았습니다.`);
    }

    // 텔레그램 API 호출 전 디버깅 로그 추가
    console.log('전송 시도:', {
      type,
      chatId,
      message
    });

    // HTTPS 에이전트 설정
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
      family: 4, // IPv4만 사용
      timeout: 10000
    });

    // 텔레그램 API 호출
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      },
      {
        timeout: 10000,
        httpsAgent,
        proxy: false, // 프록시 사용 안 함
        maxRedirects: 5,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    if (response.data.ok) {
      console.log('전송 성공:', response.data);
      res.json({ 
        success: true, 
        message: `메시지가 성공적으로 ${type === 'group' ? '단체' : '개인'} 채팅방으로 전송되었습니다.` 
      });
    } else {
      throw new Error('텔레그램 메시지 전송 실패');
    }
  } catch (error) {
    console.error('텔레그램 메시지 전송 오류:', error);
    
    // 에러 메시지 상세화
    let errorMessage = '메시지 전송 중 오류가 발생했습니다.';
    if (error.code === 'ETIMEDOUT') {
      errorMessage = '텔레그램 서버 연결 시간이 초과되었습니다.';
    } else if (error.code === 'ENETUNREACH') {
      errorMessage = '텔레그램 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.message
    });
  }
});

module.exports = router; 