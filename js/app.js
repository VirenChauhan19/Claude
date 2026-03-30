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

    // --- 1. Kick off cinematic sequence ---
    triggerLockAnimation(previewImg, previewName, previewArea);

    // --- 2. Apply locked state (thumb + header) ---
    currentThumb.classList.add('locked');
    subHeader.innerText = "AGENT LOCKED";
    subHeader.style.color = "#f99e1a";
    previewName.style.color = "#f99e1a";

    // --- 3. Update button after animation settles ---
    setTimeout(() => {
        lockBtn.innerText = "READY";
        lockBtn.style.background = "white";
        lockBtn.classList.add('locked-btn-anim');
    }, 900);

    console.log("GAME START: " + selectedHero + " enters the battle!");
}

function triggerLockAnimation(previewImg, previewName, previewArea) {
    // Screen flash
    const flash = document.getElementById('lock-flash-overlay');
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
}
