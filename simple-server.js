const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>🎉 서버 연결 성공!</h1>
        <p>AI 부모 교육 사이트 서버가 정상적으로 작동하고 있습니다.</p>
        <p>시간: ${new Date().toLocaleString('ko-KR')}</p>
        <a href="/test">테스트 페이지</a>
    `);
});

app.get('/test', (req, res) => {
    res.json({
        message: '테스트 성공!',
        timestamp: new Date().toISOString(),
        ip: req.ip
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 간단한 테스트 서버가 시작되었습니다!
📍 포트: ${PORT}
🌐 로컬 접속: http://localhost:${PORT}
🌐 WSL IP 접속: http://172.29.207.30:${PORT}
📅 시작 시간: ${new Date().toLocaleString('ko-KR')}
    `);
});