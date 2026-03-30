/* "AMAZING" HERO SELECT LOGIC */

let selectedHero = null;
let currentThumb = null;
let timeLeft = 60;

// Initialize Timer
const timerInterval = setInterval(() => {
    if (selectedHero) {
        clearInterval(timerInterval);
        return;
    }

    timeLeft--;
    const timerDisplay = document.getElementById('timer-count');
    if (timerDisplay) {
        timerDisplay.innerText = timeLeft;
        
        // Critical time warning
        if (timeLeft <= 10) {
            timerDisplay.style.color = "#ff4444";
            timerDisplay.style.textShadow = "0 0 20px #ff4444";
        }
    }

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
    }
}, 1000);

function handleTimeout() {
    if (!selectedHero) {
        const thumbs = document.querySelectorAll('.hero-thumb');
        if (thumbs.length > 0) {
            const randomIndex = Math.floor(Math.random() * thumbs.length);
            const randomThumb = thumbs[randomIndex];
            const img = randomThumb.querySelector('img');
            const name = img.alt.toUpperCase();
            const url = img.src;

            // Simulate selection and lock
            hoverHero(randomThumb, name, url);
            lockHero();

            const subHeader = document.getElementById('sub-header');
            subHeader.innerText = "TIME EXPIRED! RANDOM AGENT ASSIGNED: " + name;
            subHeader.style.color = "#ff4444";
        }
    }
}

function hoverHero(el, name, imgUrl) {
    if (selectedHero) return; // Don't change preview if someone is locked in

    currentThumb = el;
    const previewImg = document.getElementById('preview-img');
    const previewName = document.getElementById('preview-name');
    const lockBtn = document.getElementById('lock-btn');

    // Update Preview
    previewImg.src = imgUrl;
    previewImg.classList.add('active');
    previewName.innerText = name;
    
    // Show Lock In Button
    lockBtn.innerText = "Lock in " + name; 
    lockBtn.classList.add('show');
}

function leaveHero() {
    // Keep selection active so user can click the Lock button
}

function lockHero() {
    if (!currentThumb || selectedHero) return;

    const previewName = document.getElementById('preview-name');
    const lockBtn    = document.getElementById('lock-btn');
    const previewImg = document.getElementById('preview-img');
    const subHeader  = document.getElementById('sub-header');
    const previewArea = document.getElementById('preview-area');

    selectedHero = previewName.innerText;
    clearInterval(timerInterval);

    const timerDisplay = document.getElementById('timer-count');
    timerDisplay.innerText = '0';
    timerDisplay.style.color = '#ff4444';
    timerDisplay.style.textShadow = '0 0 20px #ff4444';

    // --- 1. Kick off cinematic sequence ---
    triggerLockAnimation(previewImg, previewName, previewArea);

    // --- 2. Apply locked state (thumb + header) ---
    currentThumb.classList.add('locked');
    subHeader.innerText = "AGENT LOCKED";
    subHeader.style.color = "#f99e1a";
    previewName.style.color = "#f99e1a";

    // --- 3. Button: charge pulse → slam in as READY ---
    lockBtn.classList.remove('btn-ready');
    lockBtn.classList.add('btn-charging');

    setTimeout(() => {
        lockBtn.classList.remove('btn-charging');
        lockBtn.innerText = "✓  READY";
        void lockBtn.offsetWidth;
        lockBtn.classList.add('btn-ready');
    }, 860);

    console.log("GAME START: " + selectedHero + " enters the battle!");
}

function triggerLockAnimation(previewImg, previewName, previewArea) {
    // Screen flash
    const flash = document.getElementById('lock-flash-overlay');
    flash.style.display = 'block';
    flash.classList.remove('active');
    void flash.offsetWidth; // force reflow to restart animation
    flash.classList.add('active');

    // Portrait slam
    previewImg.classList.remove('lock-anim');
    void previewImg.offsetWidth;
    previewImg.classList.add('lock-anim');

    // Name slam (slight delay)
    previewName.classList.remove('lock-anim');
    void previewName.offsetWidth;
    previewName.classList.add('lock-anim');

    // Preview area energy pulse
    previewArea.classList.remove('lock-pulse');
    void previewArea.offsetWidth;
    previewArea.classList.add('lock-pulse');

    // "AGENT LOCKED" banner (delayed for impact)
    const banner = document.getElementById('lock-banner');
    setTimeout(() => {
        banner.style.display = 'block';
        banner.classList.remove('active');
        void banner.offsetWidth;
        banner.classList.add('active');
    }, 120);

    // Shockwave rings — 3 staggered rings from image center
    const imgRect = previewImg.getBoundingClientRect();
    const cx = imgRect.left + imgRect.width / 2;
    const cy = imgRect.top + imgRect.height / 2;
    const ringColors = [
        'border: 3px solid rgba(255,255,255,0.9)',
        'border: 3px solid rgba(249,158,26,0.85)',
        'border: 2px solid rgba(0,174,255,0.7)'
    ];
    ringColors.forEach((style, i) => {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'shockwave-ring';
            ring.style.cssText = `left:${cx}px; top:${cy}px; width:${imgRect.width}px; height:${imgRect.height}px; ${style};`;
            document.body.appendChild(ring);
            setTimeout(() => ring.remove(), 900);
        }, i * 110);
    });

    // Shooting star burst + orbit particles
    shootingStarBurst(cx, cy);
    setTimeout(() => createOrbitParticles(cx, cy, imgRect.width / 2), 300);
}

function shootingStarBurst(cx, cy) {
    const count = 28;
    const colors = ['#ffffff', '#f99e1a', '#00aeff', '#ffffff', '#ffffff'];

    for (let i = 0; i < count; i++) {
        const delay = i * 18;
        setTimeout(() => {
            const angle  = (360 / count) * i + (Math.random() - 0.5) * 10;
            const length = 70 + Math.random() * 130;
            const thick  = 1.5 + Math.random() * 2;
            const color  = colors[Math.floor(Math.random() * colors.length)];
            const dur    = 450 + Math.random() * 300;

            const star = document.createElement('div');
            star.className = 'shooting-star';
            star.style.cssText = `
                left: ${cx}px; top: ${cy}px;
                width: ${length}px; height: ${thick}px;
                background: linear-gradient(to right, ${color}, transparent);
                transform: rotate(${angle}deg) scaleX(0);
            `;
            document.body.appendChild(star);

            star.animate([
                { transform: `rotate(${angle}deg) scaleX(0)`,    opacity: 1   },
                { transform: `rotate(${angle}deg) scaleX(1)`,    opacity: 0.9, offset: 0.55 },
                { transform: `rotate(${angle}deg) scaleX(1.15)`, opacity: 0   }
            ], { duration: dur, easing: 'ease-out', fill: 'forwards' });

            setTimeout(() => star.remove(), dur + 50);
        }, delay);
    }
}

function createOrbitParticles(cx, cy, radius) {
    // Remove any previous orbit wrapper
    const old = document.getElementById('orbit-wrapper');
    if (old) old.remove();

    const size = (radius + 38) * 2;
    const wrapper = document.createElement('div');
    wrapper.id = 'orbit-wrapper';
    wrapper.className = 'orbit-wrapper';
    wrapper.style.cssText = `left:${cx}px; top:${cy}px; width:${size}px; height:${size}px;`;
    document.body.appendChild(wrapper);

    // Config: [speed(s), delay(s), dotSize(px), color, isComet]
    const configs = [
        [2.4,  0,    8,  '#ffffff', false],
        [2.4, -0.8,  5,  '#00aeff', false],
        [2.4, -1.6,  6,  '#f99e1a', false],
        [3.2, -0.4, 10,  '#ffffff', true ],
        [3.2, -1.4,  4,  '#00aeff', false],
        [3.2, -2.4,  7,  '#f99e1a', true ],
        [1.8, -0.6,  5,  '#ffffff', false],
        [1.8, -1.1,  4,  '#00aeff', false],
    ];

    configs.forEach(([dur, delay, dotSize, color, isComet]) => {
        const ring = document.createElement('div');
        ring.className = 'orbit-ring';
        ring.style.animationDuration = `${dur}s`;
        ring.style.animationDelay    = `${delay}s`;

        const dot = document.createElement('div');
        dot.className = isComet ? 'orbit-dot comet' : 'orbit-dot';
        const glow = dotSize * 2.5;
        dot.style.cssText = `
            width: ${isComet ? dotSize * 2 : dotSize}px;
            height: ${isComet ? dotSize / 2 : dotSize}px;
            background: ${color};
            box-shadow: 0 0 ${glow}px ${color}, 0 0 ${glow * 2}px ${color};
        `;

        ring.appendChild(dot);
        wrapper.appendChild(ring);
    });
}
