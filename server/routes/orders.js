const express = require('express');
const router = express.Router();
const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const fs = require('fs');

router.post('/create', async (req, res) => {
  try {
    const { toolData, userName } = req.body;

    // 1. 템플릿 파일 경로 설정
    const templatePath = path.join(__dirname, '../../src/ikc_buy.xlsx');
    if (!fs.existsSync(templatePath)) {
      throw new Error('템플릿 파일을 찾을 수 없습니다.');
    }

    // 2. temp 디렉토리 생성
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 3. 템플릿 파일 복사
    const tempFilePath = path.join(tempDir, `order_${Date.now()}.xlsx`);
    fs.copyFileSync(templatePath, tempFilePath);

    // 4. 복사된 파일 열기
    const workbook = await XlsxPopulate.fromFileAsync(tempFilePath);
    const sheet = workbook.sheet('구매 요청서');

    // 5. 데이터 입력
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;
    sheet.cell('C5').value(dateStr);
    sheet.cell('L5').value(userName || '사용자');
    sheet.cell('C7').value(toolData.name);
    sheet.cell('H7').value(toolData.specification);
    sheet.cell('Q7').value('1');

    // 6. 파일 저장
    await workbook.toFileAsync(tempFilePath);

    // 7. 파일 전송 및 삭제
    res.download(tempFilePath, (err) => {
      if (err) {
        console.error('파일 전송 오류:', err);
      }
      fs.unlinkSync(tempFilePath);
    });

  } catch (error) {
    console.error('발주서 생성 오류:', error);
    res.status(500).json({ error: error.message || '발주서 생성 실패' });
  }
});

module.exports = router;
