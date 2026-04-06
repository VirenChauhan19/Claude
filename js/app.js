/* "AMAZING" HERO SELECT LOGIC */

let selectedHero = null;
let currentThumb = null;
let timeLeft = 60;

// ── AUDIO ENGINE ──────────────────────────────────────────────────────────────
const SoundEngine = (() => {
    let ac = null;
    let bgMasterGain = null;
    let bgStarted = false;
    let nextBeatTimeout = null;

    function getCtx() {
        if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        return ac;
    }

    // Synthetic reverb via convolution noise burst
    function makeReverb(c, duration, decay) {
        const len = Math.ceil(c.sampleRate * duration);
        const buf = c.createBuffer(2, len, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++)
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
        const conv = c.createConvolver();
        conv.buffer = buf;
        return conv;
    }

    // ── BACKGROUND MUSIC ─────────────────────────────────────────────
    function startBg() {
        if (bgStarted) return;
        bgStarted = true;
        const c = getCtx();
        const now = c.currentTime;

        bgMasterGain = c.createGain();
        bgMasterGain.gain.setValueAtTime(0, now);
        bgMasterGain.gain.linearRampToValueAtTime(0.85, now + 2.5);
        bgMasterGain.connect(c.destination);

        const reverb = makeReverb(c, 2.8, 1.8);
        reverb.connect(bgMasterGain);
        const dry = c.createGain();
        dry.gain.value = 0.55;
        dry.connect(bgMasterGain);

        // Sub bass drone
        addDrone(c, dry,    'sine',     55,     0.38, 0.05);
        // Am tension chord cluster: A2, E3, G3, C4, A4
        addDrone(c, reverb, 'sawtooth', 110,    0.11, 0.18);
        addDrone(c, reverb, 'sawtooth', 164.81, 0.08, 0.25);
        addDrone(c, reverb, 'triangle', 196,    0.06, 0.31);
        addDrone(c, reverb, 'triangle', 261.63, 0.05, 0.22);
        addDrone(c, reverb, 'triangle', 440,    0.03, 0.14);

        scheduleBeat(c, dry);
        scheduleShimmer(c, reverb);
    }

    function addDrone(c, dest, type, freq, amp, lfoRate) {
        const o = c.createOscillator();
        const g = c.createGain();
        const filt = c.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = Math.min(freq * 5, 6000);
        filt.Q.value = 0.6;
        g.gain.value = amp;
        o.type = type;
        o.frequency.value = freq;
        if (lfoRate) {
            const lfo = c.createOscillator();
            const lfoG = c.createGain();
            lfo.frequency.value = lfoRate;
            lfoG.gain.value = freq * 0.003;
            lfo.connect(lfoG);
            lfoG.connect(o.frequency);
            lfo.start();
        }
        o.connect(filt); filt.connect(g); g.connect(dest);
        o.start();
    }

    // Ominous slow heartbeat (~43 BPM)
    function scheduleBeat(c, dest) {
        function beat() {
            if (!bgStarted) return;
            const now = c.currentTime;
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(130, now);
            o.frequency.exponentialRampToValueAtTime(42, now + 0.18);
            g.gain.setValueAtTime(0.55, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            o.connect(g); g.connect(dest);
            o.start(now); o.stop(now + 0.45);
            nextBeatTimeout = setTimeout(beat, 1400);
        }
        beat();
    }

    // Sparse high-frequency shimmer tones
    function scheduleShimmer(c, dest) {
        const notes = [1318.5, 1396.9, 1567.98, 1760, 1864.66, 2093];
        function shimmer() {
            if (!bgStarted) return;
            const now = c.currentTime;
            const freq = notes[Math.floor(Math.random() * notes.length)];
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = 'sine'; o.frequency.value = freq;
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.04, now + 0.04);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
            o.connect(g); g.connect(dest);
            o.start(now); o.stop(now + 1.7);
            setTimeout(shimmer, 900 + Math.random() * 2800);
        }
        setTimeout(shimmer, 1500);
    }

    // ── URGENCY STINGER (fires once at 10 seconds) ────────────────────
    function playUrgencyStinger() {
        const c = getCtx();
        const now = c.currentTime;

        // Duck background
        if (bgMasterGain) {
            bgMasterGain.gain.setValueAtTime(bgMasterGain.gain.value, now);
            bgMasterGain.gain.linearRampToValueAtTime(0.18, now + 0.28);
        }

        // Rising warning stabs — four ascending hits
        [[220, 0], [329.63, 0.05], [440, 0.1], [659.25, 0.16]].forEach(([freq, delay]) => {
            const t = now + delay;
            const o = c.createOscillator();
            const g = c.createGain();
            const f = c.createBiquadFilter();
            o.type = 'sawtooth'; o.frequency.value = freq;
            f.type = 'bandpass'; f.frequency.value = freq * 2.5; f.Q.value = 2;
            g.gain.setValueAtTime(0.2, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
            o.connect(f); f.connect(g); g.connect(c.destination);
            o.start(t); o.stop(t + 0.6);
        });

        // Sub impact underneath the stabs
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(150, now);
        o.frequency.exponentialRampToValueAtTime(38, now + 0.5);
        g.gain.setValueAtTime(0.7, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        o.connect(g); g.connect(c.destination);
        o.start(now); o.stop(now + 0.65);
    }

    // ── TICK SOUND (every second 10 → 1) ─────────────────────────────
    function playTick(secondsLeft) {
        const c = getCtx();
        const now = c.currentTime;
        const urgent = secondsLeft <= 5;

        // Shaped noise click
        const bufLen = Math.ceil(c.sampleRate * 0.065);
        const buf = c.createBuffer(1, bufLen, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++)
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 6);
        const src = c.createBufferSource();
        src.buffer = buf;
        const bp = c.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = urgent ? 3000 : 1800; bp.Q.value = 4;
        const g = c.createGain();
        g.gain.value = urgent ? 0.85 : 0.5;
        src.connect(bp); bp.connect(g); g.connect(c.destination);
        src.start(now);

        // Pitched undertone beneath the click
        const o = c.createOscillator();
        const og = c.createGain();
        o.type = 'sine'; o.frequency.value = urgent ? 1320 : 880;
        og.gain.setValueAtTime(urgent ? 0.12 : 0.07, now);
        og.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        o.connect(og); og.connect(c.destination);
        o.start(now); o.stop(now + 0.07);
    }

    // ── LOCK SOUND (layered, synced to visual phases) ─────────────────
    function playLockSound() {
        const c = getCtx();
        const now = c.currentTime;

        // Silence background
        if (bgMasterGain) {
            bgMasterGain.gain.setValueAtTime(bgMasterGain.gain.value, now);
            bgMasterGain.gain.linearRampToValueAtTime(0, now + 0.4);
        }
        if (nextBeatTimeout) clearTimeout(nextBeatTimeout);

        // t=0ms — Deep thud (sync: screen flash + portrait slam)
        const thud = c.createOscillator();
        const thudG = c.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(210, now);
        thud.frequency.exponentialRampToValueAtTime(38, now + 0.45);
        thudG.gain.setValueAtTime(1.0, now);
        thudG.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        thud.connect(thudG); thudG.connect(c.destination);
        thud.start(now); thud.stop(now + 0.6);

        // t=0ms — Whoosh (noise, filter sweeps high)
        const nLen = Math.ceil(c.sampleRate * 0.35);
        const nBuf = c.createBuffer(1, nLen, c.sampleRate);
        const nd = nBuf.getChannelData(0);
        for (let i = 0; i < nLen; i++) nd[i] = Math.random() * 2 - 1;
        const nSrc = c.createBufferSource(); nSrc.buffer = nBuf;
        const nFilt = c.createBiquadFilter();
        nFilt.type = 'highpass';
        nFilt.frequency.setValueAtTime(80, now);
        nFilt.frequency.exponentialRampToValueAtTime(6000, now + 0.18);
        const nG = c.createGain();
        nG.gain.setValueAtTime(0.38, now);
        nG.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        nSrc.connect(nFilt); nFilt.connect(nG); nG.connect(c.destination);
        nSrc.start(now);

        // t=80ms — Metallic ring (sync: portrait peak brightness)
        const t2 = now + 0.08;
        const ring = c.createOscillator();
        const rG = c.createGain();
        ring.type = 'sine'; ring.frequency.value = 2093; // C7
        rG.gain.setValueAtTime(0.28, t2);
        rG.gain.exponentialRampToValueAtTime(0.001, t2 + 1.5);
        ring.connect(rG); rG.connect(c.destination);
        ring.start(t2); ring.stop(t2 + 1.6);

        // t=120ms — A-major chord stab (sync: "AGENT LOCKED" banner slam)
        const t3 = now + 0.12;
        [880, 1108.73, 1318.51].forEach(f => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = 'sine'; o.frequency.value = f;
            g.gain.setValueAtTime(0.13, t3);
            g.gain.exponentialRampToValueAtTime(0.001, t3 + 1.0);
            o.connect(g); g.connect(c.destination);
            o.start(t3); o.stop(t3 + 1.1);
        });

        // t=200ms — Rising resolve (sync: name slam settling)
        const t4 = now + 0.2;
        const res = c.createOscillator();
        const resG = c.createGain();
        res.type = 'sine';
        res.frequency.setValueAtTime(440, t4);
        res.frequency.linearRampToValueAtTime(880, t4 + 0.22);
        resG.gain.setValueAtTime(0.18, t4);
        resG.gain.exponentialRampToValueAtTime(0.001, t4 + 0.75);
        res.connect(resG); resG.connect(c.destination);
        res.start(t4); res.stop(t4 + 0.8);
    }

    // ── HOVER SOUND ───────────────────────────────────────────────────
    function playHoverSound() {
        const c = getCtx();
        const now = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(550, now);
        o.frequency.linearRampToValueAtTime(770, now + 0.05);
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o.connect(g); g.connect(c.destination);
        o.start(now); o.stop(now + 0.14);
    }

    return { startBg, playUrgencyStinger, playTick, playLockSound, playHoverSound };
})();

// ── AUDIO BOOTSTRAP ───────────────────────────────────────────────────────────
// Browsers block AudioContext until a user gesture — start on first interaction
document.addEventListener('mousemove', () => SoundEngine.startBg(), { once: true });
document.addEventListener('click',     () => SoundEngine.startBg(), { once: true });

// ── TIMER ─────────────────────────────────────────────────────────────────────
const timerInterval = setInterval(() => {
    if (selectedHero) {
        clearInterval(timerInterval);
        return;
    }

    timeLeft--;
    const timerDisplay = document.getElementById('timer-count');
    if (timerDisplay) {
        timerDisplay.innerText = timeLeft;

        if (timeLeft === 10) {
            // One-shot urgency: pop animation + stinger + first tick
            timerDisplay.style.color = '#ff4444';
            timerDisplay.style.textShadow = '0 0 20px #ff4444, 0 0 40px rgba(255,68,68,0.4)';
            timerDisplay.classList.add('urgent-enter');
            setTimeout(() => {
                timerDisplay.classList.remove('urgent-enter');
                timerDisplay.classList.add('urgent');
            }, 640);
            SoundEngine.playUrgencyStinger();
            SoundEngine.playTick(10);
        } else if (timeLeft < 10 && timeLeft > 0) {
            // Per-tick micro flash + tick sound
            timerDisplay.classList.remove('tick-flash');
            void timerDisplay.offsetWidth; // force reflow to restart animation
            timerDisplay.classList.add('tick-flash');
            SoundEngine.playTick(timeLeft);
        } else if (timeLeft === 0) {
            SoundEngine.playTick(0);
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

            hoverHero(randomThumb, name, url);
            lockHero();

            const subHeader = document.getElementById('sub-header');
            subHeader.innerText = "TIME EXPIRED! RANDOM AGENT ASSIGNED: " + name;
            subHeader.style.color = "#ff4444";
        }
    }
}

function hoverHero(el, name, imgUrl) {
    if (selectedHero) return;

    currentThumb = el;
    const previewImg  = document.getElementById('preview-img');
    const previewName = document.getElementById('preview-name');
    const lockBtn     = document.getElementById('lock-btn');

    previewImg.src = imgUrl;
    previewImg.classList.add('active');
    previewName.innerText = name;
    lockBtn.innerText = "Lock in " + name;
    lockBtn.classList.add('show');

    SoundEngine.playHoverSound();
}

function leaveHero() {
    // Keep selection active so user can click Lock button
}

function lockHero() {
    if (!currentThumb || selectedHero) return;

    const previewName = document.getElementById('preview-name');
    const lockBtn     = document.getElementById('lock-btn');
    const previewImg  = document.getElementById('preview-img');
    const subHeader   = document.getElementById('sub-header');
    const previewArea = document.getElementById('preview-area');

    selectedHero = previewName.innerText;
    clearInterval(timerInterval);

    const timerDisplay = document.getElementById('timer-count');
    timerDisplay.innerText = '0';
    timerDisplay.style.color = '#ff4444';
    timerDisplay.style.textShadow = '0 0 20px #ff4444';

    // Cinematic lock sound — plays in sync with the visual phases below
    SoundEngine.playLockSound();

    // --- Cinematic visuals ---
    triggerLockAnimation(previewImg, previewName, previewArea);

    currentThumb.classList.add('locked');
    subHeader.innerText = "AGENT LOCKED";
    subHeader.style.color = "#f99e1a";
    previewName.style.color = "#f99e1a";

    // Button: charge pulse → READY slam
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
    void flash.offsetWidth;
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
    const old = document.getElementById('orbit-wrapper');
    if (old) old.remove();

    const size = (radius + 38) * 2;
    const wrapper = document.createElement('div');
    wrapper.id = 'orbit-wrapper';
    wrapper.className = 'orbit-wrapper';
    wrapper.style.cssText = `left:${cx}px; top:${cy}px; width:${size}px; height:${size}px;`;
    document.body.appendChild(wrapper);

    // [speed(s), delay(s), dotSize(px), color, isComet]
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
