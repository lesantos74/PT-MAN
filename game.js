const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');

const TILE_SIZE = 24;
const MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,2,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,2,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,0,0,0,1,0,0,0,3,0,3,0,0,0,1,0,0,0,0],
    [3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3],
    [0,0,0,0,1,0,3,0,0,3,0,0,3,0,1,0,0,0,0],
    [3,3,3,3,1,3,3,0,3,3,3,0,3,3,1,3,3,3,3],
    [0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0],
    [3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3],
    [0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,2,1,0,1,1,1,1,1,3,1,1,1,1,1,0,1,2,0],
    [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

canvas.width = MAP[0].length * TILE_SIZE;
canvas.height = MAP.length * TILE_SIZE;

let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let gameWin = false;
let gameStarted = false;
let powerUpMode = false;
let powerUpTimer = null;

const player = {
    x: 9 * TILE_SIZE,
    y: 15 * TILE_SIZE,
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 2,
    radius: TILE_SIZE / 2 - 2
};

const enemies = [
    { x: 9 * TILE_SIZE, y: 9 * TILE_SIZE, dir: { x: 1, y: 0 }, speed: 1.5, type: 'picanha', color: '#ff4d4d' },
    { x: 8 * TILE_SIZE, y: 9 * TILE_SIZE, dir: { x: -1, y: 0 }, speed: 1.5, type: 'cerveja', color: '#ffd700' },
    { x: 10 * TILE_SIZE, y: 9 * TILE_SIZE, dir: { x: 0, y: -1 }, speed: 1.5, type: 'picanha', color: '#ff4d4d' },
    { x: 9 * TILE_SIZE, y: 8 * TILE_SIZE, dir: { x: 0, y: 1 }, speed: 1.5, type: 'cerveja', color: '#ffd700' }
];

function drawMap() {
    for (let row = 0; row < MAP.length; row++) {
        for (let col = 0; col < MAP[row].length; col++) {
            const tile = MAP[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (tile === 0) {
                ctx.fillStyle = '#0000ff'; // Walls
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#00008b';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (tile === 1) {
                ctx.fillStyle = '#ffffff'; // Dots
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 2) {
                // Pumpkins (Power Pellet)
                ctx.fillStyle = '#ff8c00';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 6, 0, Math.PI * 2);
                ctx.fill();
                // Little green stem
                ctx.fillStyle = '#008000';
                ctx.fillRect(x + TILE_SIZE/2 - 1, y + TILE_SIZE/2 - 8, 2, 4);
            }
        }
    }
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;

    if (playerImg.complete) {
        ctx.drawImage(playerImg, x, y, TILE_SIZE, TILE_SIZE);
    } else {
        // Fallback drawing (original code)
        const centerX = x + TILE_SIZE / 2;
        const centerY = y + TILE_SIZE / 2;
        
        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(centerX, centerY, player.radius, 0, Math.PI * 2);
        ctx.fill();

        // PT Hat
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(centerX - player.radius, centerY - player.radius, player.radius * 2, player.radius);
        
        // "PT" text on hat
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PT', centerX, centerY - player.radius/2 + 2);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 3, centerY + 2, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 3, centerY + 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const x = enemy.x;
        const y = enemy.y;

        if (powerUpMode) {
            // Transform into pumpkin image
            if (aboImg.complete) {
                ctx.drawImage(aboImg, x, y, TILE_SIZE, TILE_SIZE);
            } else {
                // Fallback while loading
                ctx.fillStyle = '#ff8c00';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, player.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            const img = enemy.type === 'picanha' ? picaImg : cervImg;
            if (img.complete) {
                ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
            } else {
                // Fallback while loading
                ctx.fillStyle = enemy.color;
                ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }
        }
    });
}

function canMove(entity, dir) {
    if (dir.x === 0 && dir.y === 0) return true;
    
    // Calculate next position
    const nextX = entity.x + dir.x * entity.speed;
    const nextY = entity.y + dir.y * entity.speed;
    
    const margin = 2; // Tolerance margin
    
    let checkX = nextX;
    let checkY = nextY;
    
    if (dir.x > 0) checkX = nextX + TILE_SIZE - margin;
    if (dir.x < 0) checkX = nextX + margin;
    if (dir.y > 0) checkY = nextY + TILE_SIZE - margin;
    if (dir.y < 0) checkY = nextY + margin;

    const col = Math.floor(checkX / TILE_SIZE);
    const row = Math.floor(checkY / TILE_SIZE);
    
    if (!MAP[row] || MAP[row][col] === undefined) return false;

    // Also check the "other" dimension to ensure we're centered enough to pass
    if (dir.x !== 0) {
        const rowTop = Math.floor((nextY + margin) / TILE_SIZE);
        const rowBottom = Math.floor((nextY + TILE_SIZE - margin) / TILE_SIZE);
        if (MAP[rowTop] && MAP[rowTop][col] === 0) return false;
        if (MAP[rowBottom] && MAP[rowBottom][col] === 0) return false;
    }
    if (dir.y !== 0) {
        const colLeft = Math.floor((nextX + margin) / TILE_SIZE);
        const colRight = Math.floor((nextX + TILE_SIZE - margin) / TILE_SIZE);
        if (MAP[row] && MAP[row][colLeft] === 0) return false;
        if (MAP[row] && MAP[row][colRight] === 0) return false;
    }

    return MAP[row][col] !== 0;
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type, duration) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playEatDot() { playSound(440, 'sine', 0.1); }
function playEatPower() { playSound(660, 'square', 0.2); }
function playEatEnemy() { playSound(880, 'triangle', 0.3); }
function playDeath() { playSound(110, 'sawtooth', 0.5); }

function update() {
    if (!gameStarted || gameOver || gameWin) return;

    // Try to turn
    if (player.nextDir.x !== 0 || player.nextDir.y !== 0) {
        if (player.nextDir.x === -player.dir.x && player.nextDir.y === -player.dir.y) {
            player.dir = { ...player.nextDir };
        } 
        else if (Math.abs(player.x % TILE_SIZE) < player.speed && Math.abs(player.y % TILE_SIZE) < player.speed) {
            if (canMove(player, player.nextDir)) {
                player.x = Math.round(player.x / TILE_SIZE) * TILE_SIZE;
                player.y = Math.round(player.y / TILE_SIZE) * TILE_SIZE;
                player.dir = { ...player.nextDir };
            }
        }
    }

    // Move
    if (canMove(player, player.dir)) {
        player.x += player.dir.x * player.speed;
        player.y += player.dir.y * player.speed;
    } else {
        player.x = Math.round(player.x / TILE_SIZE) * TILE_SIZE;
        player.y = Math.round(player.y / TILE_SIZE) * TILE_SIZE;
    }

    // Teleport (tunnels)
    if (player.x < -TILE_SIZE/2) player.x = canvas.width - TILE_SIZE/2;
    if (player.x > canvas.width) player.x = -TILE_SIZE/2;

    // Collect items
    const col = Math.round(player.x / TILE_SIZE);
    const row = Math.round(player.y / TILE_SIZE);
    
    if (MAP[row] && MAP[row][col] === 1) {
        MAP[row][col] = 3;
        score += 10;
        playEatDot();
        updateUI();
        checkWin();
    } else if (MAP[row] && MAP[row][col] === 2) {
        MAP[row][col] = 3;
        score += 50;
        playEatPower();
        activatePowerUp();
        showToasty();
        updateUI();
    }

    // Enemy movement
    enemies.forEach(enemy => {
        if (Math.abs(enemy.x % TILE_SIZE) < enemy.speed && Math.abs(enemy.y % TILE_SIZE) < enemy.speed) {
            const possibleDirs = [
                { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
            ].filter(d => {
                if (d.x === -enemy.dir.x && d.y === -enemy.dir.y) return false;
                return canMove(enemy, d);
            });

            if (possibleDirs.length > 0) {
                // Keep same direction if possible, otherwise turn
                if (!canMove(enemy, enemy.dir) || Math.random() < 0.3) {
                    enemy.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    enemy.x = Math.round(enemy.x / TILE_SIZE) * TILE_SIZE;
                    enemy.y = Math.round(enemy.y / TILE_SIZE) * TILE_SIZE;
                }
            } else {
                enemy.dir = { x: -enemy.dir.x, y: -enemy.dir.y };
            }
        }

        enemy.x += enemy.dir.x * enemy.speed;
        enemy.y += enemy.dir.y * enemy.speed;

        // Enemy collision
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist < TILE_SIZE * 0.8) {
            if (powerUpMode) {
                // Eat enemy
                score += 100;
                playEatEnemy();
                updateUI();
                resetEnemy(enemy);
            } else {
                // Lose life
                playDeath();
                die();
            }
        }
    });
}

const levelElement = document.getElementById('level');
const toastyContainer = document.getElementById('toasty-container');
const toastyAudio = new Audio('ladrao.mp3');
const gameoverContainer = document.getElementById('gameover-container');
const chupaAudio = new Audio('chupa.mp3');

// Enemy Images
const picaImg = new Image();
picaImg.src = 'pica.png';
const cervImg = new Image();
cervImg.src = 'cerv.png';
const aboImg = new Image();
aboImg.src = 'abo.png';
const playerImg = new Image();
playerImg.src = 'pt.png';

function showToasty() {
    toastyContainer.classList.remove('hidden');
    toastyContainer.classList.add('show');
    toastyAudio.currentTime = 0;
    toastyAudio.play().catch(e => console.log("Erro ao tocar áudio:", e));
    
    setTimeout(() => {
        toastyContainer.classList.remove('show');
        setTimeout(() => toastyContainer.classList.add('hidden'), 300);
    }, 1000);
}

function showGameOverEfect() {
    gameoverContainer.classList.remove('hidden');
    gameoverContainer.classList.add('show');
    chupaAudio.currentTime = 0;
    chupaAudio.play().catch(e => console.log("Erro ao tocar áudio:", e));
    
    setTimeout(() => {
        gameoverContainer.classList.remove('show');
        setTimeout(() => gameoverContainer.classList.add('hidden'), 300);
    }, 2000); // 2 seconds display for game over
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameOver = false;
    gameWin = false;
    gameStarted = false;
    
    // Reset enemies to original count
    enemies.length = 4;
    enemies.forEach((enemy, i) => {
        enemy.speed = 1.5;
    });

    // Reset map
    for (let r = 0; r < MAP.length; r++) {
        for (let c = 0; c < MAP[r].length; c++) {
            MAP[r][c] = ORIGINAL_MAP[r][c];
        }
    }

    resetPositions();
    updateUI();
    messageElement.textContent = 'Clique para Reiniciar';
    messageElement.classList.remove('hidden');
}

function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
}

function checkWin() {
    const remainingDots = MAP.flat().some(tile => tile === 1 || tile === 2);
    if (!remainingDots) {
        level++;
        if (level > 3) {
            gameWin = true;
            messageElement.textContent = 'VITÓRIA TOTAL! O POVO VENCEU!';
            messageElement.classList.remove('hidden');
            messageElement.style.color = '#00ff00';
        } else {
            messageElement.textContent = `NÍVEL ${level}!`;
            messageElement.classList.remove('hidden');
            gameStarted = false;
            setTimeout(() => {
                resetLevel();
                messageElement.classList.add('hidden');
                gameStarted = true;
            }, 2000);
        }
    }
}

function resetLevel() {
    // Restore dots and pumpkins
    for (let r = 0; r < MAP.length; r++) {
        for (let c = 0; c < MAP[r].length; c++) {
            if (ORIGINAL_MAP[r][c] === 1 || ORIGINAL_MAP[r][c] === 2) {
                MAP[r][c] = ORIGINAL_MAP[r][c];
            }
        }
    }
    
    // Increase enemy speed
    enemies.forEach(enemy => {
        enemy.speed += 0.5;
    });

    // Level 3 extras: more enemies and pumpkins
    if (level === 3) {
        // Add 2 more enemies
        enemies.push(
            { x: 9 * TILE_SIZE, y: 9 * TILE_SIZE, dir: { x: 1, y: 0 }, speed: 2.5, type: 'picanha', color: '#ff4d4d' },
            { x: 9 * TILE_SIZE, y: 9 * TILE_SIZE, dir: { x: -1, y: 0 }, speed: 2.5, type: 'cerveja', color: '#ffd700' }
        );
        
        // Add extra pumpkins in corners
        MAP[1][1] = 2;
        MAP[1][MAP[0].length - 2] = 2;
        MAP[MAP.length - 2][1] = 2;
        MAP[MAP.length - 2][MAP[0].length - 2] = 2;
    }

    resetPositions();
}

const ORIGINAL_MAP = MAP.map(row => [...row]);

function activatePowerUp() {
    powerUpMode = true;
    if (powerUpTimer) clearTimeout(powerUpTimer);
    powerUpTimer = setTimeout(() => {
        powerUpMode = false;
    }, 10000); // 10 seconds
}

function die() {
    lives--;
    updateUI();
    if (lives <= 0) {
        gameOver = true;
        messageElement.textContent = 'GAME OVER! CLIQUE PARA RECOMEÇAR';
        messageElement.classList.remove('hidden');
        messageElement.style.color = '#ff0000';
        showGameOverEfect();
    } else {
        resetPositions();
    }
}

function resetPositions() {
    player.x = 9 * TILE_SIZE;
    player.y = 15 * TILE_SIZE;
    player.dir = { x: 0, y: 0 };
    player.nextDir = { x: 0, y: 0 };
    
    enemies.forEach((enemy, i) => {
        resetEnemy(enemy);
    });
}

function resetEnemy(enemy) {
    enemy.x = 9 * TILE_SIZE;
    enemy.y = 9 * TILE_SIZE;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    drawEnemies();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', (e) => {
    if (gameOver || gameWin) {
        resetGame();
        return;
    }
    if (!gameStarted) {
        startGame();
        return;
    }
    switch(e.key) {
        case 'ArrowUp': player.nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': player.nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': player.nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': player.nextDir = { x: 1, y: 0 }; break;
    }
});

canvas.addEventListener('click', () => {
    if (gameOver || gameWin) {
        resetGame();
    } else if (!gameStarted) {
        startGame();
    }
});

function startGame() {
    gameStarted = true;
    messageElement.classList.add('hidden');
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    if (!gameStarted) startGame();
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    const threshold = 30; // Min distance for swipe

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
            player.nextDir = { x: dx > 0 ? 1 : -1, y: 0 };
        } else {
            player.nextDir = { x: 0, y: dy > 0 ? 1 : -1 };
        }
        // Reset start position to allow multiple turns in one move
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }
    
    e.preventDefault();
}, { passive: false });

// Virtual D-Pad controls
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

function handleControl(dir) {
    if (gameOver || gameWin) {
        resetGame();
        return;
    }
    if (!gameStarted) {
        startGame();
        return;
    }
    player.nextDir = dir;
}

btnUp.addEventListener('touchstart', (e) => { handleControl({ x: 0, y: -1 }); e.preventDefault(); }, { passive: false });
btnDown.addEventListener('touchstart', (e) => { handleControl({ x: 0, y: 1 }); e.preventDefault(); }, { passive: false });
btnLeft.addEventListener('touchstart', (e) => { handleControl({ x: -1, y: 0 }); e.preventDefault(); }, { passive: false });
btnRight.addEventListener('touchstart', (e) => { handleControl({ x: 1, y: 0 }); e.preventDefault(); }, { passive: false });

// Also add click for non-touch testing
btnUp.addEventListener('click', () => handleControl({ x: 0, y: -1 }));
btnDown.addEventListener('click', () => handleControl({ x: 0, y: 1 }));
btnLeft.addEventListener('click', () => handleControl({ x: -1, y: 0 }));
btnRight.addEventListener('click', () => handleControl({ x: 1, y: 0 }));

gameLoop();
