const playlist = [
  { title: "crystal castles - suffocation", src: "assets/track1.mp3" },
  { title: "snow strippers - tragic surprise", src: "assets/track2.mp3" },
  { title: "cult member - u weren't here i really miss you", src: "assets/track3.mp3" },
  { title: "smokedope2016 - im not god but i wish i was", src: "assets/track4.mp3" },
  { title: "bladee - reality surf", src: "assets/track5.mp3" },
  { title: "buckshot - calm des fckdown", src: "assets/track6.mp3" },
  { title: "ecco2k - in the flesh", src: "assets/track7.mp3" },
  { title: "yung lean - afghanistan", src: "assets/track8.mp3" }
];

const doubleClickWindow = 350;
const hintDuration = 1200;

const views = {
  work: {
    title: "directory: /projects",
    body: `
      <div class="project-item">
        <div class="project-head">[ 01 // project_alpha ]</div>
        <div class="project-desc">web audio experiment, brutalist layout, low-latency playback</div>
      </div>
      <div class="project-item">
        <div class="project-head">[ 02 // project_beta ]</div>
        <div class="project-desc">visual archive, interactive media viewer, responsive canvas</div>
      </div>
      <div class="project-item">
        <div class="project-head">[ 03 // project_gamma ]</div>
        <div class="project-desc">sound manipulation tools, single-page interface, minimalist core</div>
      </div>
    `
  },
  about: {
    title: "profile: /specs",
    body: `
      <div class="about-group">
        <strong>[ hardware ]</strong>
        <span>macbook air m4 // playstation vita // psp 3000</span>
      </div>
      <div class="about-group">
        <strong>[ interests ]</strong>
        <span>photography // rhythm games // electronic music archives</span>
      </div>
    `
  }
};

const root = document.documentElement;
const butterflyFrame = document.querySelector('.butterfly-frame');

const osWindow = document.getElementById('os-window');
const windowTitle = document.getElementById('window-title');
const windowBody = document.getElementById('window-body');
const windowClose = document.getElementById('window-close');

const navWork = document.getElementById('nav-work');
const navAbout = document.getElementById('nav-about');

const audio = document.getElementById('main-audio');
const musicBtn = document.getElementById('music-btn');
const widget = document.getElementById('audio-widget');
const titleText = document.getElementById('track-title');
const timeText = document.getElementById('track-time');
const slider = document.getElementById('vol-slider');

let currentTrack = 0;
let hintTimer = null;
let clickTimeout = null;
let activeView = null;

if (slider && audio) {
  audio.volume = parseFloat(slider.value);
}

function openWindow(viewName) {
  if (activeView === viewName) {
    closeWindow();
    return;
  }
  const view = views[viewName];
  if (!view) return;

  windowTitle.textContent = view.title;
  windowBody.innerHTML = view.body;
  osWindow.classList.add('active');
  activeView = viewName;
}

function closeWindow() {
  osWindow.classList.remove('active');
  activeView = null;
}

function toggleInvert() {
  const isLight = root.style.filter === 'invert(0)';
  root.style.filter = isLight ? 'invert(1)' : 'invert(0)';
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function setTrack(index) {
  audio.src = playlist[index].src;
  audio.load();

  if (hintTimer) clearTimeout(hintTimer);
  titleText.textContent = "[ double click to skip ]";

  hintTimer = setTimeout(() => {
    titleText.textContent = `[ ${playlist[index].title} ]`;
  }, hintDuration);
}

function playTrack() {
  if (!audio.getAttribute('src')) {
    setTrack(currentTrack);
  }

  const promise = audio.play();
  if (promise !== undefined) {
    promise
      .then(() => {
        widget.classList.add('playing');
      })
      .catch((err) => {
        console.warn("Audio play blocked:", err);
      });
  }
}

function pauseTrack() {
  audio.pause();
  widget.classList.remove('playing');
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % playlist.length;
  setTrack(currentTrack);
  playTrack();
}

function handleMusicClick(e) {
  e.stopPropagation();

  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
    nextTrack();
  } else {
    clickTimeout = setTimeout(() => {
      clickTimeout = null;
      if (audio.paused) {
        playTrack();
      } else {
        pauseTrack();
      }
    }, doubleClickWindow);
  }
}

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12') e.preventDefault();
  if (e.key === 'Escape' && activeView) closeWindow();
});

if (butterflyFrame) {
  butterflyFrame.addEventListener('click', toggleInvert);
}

if (navWork) {
  navWork.addEventListener('click', (e) => {
    e.preventDefault();
    openWindow('work');
  });
}

if (navAbout) {
  navAbout.addEventListener('click', (e) => {
    e.preventDefault();
    openWindow('about');
  });
}

if (windowClose) {
  windowClose.addEventListener('click', closeWindow);
}

if (slider) {
  slider.addEventListener('input', (e) => {
    audio.volume = parseFloat(e.target.value);
  });
}

if (musicBtn) {
  musicBtn.addEventListener('click', handleMusicClick);
}

if (audio && timeText) {
  audio.addEventListener('timeupdate', () => {
    timeText.textContent = `[ ${formatTime(audio.currentTime)} / ${formatTime(audio.duration)} ]`;
  });

  audio.addEventListener('ended', nextTrack);
}

if (osWindow) {
  osWindow.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}