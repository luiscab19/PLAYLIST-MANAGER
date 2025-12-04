let currentPlaylist = null;
let currentTrackIndex = 0;
let allSongs = [];
let currentSong = null;
let onTrackChange = null;

const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const songTitleEl = document.getElementById('song-title');
const songArtistEl = document.getElementById('song-artist');
const mediaPreview = document.getElementById('media-preview');

export function setPlayerData(playlist, songs, trackIndex) {
    currentPlaylist = playlist;
    allSongs = songs;
    currentTrackIndex = trackIndex || 0;
}

export function setOnTrackChangeCallback(cb) {
    onTrackChange = cb;
}

export function playTrack(trackIndex) {
    if (!currentPlaylist || trackIndex < 0 || trackIndex >= currentPlaylist.songIds.length) {
        return;
    }
    currentTrackIndex = trackIndex;
    const songId = currentPlaylist.songIds[currentTrackIndex];
    const song = allSongs.find(s => s.id === songId);
    currentSong = song;
    if (song) {
        audioPlayer.src = song.url;
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
        updateNowPlayingInfo(song);
        toggleMediaPreview(song.mediaType === 'video');
    } else {
        playNext();
    }
    if (typeof onTrackChange === 'function') {
        onTrackChange(currentTrackIndex, song);
    }
}

export function playNext() {
    if (!currentPlaylist || !currentPlaylist.songIds.length) return;
    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.songIds.length;
    playTrack(nextIndex);
}

export function playPrev() {
    if (!currentPlaylist || !currentPlaylist.songIds.length) return;
    const prevIndex = (currentTrackIndex - 1 + currentPlaylist.songIds.length) % currentPlaylist.songIds.length;
    playTrack(prevIndex);
}

function updateNowPlayingInfo(song) {
    if (song) {
        songTitleEl.textContent = song.title;
        songArtistEl.textContent = song.artist;
    } else {
        songTitleEl.textContent = 'Selecciona una playlist';
        songArtistEl.textContent = '';
        toggleMediaPreview(false);
    }
} 

function toggleMediaPreview(shouldShowVideo) {
    if (!mediaPreview) return;
    if (shouldShowVideo) {
        mediaPreview.hidden = false;
        mediaPreview.classList.add('visible');
    } else {
        mediaPreview.hidden = true;
        mediaPreview.classList.remove('visible');
    }
}