// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

// 根據屏幕大小動態設置畫布尺寸
function resizeCanvas() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    
    // 移動設備適配
    if (screenWidth <= 768) {
        // 手機和平板：使用較小的畫布
        canvas.width = Math.min(512, screenWidth - 20);
        canvas.height = Math.min(400, screenHeight - 200); // 高度變為三分之一
    } else {
        // 桌面設備：使用完整尺寸
        canvas.width = 1024;
        canvas.height = 700; // 高度變為三分之一 (960/3 = 320)
    }
}

// 初始化畫布大小
resizeCanvas();

// 監聽窗口大小變化
window.addEventListener('resize', resizeCanvas);

document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/antelope.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/leaf.png";

// Game objects
var antelope = {
	speed: 256 // movement in pixels per second
};
var leaf = {};
var leavesCollected = 0;

// 葉子發光效果相關變量
var leafSpawnTime = 0;  // 葉子生成時間
var leafGlowEffect = false;  // 是否顯示發光效果
var glowIntensity = 0;  // 發光強度

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the antelope eats a leaf
var reset = function () {
	antelope.x = canvas.width / 2;
	antelope.y = canvas.height / 2;

	// Place the leaf somewhere on the screen randomly
	leaf.x = 32 + (Math.random() * (canvas.width - 64));
	leaf.y = 32 + (Math.random() * (canvas.height - 64));
	
	// 重置發光效果
	leafSpawnTime = Date.now();
	leafGlowEffect = false;
	glowIntensity = 0;
	
	// 停止發光音效
	if (typeof window !== 'undefined' && window.stopGlowSound) {
		window.stopGlowSound();
	}
};

// Update game objects
var update = function (modifier) {
	// WASD 鍵控制
	if (87 in keysDown || 38 in keysDown) { // W 鍵或上箭頭
		antelope.y -= antelope.speed * modifier;
	}
	if (83 in keysDown || 40 in keysDown) { // S 鍵或下箭頭
		antelope.y += antelope.speed * modifier;
	}
	if (65 in keysDown || 37 in keysDown) { // A 鍵或左箭頭
		antelope.x -= antelope.speed * modifier;
	}
	if (68 in keysDown || 39 in keysDown) { // D 鍵或右箭頭
		antelope.x += antelope.speed * modifier;
	}

	// 檢查葉子是否超過10秒未被抓住
	var currentTime = Date.now();
	var timeSinceSpawn = (currentTime - leafSpawnTime) / 1000; // 轉換為秒
	
	if (timeSinceSpawn >= 10) {
		leafGlowEffect = true;
		// 發光強度動畫效果
		glowIntensity = Math.sin(currentTime / 200) * 0.5 + 0.5; // 0-1之間波動
		
		// 開始播放發光音效
		if (typeof window !== 'undefined' && window.startGlowSound) {
			window.startGlowSound();
		}
	}

	// Are they touching?
	if (
		antelope.x <= (leaf.x + 32)
		&& leaf.x <= (antelope.x + 32)
		&& antelope.y <= (leaf.y + 32)
		&& leaf.y <= (antelope.y + 32)
	) {
		++leavesCollected;
		onLeafEaten(); // 調用吃葉子事件處理
		
		// 停止發光音效
		if (typeof window !== 'undefined' && window.stopGlowSound) {
			window.stopGlowSound();
		}
		
		reset();
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		// 拉伸背景圖片填滿整個畫布
		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, antelope.x, antelope.y);
	}

	if (monsterReady) {
		// 如果有發光效果，先繪製發光
		if (leafGlowEffect) {
			drawGlowEffect(leaf.x, leaf.y);
		}
		// 繪製葉子
		ctx.drawImage(monsterImage, leaf.x, leaf.y);
	}

	// 根據畫布大小調整字體大小
	var fontSize = canvas.width > 768 ? 24 : 16;
	var smallFontSize = canvas.width > 768 ? 18 : 12;
	
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = fontSize + "px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("葉子收集: " + leavesCollected, 16, 16);
	
	// 顯示倒計時（如果葉子還沒發光）
	if (!leafGlowEffect) {
		var currentTime = Date.now();
		var timeSinceSpawn = (currentTime - leafSpawnTime) / 1000;
		var timeLeft = Math.max(0, 10 - timeSinceSpawn);
		
		if (timeLeft > 0) {
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.font = smallFontSize + "px Helvetica";
			ctx.textAlign = "right";
			ctx.fillText("發光倒計時: " + timeLeft.toFixed(1) + "s", canvas.width - 16, 16);
		}
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// 繪製發光效果
function drawGlowEffect(x, y) {
	// 保存當前繪製狀態
	ctx.save();
	
	// 設置發光效果
	var glowRadius = 50 + (glowIntensity * 20); // 發光半徑
	var glowAlpha = 0.3 + (glowIntensity * 0.4); // 透明度
	
	// 創建徑向漸變
	var gradient = ctx.createRadialGradient(
		x + 16, y + 16, 0,  // 中心點
		x + 16, y + 16, glowRadius  // 外圈
	);
	
	// 設置漸變顏色（金黃色發光）
	gradient.addColorStop(0, `rgba(255, 215, 0, ${glowAlpha})`);
	gradient.addColorStop(0.5, `rgba(255, 165, 0, ${glowAlpha * 0.7})`);
	gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
	
	// 應用漸變
	ctx.fillStyle = gradient;
	
	// 繪製發光圓圈
	ctx.beginPath();
	ctx.arc(x + 16, y + 16, glowRadius, 0, Math.PI * 2);
	ctx.fill();
	
	// 添加外層光暈
	ctx.shadowColor = `rgba(255, 215, 0, ${glowIntensity * 0.8})`;
	ctx.shadowBlur = 30 + (glowIntensity * 20);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	
	// 繪製葉子輪廓的發光
	ctx.strokeStyle = `rgba(255, 215, 0, ${glowIntensity * 0.6})`;
	ctx.lineWidth = 3;
	ctx.strokeRect(x, y, 32, 32);
	
	// 恢復繪製狀態
	ctx.restore();
}

// 監聽遊戲事件
function onLeafEaten() {
	// 播放吃葉子音效
	if (typeof window !== 'undefined' && window.playEatSound) {
		window.playEatSound();
	}
	
	// 吃到葉子時短暫顯示消息
	if (typeof document !== 'undefined') {
		const originalTitle = document.title;
		document.title = "🍃 吃到葉子啦！";
		setTimeout(() => {
			document.title = originalTitle;
		}, 1000);
	}
}

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();
