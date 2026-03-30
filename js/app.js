/* "AMAZING" HERO SELECT LOGIC */

let selectedHero = null;
let currentThumb = null;
let timeLeft = 60;

// Initialize Timer
const timerInterval = setInterval(() => {
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
        const subHeader = document.getElementById('sub-header');
        subHeader.innerText = "TIME EXPIRED! Random agent assigned...";
        subHeader.style.color = "#ff4444";
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
    // We removed the logic that hides the button here.
    // In game UI like Overwatch, once you hover an agent, the preview 
    // stays until you hover another one. This lets you move your mouse 
    // to the "Lock In" button without it vanishing.
}

function lockHero() {
    if (!currentThumb) return;

    const previewName = document.getElementById('preview-name');
    const lockBtn = document.getElementById('lock-btn');
    const previewImg = document.getElementById('preview-img');
    const subHeader = document.getElementById('sub-header');

    selectedHero = previewName.innerText;
    
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
