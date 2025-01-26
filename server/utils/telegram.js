const axios = require('axios');
const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;

async function sendTelegramMessage(message, type = 'individual') {
  try {
    // 설정 검증
    if (!TELEGRAM_BOT_TOKEN) {
      console.warn('텔레그램 봇 토큰이 설정되지 않았습니다.');
      return { success: false, error: '텔레그램 봇 토큰이 설정되지 않았습니다.' };
    }

    const chatId = type === 'group' ? TELEGRAM_GROUP_CHAT_ID : TELEGRAM_CHAT_ID;
    if (!chatId) {
      console.warn(`${type === 'group' ? '그룹' : '개인'} 채팅 ID가 설정되지 않았습니다.`);
      return { success: false, error: `${type === 'group' ? '그룹' : '개인'} 채팅 ID가 설정되지 않았습니다.` };
    }

    // HTTPS 에이전트 설정
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      family: 4,
      timeout: 10000
    });

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, 
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      },
      {
        timeout: 10000,
        httpsAgent,
        proxy: false,
        maxRedirects: 5,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    if (response.data.ok) {
      console.log('텔레그램 메시지 전송 성공:', response.data);
      return { success: true, data: response.data };
    } else {
      throw new Error('텔레그램 API 응답이 실패를 반환했습니다.');
    }
  } catch (error) {
    let errorMessage = '메시지 전송 중 오류가 발생했습니다.';
    
    if (error.code === 'ETIMEDOUT') {
      errorMessage = '텔레그램 서버 연결 시간이 초과되었습니다.';
    } else if (error.code === 'ENETUNREACH') {
      errorMessage = '텔레그램 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    } else if (error.response) {
      errorMessage = `텔레그램 API 오류: ${error.response.data.description || error.message}`;
    }
    
    console.error('텔레그램 메시지 전송 실패:', errorMessage, error);
    return { success: false, error: errorMessage };
  }
}

module.exports = {
  sendTelegramMessage
}; 