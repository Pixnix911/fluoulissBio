document.addEventListener('DOMContentLoaded', () => {
  // ---- Stage management ----
  function showStage(stageId) {
    document.querySelectorAll('.stage').forEach(el => el.classList.remove('active'));
    document.getElementById(stageId).classList.add('active');
  }

  // ---- Canvas setup ----
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // ---- Background matrix rain (light) ----
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  const fontSize = 14;
  let columns, drops;
  function initRain() {
    columns = Math.floor(width / fontSize);
    drops = Array(columns).fill(0);
  }
  initRain();
  window.addEventListener('resize', initRain);

  function drawRain() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // ---- Pixel Door Animation ----
  // Define a simple door as a 2D grid (1 = door pixel, 0 = empty)
  const doorWidth = 20;
  const doorHeight = 30;
  const pixelSize = 15;
  let doorPixels = []; // array of {x, y, active, vx, vy}

  function createDoorGrid() {
    const grid = [];
    for (let row = 0; row < doorHeight; row++) {
      grid[row] = [];
      for (let col = 0; col < doorWidth; col++) {
        // Outline and handle area
        if (row === 0 || row === doorHeight-1 || col === 0 || col === doorWidth-1) {
          grid[row][col] = 1;
        } else if (col >= 7 && col <= 12 && row >= 10 && row <= 18) {
          // handle / lock area
          if (col === 7 || col === 12 || row === 10 || row === 18) {
            grid[row][col] = 1;
          } else if (col === 9 && row >= 13 && row <= 15) {
            grid[row][col] = 1; // keyhole
          } else {
            grid[row][col] = 0;
          }
        } else {
          grid[row][col] = 0;
        }
      }
    }
    return grid;
  }

  function initDoorPixels() {
    const grid = createDoorGrid();
    doorPixels = [];
    const startX = width/2 - (doorWidth * pixelSize)/2;
    const startY = height/2 - (doorHeight * pixelSize)/2;
    for (let row = 0; row < doorHeight; row++) {
      for (let col = 0; col < doorWidth; col++) {
        if (grid[row][col] === 1) {
          doorPixels.push({
            x: startX + col * pixelSize,
            y: startY + row * pixelSize,
            active: true,
            vx: 0,
            vy: 0
          });
        }
      }
    }
  }

  let doorOpening = false;
  let doorPhase = 'idle'; // idle, cracking, dispersing

  function startDoorAnimation() {
    doorOpening = true;
    doorPhase = 'cracking';
    initDoorPixels();
    // After a short delay, start dispersion
    setTimeout(() => {
      doorPhase = 'dispersing';
      // give each pixel a random velocity
      doorPixels.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 2; // bias upward
      });
    }, 2000); // show "DECRYPTING LOCK..." for 2 seconds
  }

  function drawDoor() {
    if (!doorOpening) return;
    ctx.fillStyle = '#00ff41';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 8;
    for (let p of doorPixels) {
      if (p.active) {
        ctx.fillRect(p.x, p.y, pixelSize-1, pixelSize-1);
        if (doorPhase === 'dispersing') {
          p.x += p.vx;
          p.y += p.vy;
          // fade out
          p.vx *= 0.98;
          p.vy *= 0.98;
          if (Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1) {
            p.active = false; // pixel gone
          }
        }
      }
    }
    ctx.shadowBlur = 0;
    // If all pixels gone, end animation and show riddle
    if (doorPhase === 'dispersing' && doorPixels.every(p => !p.active)) {
      doorOpening = false;
      showStage('riddle-stage');
    }
  }

  // ---- Main loop ----
  function animate() {
    drawRain(); // background rain
    if (doorOpening) {
      drawDoor();
    }
    requestAnimationFrame(animate);
  }
  animate();

  // ---- Stage 1: Quest password ----
  const passwordInput = document.getElementById('password-input');
  const submitPassword = document.getElementById('submit-password');
  const questError = document.getElementById('quest-error');

  submitPassword.addEventListener('click', async () => {
    const password = passwordInput.value.trim();
    if (password.length !== 3) {
      questError.textContent = '> ERROR: Access code must be exactly 3 digits.';
      return;
    }
    const response = await fetch('/check_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (data.success) {
      questError.textContent = '';
      showStage('door-stage');
      startDoorAnimation();
    } else {
      questError.textContent = '> ACCESS DENIED. Try again.';
    }
  });

  // ---- Stage 3: Riddle ----
  const riddleInput = document.getElementById('riddle-answer');
  const submitRiddle = document.getElementById('submit-riddle');
  const riddleError = document.getElementById('riddle-error');

  submitRiddle.addEventListener('click', async () => {
    const answer = riddleInput.value.trim();
    if (!answer) {
      riddleError.textContent = '> Input required.';
      return;
    }
    const response = await fetch('/check_riddle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    });
    const data = await response.json();
    if (data.success) {
      riddleError.textContent = '';
      showStage('bio-stage');
    } else {
      riddleError.textContent = '> DECRYPTION FAILED. Hint: center of the solar system.';
    }
  });

  // ---- Start on quest ----
  showStage('quest');
});