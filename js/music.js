// Bundled audio plays in-page; visitors can temporarily replace a track with their own file.
const musicTracks = [
  { side: 'SIDE A · 正在听', title: 'Hit the Rhyme', artist: '蛋堡 Soft Lipa',
    quote: '“让喜欢的旋律，陪灵感慢慢亮起来。”',
    spotify: 'https://open.spotify.com/track/49gm0W9gCb9dSaFZQYJQsh',
    apple: 'https://music.apple.com/us/song/1178538969', src: 'audio/hit-the-rhyme.mp3', objectUrl: null },
  { side: 'SIDE B · 最近喜欢', title: '爱不来 (feat. MISS KO)', artist: '方大同 · 葛仲珊',
    quote: '“有些旋律，适合在安静的夜里重听。”',
    spotify: 'https://open.spotify.com/track/67BfxbeBGgaQpP8O2BfeYg',
    apple: 'https://music.apple.com/us/song/1579903905', src: 'audio/ai-bu-lai.mp3', objectUrl: null }
];
const musicCard = document.getElementById('musicCard');
const musicPlay = document.getElementById('musicPlay');
const musicPlayIcon = document.getElementById('musicPlayIcon');
const musicNow = document.getElementById('musicNow');
const musicLiked = document.getElementById('musicLiked');
const musicOverline = document.getElementById('musicOverline');
const musicTitle = document.getElementById('musicTitle');
const musicArtist = document.getElementById('musicArtist');
const musicQuote = document.getElementById('musicQuote');
const musicState = document.getElementById('musicState');
const musicSpotifyLink = document.getElementById('musicSpotifyLink');
const musicAppleLink = document.getElementById('musicAppleLink');
const musicAudio = document.getElementById('musicAudio');
const musicFile = document.getElementById('musicFile');
const musicLoad = document.getElementById('musicLoad');
const musicSeek = document.getElementById('musicSeek');
const musicElapsed = document.getElementById('musicElapsed');
const musicDuration = document.getElementById('musicDuration');
let musicIndex = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
function setMusicPlaying(playing) {
  musicCard.classList.toggle('is-playing', playing);
  musicPlayIcon.textContent = playing ? 'Ⅱ' : '▶';
  musicPlay.setAttribute('aria-label', playing ? '暂停音乐' : musicAudio.src ? '播放音乐' : '选择音频并播放');
  if (playing) musicState.textContent = '正在播放';
}
function resetProgress() {
  musicSeek.value = '0';
  musicSeek.disabled = true;
  musicElapsed.textContent = '0:00';
  musicDuration.textContent = '0:00';
}
function selectMusic(index) {
  musicAudio.pause();
  musicIndex = index;
  const track = musicTracks[index];
  musicNow.classList.toggle('active', index === 0);
  musicLiked.classList.toggle('active', index === 1);
  musicNow.setAttribute('aria-pressed', String(index === 0));
  musicLiked.setAttribute('aria-pressed', String(index === 1));
  musicOverline.textContent = track.side;
  musicTitle.textContent = track.title;
  musicArtist.textContent = track.artist;
  musicQuote.textContent = track.quote;
  musicSpotifyLink.href = track.spotify;
  musicAppleLink.href = track.apple;
  musicAudio.removeAttribute('src');
  musicAudio.src = track.objectUrl || track.src;
  musicAudio.load();
  resetProgress();
  setMusicPlaying(false);
  musicState.textContent = '点击播放，在这里听这首歌';
  musicLoad.textContent = '更换音频文件';
}
musicNow.addEventListener('click', () => selectMusic(0));
musicLiked.addEventListener('click', () => selectMusic(1));
musicLoad.addEventListener('click', () => musicFile.click());
musicPlay.addEventListener('click', async () => {
  if (!musicAudio.src) { musicFile.click(); return; }
  if (!musicAudio.paused) { musicAudio.pause(); return; }
  try { await musicAudio.play(); }
  catch { musicState.textContent = '无法播放此文件，请换一个音频格式'; }
});
musicFile.addEventListener('change', () => {
  const file = musicFile.files?.[0];
  musicFile.value = '';
  if (!file) return;
  if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|ogg|wav|aac)$/i.test(file.name)) {
    musicState.textContent = '请选择 MP3、M4A、OGG 或 WAV 音频'; return;
  }
  const track = musicTracks[musicIndex];
  musicAudio.pause();
  if (track.objectUrl) URL.revokeObjectURL(track.objectUrl);
  track.objectUrl = URL.createObjectURL(file);
  musicAudio.src = track.objectUrl;
  musicAudio.load();
  resetProgress();
  musicLoad.textContent = '更换本地音频';
  musicPlay.setAttribute('aria-label', '播放音乐');
  musicState.textContent = '音频已选好，点击播放';
});
musicAudio.addEventListener('play', () => setMusicPlaying(true));
musicAudio.addEventListener('pause', () => {
  setMusicPlaying(false);
  if (musicAudio.src && musicState.textContent === '正在播放') musicState.textContent = '已暂停';
});
musicAudio.addEventListener('ended', () => {
  setMusicPlaying(false);
  musicState.textContent = '播放完毕';
});
musicAudio.addEventListener('loadedmetadata', () => {
  const duration = musicAudio.duration;
  musicSeek.disabled = !Number.isFinite(duration) || duration <= 0;
  musicDuration.textContent = formatTime(duration);
});
musicAudio.addEventListener('timeupdate', () => {
  musicElapsed.textContent = formatTime(musicAudio.currentTime);
  if (Number.isFinite(musicAudio.duration) && musicAudio.duration > 0)
    musicSeek.value = String(Math.round(musicAudio.currentTime / musicAudio.duration * 100));
});
musicAudio.addEventListener('error', () => {
  if (musicAudio.src) musicState.textContent = '音频加载失败，请更换文件';
});
musicSeek.addEventListener('input', () => {
  if (Number.isFinite(musicAudio.duration) && musicAudio.duration > 0)
    musicAudio.currentTime = Number(musicSeek.value) / 100 * musicAudio.duration;
});
window.addEventListener('pagehide', () => {
  musicTracks.forEach(track => { if (track.objectUrl) URL.revokeObjectURL(track.objectUrl); });
});
selectMusic(0);
