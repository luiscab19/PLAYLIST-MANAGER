import { initDB } from './js/db.js';
import { savePlaylist, deletePlaylist, updatePlaylistSongs } from './js/playlist.js';
import { songs } from './js/songs.js';
import { renderPlaylists, renderMasterSongList } from './js/ui.js';
import { playTrack, playNext, playPrev } from './js/player.js';
import { setupEvents } from './js/events.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    setupEvents();
});