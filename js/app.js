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
    const lockBtn = document.getElementById('lock-btn');
    const previewImg = document.getElementById('preview-img');
    const subHeader = document.getElementById('sub-header');

    selectedHero = previewName.innerText;
    clearInterval(timerInterval); // Stop timer on lock
    
    // Apply locked class to thumb
    currentThumb.classList.add('locked');
    
    // Update Header
    subHeader.innerText = "AGENT LOCKED";
    subHeader.style.color = "#f99e1a";
    
    // Visual Polish for "Locked" state
    previewName.style.color = "#f99e1a";
    previewImg.style.borderColor = "white";
    previewImg.style.boxShadow = "0 0 100px white";
    
    lockBtn.innerText = "READY";
    lockBtn.style.background = "white";
    lockBtn.classList.add('locked-btn-anim');
    
    console.log("GAME START: " + selectedHero + " enters the battle!");
}
