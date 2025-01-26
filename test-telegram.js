import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = '7891601722:AAGWengCw7gmGJgu-2nw8hYKrJ425wyx0co';
const TELEGRAM_CHAT_ID = '878186883';

async function sendMessage() {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: '테스트 메시지입니다. 봇이 정상적으로 작동하는지 확인 중입니다.',
      }),
    });

    const data = await response.json();
    console.log('응답:', data);
  } catch (error) {
    console.error('오류:', error);
  }
}

sendMessage(); 