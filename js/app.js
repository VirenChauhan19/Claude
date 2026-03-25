/* HERO SELECTION APP LOGIC */

function selectHero(heroName) {
    const allCards = document.querySelectorAll('.card');
    const overlay = document.getElementById('selection-overlay');

    // Reset all cards from being 'selected'
    allCards.forEach(card => card.classList.remove('selected'));

    // Highlight the clicked card
    const targetCard = Array.from(allCards).find(card => card.innerText.includes(heroName));
    if (targetCard) {
        targetCard.classList.add('selected');
    }

    // Play a "Lock in" sound effect if you have one!
    // console.log("Hero locked:", heroName.toUpperCase());

    // Show the big hero selected text
    overlay.innerText = `Selected Hero: ${heroName}`;
    overlay.classList.add('show');
}
