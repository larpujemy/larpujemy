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

const root = document.documentElement;
const butterflyFrame = document.querySelector('.butterfly-frame');

const audio = document.getElementById('main-audio');
const musicBtn = document.getElementById('music-btn');
const widget = document.getElementById('audio-widget');
const titleText = document.getElementById('track-title');
const timeText = document.getElementById('track-time');
const slider = document.getElementById('vol-slider');

let currentTrack = 0;
let hintTimer = null;
let clickTimeout = null;

if (slider && audio) {
  audio.volume = parseFloat(slider.value);
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
});

if (butterflyFrame) {
  butterflyFrame.addEventListener('click', toggleInvert);
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
