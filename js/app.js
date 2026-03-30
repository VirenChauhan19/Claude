/* "AMAZING" HERO SELECT LOGIC */

let selectedHero = null;
let currentThumb = null;

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
    lockBtn.innerText = `Lock in ${name}`;
    lockBtn.classList.add('show');
}

function leaveHero() {
    if (selectedHero) return;
    
    const previewImg = document.getElementById('preview-img');
    const lockBtn = document.getElementById('lock-btn');
    
    // Only hide if not locked in
    previewImg.classList.remove('active');
    lockBtn.classList.remove('show');
}

function lockHero() {
    if (!currentThumb) return;

    const previewName = document.getElementById('preview-name');
    const lockBtn = document.getElementById('lock-btn');
    const previewImg = document.getElementById('preview-img');

    selectedHero = previewName.innerText;
    
    // Apply locked class to thumb
    currentThumb.classList.add('locked');
    
    // Visual Polish for "Locked" state
    previewName.style.color = "#f99e1a";
    previewImg.style.borderColor = "white";
    previewImg.style.boxShadow = "0 0 100px white";
    
    lockBtn.innerText = "HERO SELECTED";
    lockBtn.style.background = "white";
    lockBtn.classList.add('locked-btn-anim');
    
    console.log("GAME START: " + selectedHero + " enters the battle!");
}
