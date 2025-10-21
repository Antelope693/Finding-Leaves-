const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 靜態文件服務
app.use(express.static(path.join(__dirname)));

// 主頁路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🎮 遊戲服務器運行在 http://localhost:${PORT}`);
    console.log('按 Ctrl+C 停止服務器');
});
