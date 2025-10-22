var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

function resizeCanvas() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    
    if (screenWidth <= 768) {
        canvas.width = Math.min(512, screenWidth - 20);
        canvas.height = Math.min(480, screenHeight - 200);
    } else {
        canvas.width = 1024;
        canvas.height = 700;
    }
}

resizeCanvas();

window.addEventListener('resize', function() {
    resizeCanvas();
    if (antelope && leaf) {
        antelope.x = canvas.width / 2;
        antelope.y = canvas.height / 2;
        leaf.x = Math.max(16, Math.min(canvas.width - 48, 32 + (Math.random() * (canvas.width - 64))));
        leaf.y = Math.max(16, Math.min(canvas.height - 48, 32 + (Math.random() * (canvas.height - 64))));
    }
});


var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/antelope.png";

var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/leaf.png";

var antelope = {
	speed: 256
};
var leaf = {};
var leavesCollected = 0;

var leafSpawnTime = 0;
var leafGlowEffect = false;
var glowIntensity = 0;

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var reset = function () {
	antelope.x = canvas.width / 2;
	antelope.y = canvas.height / 2;

	leaf.x = Math.max(16, Math.min(canvas.width - 48, 32 + (Math.random() * (canvas.width - 64))));
	leaf.y = Math.max(16, Math.min(canvas.height - 48, 32 + (Math.random() * (canvas.height - 64))));
	
	leafSpawnTime = Date.now();
	leafGlowEffect = false;
	glowIntensity = 0;
	
	if (typeof window !== 'undefined' && window.stopGlowSound) {
		window.stopGlowSound();
	}
};

var update = function (modifier) {
	if (87 in keysDown || 38 in keysDown) {
		antelope.y -= antelope.speed * modifier;
	}
	if (83 in keysDown || 40 in keysDown) {
		antelope.y += antelope.speed * modifier;
	}
	if (65 in keysDown || 37 in keysDown) {
		antelope.x -= antelope.speed * modifier;
	}
	if (68 in keysDown || 39 in keysDown) {
		antelope.x += antelope.speed * modifier;
	}
	
	antelope.x = Math.max(0, Math.min(canvas.width - 32, antelope.x));
	antelope.y = Math.max(0, Math.min(canvas.height - 32, antelope.y));

	var currentTime = Date.now();
	var timeSinceSpawn = (currentTime - leafSpawnTime) / 1000;
	
	if (timeSinceSpawn >= 10) {
		leafGlowEffect = true;
		glowIntensity = Math.sin(currentTime / 200) * 0.5 + 0.5;
		
		if (typeof window !== 'undefined' && window.startGlowSound) {
			window.startGlowSound();
		}
	}

	if (
		antelope.x <= (leaf.x + 32)
		&& leaf.x <= (antelope.x + 32)
		&& antelope.y <= (leaf.y + 32)
		&& leaf.y <= (antelope.y + 32)
	) {
		++leavesCollected;
		onLeafEaten();
		
		if (typeof window !== 'undefined' && window.stopGlowSound) {
			window.stopGlowSound();
		}
		
		reset();
	}
};

var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, antelope.x, antelope.y);
	}

	if (monsterReady) {
		if (leafGlowEffect) {
			drawGlowEffect(leaf.x, leaf.y);
		}
		ctx.drawImage(monsterImage, leaf.x, leaf.y);
	}

	var fontSize = canvas.width > 768 ? 24 : 16;
	var smallFontSize = canvas.width > 768 ? 18 : 12;
	
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = fontSize + "px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("葉子收集: " + leavesCollected, 16, 16);
	
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

function drawGlowEffect(x, y) {
	ctx.save();
	var glowRadius = 50 + (glowIntensity * 20);
	var glowAlpha = 0.3 + (glowIntensity * 0.4);
	var gradient = ctx.createRadialGradient(
		x + 16, y + 16, 0,
		x + 16, y + 16, glowRadius
	);
	gradient.addColorStop(0, `rgba(255, 215, 0, ${glowAlpha})`);
	gradient.addColorStop(0.5, `rgba(255, 165, 0, ${glowAlpha * 0.7})`);
	gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(x + 16, y + 16, glowRadius, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowColor = `rgba(255, 215, 0, ${glowIntensity * 0.8})`;
	ctx.shadowBlur = 30 + (glowIntensity * 20);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.strokeStyle = `rgba(255, 215, 0, ${glowIntensity * 0.6})`;
	ctx.lineWidth = 3;
	ctx.strokeRect(x, y, 32, 32);
	ctx.restore();
}

function onLeafEaten() {
	if (typeof window !== 'undefined' && window.playEatSound) {
		window.playEatSound();
	}
	if (typeof document !== 'undefined') {
		const originalTitle = document.title;
		document.title = "🍃 吃到葉子啦！";
		setTimeout(() => {
			document.title = originalTitle;
		}, 1000);
	}
}

var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	requestAnimationFrame(main);
};

var then = Date.now();
reset();
main();