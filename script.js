// === Параллакс при скролле окна ===
const parallaxItems = document.querySelectorAll('[data-speed]');
function updateParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxItems.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0;
        el.style.transform = `translateY(${-(scrollY * speed)}px)`;
    });
}
window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();

// === Движение от мыши для боковых веток и фонариков ===
const branchL = document.getElementById('branchLeft');
const branchR = document.getElementById('branchRight');
const lanterns = document.querySelectorAll('.lantern');
document.addEventListener('mousemove', function(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    if (window.innerWidth > 768) {
        if (branchL) branchL.style.transform = `translate(${x * 0.5}px, ${y * 0.3}px)`;
        if (branchR) branchR.style.transform = `translate(${-x * 0.5}px, ${y * 0.3}px)`;
        lanterns.forEach(l => {
            const sp = parseFloat(l.getAttribute('data-speed')) || 0.5;
            l.style.transform = `translate(${x * sp * 0.6}px, ${y * sp * 0.4}px)`;
        });
    }
});

// === Canvas: лепестки, светлячки, туман ===
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const PETALS = 70, FIREFLIES = 25, MIST = 8;
function rnd(min, max) { return Math.random() * (max - min) + min; }

function petal() {
    return {
        type: 'petal',
        x: rnd(0, W), y: rnd(-H, 0),
        size: rnd(5, 18),
        vy: rnd(0.4, 1.6), vx: rnd(-0.6, 0.6),
        rot: rnd(0, Math.PI*2), drot: rnd(-0.02, 0.02),
        opacity: rnd(0.4, 0.9),
        color: `rgba(255, ${rnd(150,190)}, ${rnd(180,220)}`
    };
}
function firefly() {
    return {
        type: 'firefly',
        x: rnd(0, W), y: rnd(0, H),
        size: rnd(2, 5),
        vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2),
        phase: rnd(0, Math.PI*2),
        base: rnd(0.3, 0.8)
    };
}
function mist() {
    return {
        type: 'mist',
        x: rnd(0, W), y: rnd(H*0.5, H),
        r: rnd(25, 60),
        vx: rnd(-0.08, 0.08),
        opacity: rnd(0.02, 0.05)
    };
}

for (let i=0; i<PETALS; i++) particles.push(petal());
for (let i=0; i<FIREFLIES; i++) particles.push(firefly());
for (let i=0; i<MIST; i++) particles.push(mist());

function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color + `, ${p.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size*0.6, p.size*0.3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(0, -p.size*0.2); ctx.lineTo(0, p.size*0.2); ctx.stroke();
    ctx.restore();
}
function drawFirefly(f) {
    const t = Date.now()*0.004 + f.phase;
    const glow = Math.sin(t)*0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255, 240, 150, ${f.base * glow})`;
    ctx.shadowColor = 'rgba(255, 240, 100, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
}
function drawMist(m) {
    const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
    grad.addColorStop(0, `rgba(255, 220, 240, ${m.opacity})`);
    grad.addColorStop(1, 'rgba(255, 220, 240, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI*2); ctx.fill();
}

function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
        if (p.type === 'petal') {
            p.y += p.vy; p.x += p.vx; p.rot += p.drot;
            if (p.y > H+50 || p.x<-50 || p.x>W+50) {
                p.x = rnd(0, W); p.y = -rnd(50, 200);
            }
            drawPetal(p);
        } else if (p.type === 'firefly') {
            p.x += p.vx; p.y += p.vy;
            if (p.x<0 || p.x>W) p.vx *= -1;
            if (p.y<0 || p.y>H) p.vy *= -1;
            drawFirefly(p);
        } else if (p.type === 'mist') {
            p.x += p.vx;
            if (p.x < -p.r) p.x = W + p.r;
            if (p.x > W + p.r) p.x = -p.r;
            drawMist(p);
        }
    });
    requestAnimationFrame(animate);
}
animate();

// === Модальное окно + скачивание файла из static ===
document.getElementById('downloadBtn').addEventListener('click', function() {
    // Открываем туториал
    document.getElementById('tutorialModal').classList.add('active');
    // Скачиваем файл
    const link = document.createElement('a');
    link.href = '/static/sakuraexp-script.txt';
    link.download = 'sakuraexp-script.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('tutorialModal').classList.remove('active');
});
document.getElementById('tutorialModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
});

// === Появление карточек ===
const cards = document.querySelectorAll('.feature-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.2 });
cards.forEach(c => observer.observe(c));

// Плавный скролл по якорям
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});      const text = chars[Math.floor(Math.random() * chars.length)];
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
