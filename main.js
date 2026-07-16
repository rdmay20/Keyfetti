/* ============================
   Keyfetti - Enhanced Kids Typing Game
   ============================ */

import confetti from 'canvas-confetti';
import { buildShareText, buildSquares, shareOrCopy } from './share.js';

// Baloo 2, self-hosted. Only the latin subset and the three weights the CSS
// actually uses, so the bundle doesn't carry the whole family.
import '@fontsource/baloo-2/latin-400.css';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-800.css';

import './style.css';

// Simple sound synthesis (no external files needed)
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.frequency.setValueAtTime(600 + Math.random() * 200, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  playCelebrate() {
    if (!this.enabled) return;
    this.init();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(400 + i * 200, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
      }, i * 80);
    }
  }

  playMilestone() {
    if (!this.enabled) return;
    this.init();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.2);
      }, i * 100);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

const sounds = new SoundManager();

// Kid-friendly word list, grouped by length so Words mode ramps up gently.
// Kept concrete and picturable — things a young child can recognise and sound out.
const WORDS = [
  // 3 letters
  'CAT', 'DOG', 'SUN', 'BAT', 'HAT', 'PIG', 'CUP', 'BED', 'RUN', 'FUN',
  'BOX', 'FOX', 'RED', 'BIG', 'TOP', 'MAP', 'BUS', 'CAR', 'JAR', 'VAN',
  'BEE', 'COW', 'HEN', 'OWL', 'ANT', 'BUG', 'RAT', 'PUP', 'CUB', 'ELK',
  'EGG', 'JAM', 'PIE', 'BUN', 'NUT', 'FIG', 'YAM', 'PEA', 'OAT', 'TEA',
  'HAM', 'POT', 'PAN', 'MUG', 'TIN', 'KEY', 'BAG', 'TOY', 'PEN', 'KIT',
  'SKY', 'SEA', 'ICE', 'MUD', 'LOG', 'AIR', 'DEW', 'FOG', 'RAY', 'GEM',
  'ARM', 'EAR', 'EYE', 'LIP', 'TOE', 'LEG', 'HIP', 'JAW', 'RIB', 'GUM',
  'HOP', 'JOG', 'SIT', 'NAP', 'DIG', 'ROW', 'PAT', 'HUG', 'WAG', 'ZIP',
  'DAY', 'JOY', 'HUM', 'TAP', 'DOT', 'PIN', 'CAP', 'FAN', 'NET', 'WEB',

  // 4 letters
  'BIRD', 'FROG', 'DUCK', 'FISH', 'BEAR', 'LION', 'GOAT', 'LAMB', 'MOLE', 'CRAB',
  'WOLF', 'DEER', 'SEAL', 'MOTH', 'WASP', 'WORM', 'TOAD', 'SWAN', 'CROW', 'DOVE',
  'CAKE', 'MILK', 'RICE', 'CORN', 'BEAN', 'PEAR', 'PLUM', 'LIME', 'SOUP', 'SALT',
  'MOON', 'STAR', 'RAIN', 'SNOW', 'WIND', 'LEAF', 'TREE', 'ROSE', 'SAND', 'ROCK',
  'HAND', 'FOOT', 'HAIR', 'NOSE', 'FACE', 'KNEE', 'BACK', 'CHIN', 'PALM', 'NECK',
  'BOOK', 'BALL', 'DOOR', 'BELL', 'DESK', 'LAMP', 'SHOE', 'SOCK', 'COAT', 'RING',
  'BOAT', 'BIKE', 'TRAM', 'SHIP', 'KITE', 'DRUM', 'FLAG', 'GIFT', 'ROPE', 'DISH',
  'JUMP', 'WALK', 'SKIP', 'SING', 'READ', 'PLAY', 'DRAW', 'SWIM', 'CLAP', 'GROW',
  'WARM', 'SOFT', 'KIND', 'TALL', 'FAST', 'CALM', 'GOOD', 'BLUE', 'PINK', 'GOLD',

  // 5 letters
  'HORSE', 'SHEEP', 'MOUSE', 'TIGER', 'ZEBRA', 'KOALA', 'PANDA', 'SNAKE', 'WHALE', 'SHARK',
  'ROBIN', 'EAGLE', 'GOOSE', 'PUPPY', 'BUNNY', 'HIPPO', 'LLAMA', 'OTTER', 'SKUNK', 'MOOSE',
  'APPLE', 'BREAD', 'HONEY', 'GRAPE', 'PEACH', 'LEMON', 'BERRY', 'MANGO', 'OLIVE', 'CANDY',
  'BEACH', 'CLOUD', 'RIVER', 'STONE', 'GRASS', 'PLANT', 'STORM', 'FIELD', 'EARTH', 'OCEAN',
  'HOUSE', 'CHAIR', 'TABLE', 'CLOCK', 'BRUSH', 'PLATE', 'SPOON', 'LIGHT', 'BROOM', 'SHELF',
  'TRAIN', 'PLANE', 'TRUCK', 'WHEEL', 'BLOCK', 'PAINT', 'MUSIC', 'STORY', 'PARTY', 'DANCE',
  'SMILE', 'LAUGH', 'DREAM', 'HAPPY', 'SUNNY', 'MERRY', 'BRAVE', 'QUIET', 'SWEET', 'FUNNY',
  'GREEN', 'WHITE', 'BLACK', 'BROWN', 'CORAL', 'CREAM', 'SMALL', 'ROUND', 'SHINY', 'FRESH'
];

// Length of a Words round, in seconds.
const ROUND_SECONDS = 60;

// Game State
const gameState = {
  letterCount: 0,
  allowAllKeys: false,
  gameMode: 'free', // free, words
  targetWord: '',
  wordCharIndex: 0, // tracks position within current word
  darkMode: false,

  // Words round
  wordsCompleted: 0,
  roundDeadline: null, // timestamp; null until the first letter is typed
  roundTicker: null,
  roundOver: false,

  // Score to beat, from a shared ?c= link. Null when this isn't a challenge.
  // Survives Play again on purpose: a child gets as many attempts at it as they want.
  challengeTarget: null
};

// The ?c= value is the one piece of input this app takes from outside itself, and
// it ends up on screen — so it's parsed strictly rather than trusted. Anything that
// isn't a plain whole number in range is treated as no challenge at all.
// (It's still only ever written to the DOM via textContent, never innerHTML.)
const MAX_CHALLENGE = 999;

function readChallengeFromUrl() {
  const raw = new URLSearchParams(window.location.search).get('c');
  if (raw === null) return null;

  // Digits and nothing else — no sign, decimal point, exponent, whitespace or
  // padding — so Number() can't be talked into anything surprising. The range is
  // then the only limit, which keeps it honest if MAX_CHALLENGE ever moves.
  if (!/^\d+$/.test(raw)) return null;

  const score = Number(raw);
  if (score < 1 || score > MAX_CHALLENGE) return null;
  return score;
}

// Shuffle-bag word picker. Random picking repeated words constantly (with N words
// a repeat is likely within ~sqrt(N) draws), so instead we deal from a shuffled
// bag and only reshuffle once every word has been used.
const wordBag = {
  queue: [],
  lastWord: '',

  refill() {
    this.queue = WORDS.slice();
    // Fisher-Yates
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    // Avoid a back-to-back repeat across the bag boundary.
    if (this.queue[0] === this.lastWord && this.queue.length > 1) {
      [this.queue[0], this.queue[1]] = [this.queue[1], this.queue[0]];
    }
  },

  next() {
    if (this.queue.length === 0) this.refill();
    this.lastWord = this.queue.pop();
    return this.lastWord;
  }
};

// Milestone check
function checkMilestone() {
  const milestones = [10, 26, 50, 100, 200, 500];
  if (milestones.includes(gameState.letterCount)) {
    sounds.playMilestone();
  }
}

// Word mode
function nextWord() {
  gameState.targetWord = wordBag.next();
  gameState.wordCharIndex = 0;
  renderTargetWord();
}

function updateRoundHud(secondsLeft) {
  document.getElementById('wordTimer').textContent = secondsLeft;
  document.getElementById('wordScore').textContent = gameState.wordsCompleted;
  // Warn only near the end, so the colour means something.
  document.getElementById('wordTimer').classList.toggle('urgent', secondsLeft <= 10);
}

function stopRoundTicker() {
  if (gameState.roundTicker) {
    clearInterval(gameState.roundTicker);
    gameState.roundTicker = null;
  }
}

// The clock starts on the first letter typed, not when the mode opens — a child
// shouldn't lose seconds while still working out what to do.
function startRoundClock() {
  if (gameState.roundDeadline || gameState.roundOver) return;
  gameState.roundDeadline = Date.now() + ROUND_SECONDS * 1000;

  // Derive the remaining time from a deadline rather than decrementing a counter:
  // background tabs throttle timers, so a counter would silently drift. Ticking
  // faster than 1s keeps the display honest when the tab wakes back up.
  gameState.roundTicker = setInterval(() => {
    const left = Math.max(0, Math.ceil((gameState.roundDeadline - Date.now()) / 1000));
    updateRoundHud(left);
    if (left <= 0) endRound();
  }, 250);
}

// Assigned by the init IIFE, which owns the confetti canvas instance. endRound runs
// from the round ticker out here at module scope and can't reach into that closure,
// so the finale is handed out rather than reached for.
let fireCelebration = () => {};

// A round answering someone's challenge is a story with an outcome; a solo round is
// just a score. Zero is checked first so a blank round never gets told it lost.
function roundOverTitle(score, target) {
  if (score === 0) return "Time's up — have another go!";
  if (target === null) return "Time's up!";
  if (score > target) return `🏆 You beat ${target}!`;
  if (score === target) return `🤝 Dead heat — ${target} each!`;
  return `So close — ${score} vs ${target}`;
}

function endRound() {
  stopRoundTicker();
  gameState.roundOver = true;
  gameState.roundDeadline = null;
  updateRoundHud(0);

  const score = gameState.wordsCompleted;
  const target = gameState.challengeTarget;

  document.getElementById('wordChallenge').classList.remove('active');
  document.getElementById('finalScore').textContent = score;
  // Scoring exactly one word is common enough on a first go to be worth the branch —
  // and "1 words" sits badly next to share text that gets it right.
  document.getElementById('finalScoreUnit').textContent = score === 1 ? 'word' : 'words';
  document.getElementById('roundOverTitle').textContent = roundOverTitle(score, target);
  document.getElementById('roundSquares').textContent = score > 0 ? buildSquares(score) : '';

  // There's nothing worth sharing about a round nobody played, and ?c=0 is not a
  // challenge anyone could lose to.
  const shareBtn = document.getElementById('shareBtn');
  shareBtn.hidden = score === 0;
  shareBtn.textContent = 'Share';
  document.getElementById('shareFallback').textContent = '';

  document.getElementById('roundOver').classList.add('active');
  document.getElementById('playAgainBtn').focus();

  if (target !== null && score > target) fireCelebration();
  sounds.playMilestone();
}

function initWordMode() {
  stopRoundTicker();
  gameState.letterCount = 0;
  gameState.wordsCompleted = 0;
  gameState.roundDeadline = null;
  gameState.roundOver = false;

  document.getElementById('document').innerHTML = '';
  document.getElementById('roundOver').classList.remove('active');
  // A round is starting one way or another, so the challenge panel has said its
  // piece — this also covers reaching Words mode through the menu instead of its
  // own button. gameState.challengeTarget deliberately survives: the score to beat
  // outlives the panel that announced it.
  document.getElementById('challenge').classList.remove('active');
  document.getElementById('wordHud').classList.add('active');
  document.getElementById('wordChallenge').classList.add('active');
  updateRoundHud(ROUND_SECONDS);
  nextWord();
}

// Reset game
function resetGame() {
  stopRoundTicker();
  gameState.letterCount = 0;
  gameState.roundDeadline = null;
  gameState.roundOver = false;

  document.getElementById('document').innerHTML = '';
  document.getElementById('wordChallenge').classList.remove('active');
  document.getElementById('wordHud').classList.remove('active');
  document.getElementById('roundOver').classList.remove('active');
  document.getElementById('challenge').classList.remove('active');
}

// Dark mode toggle
function toggleDarkMode() {
  gameState.darkMode = !gameState.darkMode;
  document.body.classList.toggle('dark', gameState.darkMode);
  localStorage.setItem('keyfetti-darkmode', gameState.darkMode);
}

// Reduced motion. The confetti is drawn to a canvas, so CSS alone can't quiet it —
// the JS has to check too. Tracked live so toggling the OS setting takes effect
// without a reload.
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motion = {
  get reduced() {
    return reducedMotionQuery.matches;
  }
};
reducedMotionQuery.addEventListener('change', () => {
  const container = document.getElementById('particles');
  if (motion.reduced) {
    container.innerHTML = '';
  } else {
    createParticles();
  }
});

// Background particles - create once
function createParticles() {
  if (motion.reduced) return;
  const container = document.getElementById('particles');
  if (container.querySelector('.particle')) return; // Already created
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = (3 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

// Vibrate on mobile - FIXED: actually called
function vibrate() {
  if (navigator.vibrate && navigator.vibrate !== undefined) {
    navigator.vibrate(15);
  }
}

// Process a valid keypress. The count is no longer shown anywhere — it is kept
// only so milestone celebration sounds still fire.
function processKeypress() {
  gameState.letterCount++;
  checkMilestone();
}

// Show progress through the target word so a child can see how far they've got.
function renderTargetWord() {
  const el = document.getElementById('targetWord');
  el.innerHTML = '';
  [...gameState.targetWord].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = i < gameState.wordCharIndex ? 'word-char done' : 'word-char';
    span.textContent = ch;
    el.appendChild(span);
  });
}

// Initialize everything
(() => {
  const game = document.getElementById('game');
  const popLayer = document.getElementById('popLayer');
  const docEl = document.getElementById('document');
  const confettiCanvas = document.getElementById('confetti-canvas');

  const mobileInput = document.getElementById('mobileInput');

  // Detect touch devices by capability rather than user-agent string. iPadOS 13+
  // reports itself as a Mac, so the old UA sniff sent every iPad down the desktop
  // path and never focused the input needed to raise the on-screen keyboard.
  const isMobile =
    (window.matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0) ||
    navigator.maxTouchPoints > 1;

  // Load saved dark mode
  if (localStorage.getItem('keyfetti-darkmode') === 'true') {
    gameState.darkMode = true;
    document.body.classList.add('dark');
  }

  // Load saved sound preference
  if (localStorage.getItem('keyfetti-sound') === 'false') {
    sounds.enabled = false;
    document.getElementById('soundBtn').textContent = '🔇';
  }

  // The on-screen keyboard has to be nursed: the input driving it is invisible, so
  // anything that blurs it silently ends the game. Hold it open — but not while a
  // panel is waiting on a decision. There the keyboard would cover the very thing
  // it's meant to be read, and on the results panel a refocus every 100ms also
  // fights the native share sheet.
  function panelOpen() {
    return gameState.roundOver ||
      document.getElementById('challenge').classList.contains('active');
  }

  function focusInput() {
    if (!panelOpen()) mobileInput.focus();
  }

  // Mobile setup
  if (isMobile) {
    setTimeout(focusInput, 400);

    game.addEventListener('click', focusInput);
    document.body.addEventListener('click', focusInput);

    mobileInput.addEventListener('blur', () => {
      setTimeout(focusInput, 100);
    });

    // Handle virtual keyboard showing
    mobileInput.addEventListener('focus', () => {
      const intro = document.getElementById('introStage');
      if (intro) intro.style.display = 'none';
    });
  }

  // Visual viewport resize
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      game.style.height = window.visualViewport.height + 'px';
    });
  }

  // Confetti setup
  const myConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  // Confetti is the whole point of the game, but it used to fire a full burst on
  // every keypress with no ceiling — and mashing keys is exactly what small
  // children do. Bursts are rate-limited, and sustained typing thins each burst
  // out rather than dropping it, so fast typing still feels rewarding without
  // piling up thousands of particles on a cheap tablet.
  const CONFETTI_MIN_INTERVAL_MS = 60;
  const CONFETTI_FULL_BURST = 28;
  const CONFETTI_MIN_BURST = 6;
  let lastConfettiAt = 0;
  let recentBursts = 0;

  function fireConfetti() {
    if (motion.reduced) return;

    const now = performance.now();
    const sinceLast = now - lastConfettiAt;
    if (sinceLast < CONFETTI_MIN_INTERVAL_MS) return;

    // Decay the recent-burst count so a pause restores the full effect.
    recentBursts = Math.max(0, recentBursts - Math.floor(sinceLast / 300));
    recentBursts++;
    lastConfettiAt = now;

    const particleCount = Math.round(
      Math.max(CONFETTI_MIN_BURST, CONFETTI_FULL_BURST / Math.max(1, recentBursts * 0.5))
    );

    myConfetti({
      particleCount,
      spread: 75,
      startVelocity: 36,
      gravity: 0.6,
      scalar: 0.9,
      ticks: 120,
      origin: { x: 0.5, y: 0.4 }
    });
  }

  // Beating a challenge earns something bigger than a keypress burst. This fires once
  // per round at most, so it ignores the rate limiter above — but not the reduced
  // motion check, which no burst in this file is allowed to skip.
  fireCelebration = () => {
    if (motion.reduced) return;

    // Two cannons from the bottom corners rather than one from the middle: the
    // round-over panel is sitting dead centre, and confetti launched behind it just
    // disappears.
    [0.15, 0.85].forEach((x) => {
      myConfetti({
        particleCount: 70,
        spread: 60,
        startVelocity: 55,
        gravity: 0.8,
        scalar: 1.1,
        ticks: 200,
        angle: x < 0.5 ? 60 : 120,
        origin: { x, y: 0.9 }
      });
    });
  };

  // Rainbow colors
  let colorIndex = 0;
  const RAINBOW = [
    '#FF6B6B', '#FFB86B', '#FFD36B', '#8BE56F',
    '#5EE3D3', '#6BA7FF', '#C07BFF'
  ];
  
  function nextColor() {
    const c = RAINBOW[colorIndex % RAINBOW.length];
    colorIndex++;
    return c;
  }

  // Hide intro helper
  function hideIntro() {
    const intro = document.getElementById('introStage');
    if (intro && !intro.dataset.hidden) {
      intro.style.display = 'none';
      intro.dataset.hidden = 'true';
    }
  }

  // Key handler
  const keyTarget = isMobile ? mobileInput : document;
  
  keyTarget.addEventListener('keydown', (ev) => {
    hideIntro();

    // Handle Backspace
    if (ev.key === 'Backspace') {
      ev.preventDefault();
      const letters = docEl.querySelectorAll('.doc-letter');
      const last = letters[letters.length - 1];
      if (last) {
        if (gameState.letterCount > 0) {
          gameState.letterCount--;
        }
        explodeLetter(last);
      }
      return;
    }

    // Mode-specific handling - Word Mode
    if (gameState.gameMode === 'words') {
      // Once the clock runs out the round is frozen until Play again.
      if (gameState.roundOver) return;

      const expected = gameState.targetWord[gameState.wordCharIndex];
      if (ev.key.toUpperCase() === expected) {
        hideIntro();
        startRoundClock();
        const completesWord = gameState.wordCharIndex + 1 >= gameState.targetWord.length;
        spawnPopLetter(ev.key.toUpperCase(), completesWord);
        gameState.wordCharIndex++;
        renderTargetWord();
        processKeypress();
        sounds.playPop();
        vibrate();

        if (completesWord) {
          gameState.wordsCompleted++;
          updateRoundHud(Math.max(0, Math.ceil((gameState.roundDeadline - Date.now()) / 1000)));
          // Word complete - small delay then next word
          sounds.playCelebrate();
          setTimeout(() => {
            if (!gameState.roundOver) nextWord();
          }, 300);
        }
      }
      return;
    }

    // Normal key handling (Free Mode)
    if (gameState.allowAllKeys) {
      // All keys mode - numbers, punctuation, letters, space
      if (/^[a-z0-9]$/i.test(ev.key) || /[.,!?;:'"()\[\]{}\-+*/=_<>@#$%^&|~`\\]/.test(ev.key) || ev.key === ' ') {
        ev.preventDefault();
        const char = ev.key === ' ' ? ' ' : ev.key.toUpperCase();
        spawnPopLetter(char);
        processKeypress();
        sounds.playPop();
        vibrate();
      }
    } else {
      // Letters only mode (default)
      if (!/^[a-z]$/i.test(ev.key)) return;
      ev.preventDefault();
      spawnPopLetter(ev.key.toUpperCase());
      processKeypress();
      sounds.playPop();
      vibrate();
    }
  });


  // Spawn letter animation. completesWord adds a trailing space once the letter
  // lands, so Words mode reads as words rather than one run-on string.
  function spawnPopLetter(char, completesWord = false) {
    const span = document.createElement('span');
    span.className = 'pop-letter pop-enter';
    span.textContent = char;

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const baseSize = Math.min(Math.max(vw * 0.18, 72), 240);
    span.style.fontSize = baseSize + 'px';
    span.style.padding = Math.round(baseSize * 0.18) + 'px';
    span.style.background = 'transparent';
    span.style.color = nextColor();

    popLayer.appendChild(span);
    fireConfetti();

    // With reduced motion the letter still pops — it just holds in place and fades
    // instead of flying across the screen, which is the vestibular-triggering part.
    if (motion.reduced) {
      setTimeout(() => {
        span.remove();
        appendDocLetter(char);
        if (completesWord) appendDocSpace();
      }, 400);
      return;
    }

    setTimeout(() => {
      const docLetterPreview = createDocLetterPreview(char);
      const docRect = docLetterPreview.getBoundingClientRect();
      const fromRect = span.getBoundingClientRect();

      const translateX = docRect.left + (docRect.width / 2) - (fromRect.left + (fromRect.width / 2));
      const translateY = docRect.top + (docRect.height / 2) - (fromRect.top + (fromRect.height / 2));

      const targetFontSize = parseFloat(getComputedStyle(docLetterPreview).fontSize || '20');
      const currentFontSize = parseFloat(getComputedStyle(span).fontSize || String(baseSize));
      const scale = (targetFontSize / currentFontSize) || 0.18;

      docLetterPreview.remove();

      const anim = span.animate([
        { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
        { transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, opacity: 0.88 }
      ], {
        duration: 850,
        easing: 'cubic-bezier(.2,.9,.25,1)',
        fill: 'forwards'
      });

      // The letter lands in the document once it finishes flying there, so the
      // trailing space is queued here rather than at keypress time — otherwise it
      // would land ahead of the letters still in flight.
      //
      // Both the animation callback and the timeout fallback race to land the
      // letter, and either can win: a backgrounded tab throttles the animation, so
      // the timeout fires first and onfinish arrives later on resume. Landing must
      // therefore be idempotent, or the letter gets appended twice.
      let landed = false;
      const land = () => {
        if (landed) return;
        landed = true;
        span.remove();
        appendDocLetter(char);
        if (completesWord) appendDocSpace();
      };

      anim.onfinish = land;
      setTimeout(land, 910);

    }, 700);
  }

  function explodeLetter(el) {
    if (motion.reduced) {
      el.remove();
      return;
    }

    const rect = el.getBoundingClientRect();
    const pieces = 12;

    for (let i = 0; i < pieces; i++) {
      const frag = document.createElement('span');
      frag.textContent = el.textContent;
      frag.style.position = 'fixed';
      frag.style.left = rect.left + rect.width / 2 + 'px';
      frag.style.top = rect.top + rect.height / 2 + 'px';
      frag.style.fontSize = getComputedStyle(el).fontSize;
      frag.style.fontWeight = getComputedStyle(el).fontWeight;
      frag.style.color = gameState.darkMode ? '#fff' : '#000';
      frag.style.pointerEvents = 'none';
      frag.style.opacity = '0.9';
      frag.style.zIndex = 9999;

      document.body.appendChild(frag);

      const angle = (Math.PI * 2 * i) / pieces;
      const distance = 40 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      frag.animate([
        { transform: 'translate(0,0)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) rotate(${Math.random()*360}deg)`, opacity: 0 }
      ], {
        duration: 500 + Math.random() * 300,
        easing: 'ease-out',
        fill: 'forwards'
      }).onfinish = () => frag.remove();
    }

    el.remove();
  }

  function createDocLetterPreview(char) {
    const preview = document.createElement('span');
    preview.className = 'doc-letter';
    preview.style.opacity = '0';
    preview.textContent = char;
    docEl.appendChild(preview);
    return preview;
  }

  function appendDocLetter(char) {
    const el = document.createElement('span');
    el.className = 'doc-letter';
    el.textContent = char;
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px) scale(0.98)';
    docEl.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transition = 'transform 260ms cubic-bezier(.2,.9,.25,1), opacity 260ms';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });

    pruneDocumentIfNeeded();
  }

  // The document lays letters out as flex items, so a whitespace-only span would
  // collapse to nothing. Use an explicit fixed-width gap instead.
  function appendDocSpace() {
    const el = document.createElement('span');
    el.className = 'doc-space';
    docEl.appendChild(el);
    pruneDocumentIfNeeded();
  }

  function pruneDocumentIfNeeded() {
    const letters = docEl.querySelectorAll('.doc-letter');
    if (letters.length > 1200) {
      const removeCount = letters.length - 1200;
      for (let i = 0; i < removeCount; i++) {
        if (letters[i] && letters[i].parentNode) letters[i].remove();
      }
    }
    docEl.scrollLeft = docEl.scrollWidth;
    docEl.scrollTop = docEl.scrollHeight;
  }

  // Event listeners
  game.addEventListener('click', () => { game.focus(); });
  setTimeout(() => game.setAttribute('tabindex', '0'), 0);

  document.getElementById('restartBtn').addEventListener('click', () => {
    if (gameState.gameMode === 'words') {
      initWordMode();
    } else {
      resetGame();
    }
    sounds.playCelebrate();
  });

  document.getElementById('playAgainBtn').addEventListener('click', (e) => {
    initWordMode();
    // Drop focus, or a subsequent Space/Enter would re-trigger the button.
    e.currentTarget.blur();
    if (isMobile) mobileInput.focus();
    sounds.playCelebrate();
  });

  document.getElementById('shareBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const text = buildShareText(gameState.wordsCompleted, gameState.challengeTarget);

    try {
      const how = await shareOrCopy(text);
      // Say nothing when the share sheet handled it — the OS already gave feedback —
      // and nothing when it was dismissed, since that was a decision, not a failure.
      if (how === 'copied') {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Share'; }, 2000);
      }
    } catch (err) {
      // Both paths are gone (clipboard blocked, or no share target). Show the text
      // so it can still be copied by hand rather than leaving a dead button.
      document.getElementById('shareFallback').textContent = text;
      btn.textContent = 'Copy this ↓';
    }
  });

  // The challenge panel is a landing screen, so its button starts the round outright
  // rather than making a child find the mode menu first.
  document.getElementById('challengeStartBtn').addEventListener('click', (e) => {
    document.getElementById('challenge').classList.remove('active');
    hideIntro();

    gameState.gameMode = 'words';
    document.querySelectorAll('.mode-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === 'words');
    });
    initWordMode();

    e.currentTarget.blur();
    if (isMobile) mobileInput.focus();
    sounds.playCelebrate();
  });

  document.getElementById('toggleBtn').addEventListener('click', (e) => {
    gameState.allowAllKeys = !gameState.allowAllKeys;
    e.target.textContent = gameState.allowAllKeys ? '🌐' : '🔠';
    e.target.title = gameState.allowAllKeys ? 'All keys enabled' : 'Letters only';
  });

  document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);

  document.getElementById('soundBtn').addEventListener('click', (e) => {
    const enabled = sounds.toggle();
    e.target.textContent = enabled ? '🔊' : '🔇';
    e.target.title = enabled ? 'Sound On' : 'Sound Off';
    localStorage.setItem('keyfetti-sound', enabled);
  });

  // Mode selector
  document.getElementById('modeBtn').addEventListener('click', () => {
    document.getElementById('modeSelector').classList.toggle('active');
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      gameState.gameMode = e.target.dataset.mode;
      document.getElementById('modeSelector').classList.remove('active');

      if (gameState.gameMode === 'words') {
        initWordMode();
      } else {
        resetGame();
      }
    });
  });

  // Prevent text selection
  document.addEventListener('selectstart', (e) => {
    // Waived on the results panel: if the clipboard API is unavailable, selecting
    // the share text by hand is the only way left to copy it.
    if (e.target.closest && e.target.closest('#roundOver')) return;
    e.preventDefault();
  });

  // Initialize
  createParticles();

  // Arriving from a shared link: show the score to beat before anything else. Kept in
  // the URL rather than stripped, so a reload doesn't quietly turn the challenge into
  // an ordinary round.
  gameState.challengeTarget = readChallengeFromUrl();
  if (gameState.challengeTarget !== null) {
    document.getElementById('challengeCount').textContent = gameState.challengeTarget;
    document.getElementById('challenge').classList.add('active');
    document.getElementById('challengeStartBtn').focus();
  }

  setTimeout(() => { try { game.focus(); } catch (e) {} }, 300);
})();
