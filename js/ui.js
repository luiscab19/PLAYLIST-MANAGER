export function renderPlaylists(playlists, activePlaylistId, onPlay, onDelete) {
    const playlistList = document.getElementById('playlist-list');
    playlistList.innerHTML = '';
    playlists.forEach(playlist => {
        const li = document.createElement('li');
        li.className = (playlist.id === activePlaylistId) ? 'active' : '';
        li.innerHTML = `
            <span>${playlist.name}</span>
            <div class="playlist-controls">
                <button class="play-playlist-btn" data-id="${playlist.id}"><i class="ri-play-fill"></i></button>
                <button class="delete-playlist-btn" data-id="${playlist.id}"><i class="ri-delete-bin-6-fill"></i></button>
            </div>
        `;
        li.querySelector('.play-playlist-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            onPlay(playlist.id);
        });
        li.querySelector('.delete-playlist-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            onDelete(playlist.id);
        });
        playlistList.appendChild(li);
    });
}

export function renderMasterSongList(songs, currentPlaylist, isEditingPlaylist, onAddSong, onToggleSelect) {
    const masterSongList = document.getElementById('master-song-list');
    masterSongList.innerHTML = '';
    songs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'song-item-master';
        li.dataset.songId = song.id;
        const mediaType = song.mediaType || 'audio';
        const badgeLabel = mediaType === 'video' ? 'Video' : 'Audio';
        li.innerHTML = `
            <div class="song-main">
                <span>${song.title} - ${song.artist}</span>
                <span class="media-badge ${mediaType}">${badgeLabel}</span>
            </div>
            <div class="song-controls">
                <button class="add-song-btn"><i class="ri-add-line"></i></button>
            </div>`;
        li.querySelector('.add-song-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            onAddSong(song.id);
        });
        li.addEventListener('click', (e) => {
            if (isEditingPlaylist && e.target.tagName !== 'BUTTON' && !e.target.parentElement.classList.contains('add-song-btn')) {
                onToggleSelect(li, song.id);
            }
        });
        // Marcar si está seleccionada para la playlist activa
        if (isEditingPlaylist && currentPlaylist && currentPlaylist.songIds && currentPlaylist.songIds.includes(song.id)) {
            li.classList.add('selected-for-playlist');
        }
        masterSongList.appendChild(li);
    });
}

export function renderPlaylistSongs(playlist, allSongs) {
    const playlistSongList = document.getElementById('playlist-song-list');
    if (!playlistSongList) return;
    playlistSongList.innerHTML = '';
    if (!playlist || !playlist.songIds || playlist.songIds.length === 0) {
        playlistSongList.innerHTML = '<li>No hay canciones en esta playlist.</li>';
        return;
    }
    playlist.songIds.forEach(songId => {
        const song = allSongs.find(s => s.id === songId);
        if (song) {
            const li = document.createElement('li');
            const mediaType = song.mediaType || 'audio';
            const badgeLabel = mediaType === 'video' ? 'Video' : 'Audio';
            li.innerHTML = `
                <span>${song.title} - ${song.artist}</span>
                <span class="media-badge ${mediaType}">${badgeLabel}</span>
            `;
            playlistSongList.appendChild(li);
        }
    });
} 