import { songs } from './songs.js';
import { renderPlaylists, renderMasterSongList, renderPlaylistSongs } from './ui.js';
import { savePlaylist, deletePlaylist, updatePlaylistSongs } from './playlist.js';
import { playTrack, playNext, playPrev, setPlayerData, setOnTrackChangeCallback } from './player.js';
import { getStore } from './db.js';

export function setupEvents() {
    let allSongs = [];
    let playlists = [];
    let currentPlaylist = null;
    let isEditingPlaylist = false;
    let activePlaylistId = null;
    let currentlyPlayingPlaylist = null; 
    let currentFilter = 'all';
    let visibleSongs = [];

    const savePlaylistBtn = document.getElementById('save-playlist-btn');
    const exitEditBtn = document.getElementById('exit-edit-btn');
    const newPlaylistBtn = document.getElementById('new-playlist-btn');
    const modal = document.getElementById('playlist-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const playlistNameInput = document.getElementById('playlist-name-input');
    const homeScreen = document.getElementById('home-screen');
    const editScreen = document.getElementById('edit-screen');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const homeQueueSection = document.getElementById('home-queue-section');
    const homeEmptyMessage = document.getElementById('home-empty-message');
    const homeQueueList = document.getElementById('home-queue-list');
    const playlistList = document.getElementById('playlist-list');
    const filterControl = document.getElementById('filter-control');
    const filterButtons = filterControl ? Array.from(filterControl.querySelectorAll('button')) : [];

    function refreshAll() {
        allSongs = songs;
        updateVisibleSongs();
        loadPlaylists();
    }
    function loadPlaylists() {
        const store = getStore('playlists', 'readonly');
        if (!store) return;
        store.getAll().onsuccess = (e) => {
            playlists = e.target.result;
            renderPlaylists(playlists, activePlaylistId, handlePlayPlaylist, handleDeletePlaylist);
            if (isEditingPlaylist && currentPlaylist) {
                renderMasterSongList(visibleSongs, currentPlaylist, isEditingPlaylist, handleAddSong, handleToggleSongSelect);
            }
        };
    }

    function handlePlayPlaylist(playlistId) {
        // Buscar la playlist directamente en la base de datos para asegurar datos actualizados
        const store = getStore('playlists', 'readonly');
        if (!store) return;
        
        store.get(playlistId).onsuccess = (e) => {
            const playlist = e.target.result;
            if (!playlist) return;
            
            currentPlaylist = playlist;
            activePlaylistId = playlistId;
            isEditingPlaylist = false;
            currentlyPlayingPlaylist = playlist;
            setPlayerData(currentPlaylist, allSongs, 0); 
            
            import('./player.js').then(({ playTrack }) => {
                playTrack(0); 
            });
            
            showHomeScreen();
            renderHomeQueueList(currentPlaylist, 0); // Marca la canción activa
        };
    }
    function handleDeletePlaylist(playlistId) {
        if (isEditingPlaylist && currentPlaylist && currentPlaylist.id === playlistId) {
            isEditingPlaylist = false;
            activePlaylistId = null;
            currentPlaylist = null;
            if (editScreen) editScreen.style.display = 'none';
            if (homeScreen) homeScreen.style.display = 'block';
            // console.log('Ocultando área de edición y mostrando home tras eliminar playlist editada');
            showHomeScreen();
            refreshAll();
        }

        // Luego, limpia el reproductor si es la playlist activa
        if (currentlyPlayingPlaylist && currentlyPlayingPlaylist.id === playlistId) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            currentlyPlayingPlaylist = null;
            renderHomeQueue();
            document.getElementById('song-title').textContent = 'Selecciona una playlist';
            document.getElementById('song-artist').textContent = '';
        }

        deletePlaylist(playlistId, refreshAll);
    }
    function handleAddSong(songId) {
        if (!isEditingPlaylist || !currentPlaylist) return;
        if (!currentPlaylist.songIds.includes(songId)) {
            currentPlaylist.songIds.push(songId);
            renderMasterSongList(visibleSongs, currentPlaylist, isEditingPlaylist, handleAddSong, handleToggleSongSelect);
        }
    }
    function handleToggleSongSelect(li, songId) {
        if (!isEditingPlaylist || !currentPlaylist) return;
        const idx = currentPlaylist.songIds.indexOf(songId);
        if (idx === -1) {
            currentPlaylist.songIds.push(songId);
            li.classList.add('selected-for-playlist');
        } else {
            currentPlaylist.songIds.splice(idx, 1);
            li.classList.remove('selected-for-playlist');
        }
    }

    function showHomeScreen() {
        homeScreen.style.display = 'block';
        editScreen.style.display = 'none';
        savePlaylistBtn.style.display = 'none';
        exitEditBtn.style.display = 'none';
        if (filterControl) {
            filterControl.hidden = true;
            filterControl.classList.remove('visible');
        }
        mainTitle.textContent = '';
        mainSubtitle.textContent = '';
        renderHomeQueue();
    }
    function showEditScreen() {
        homeScreen.style.display = 'none';
        editScreen.style.display = 'block';
        savePlaylistBtn.style.display = 'inline-block';
        exitEditBtn.style.display = 'inline-block';
        if (filterControl) {
            filterControl.hidden = false;
            filterControl.classList.add('visible');
        }
    }
    function renderHomeQueue() {
        const playlistToShow = currentlyPlayingPlaylist || currentPlaylist;
        
        if (playlistToShow && playlistToShow.songIds.length > 0) {
            homeQueueSection.style.display = 'block';
            homeEmptyMessage.style.display = 'none';
            // Detectar la canción realmente activa
            let activeIndex = 0;
            if (audioPlayer.src) {
                const currentFile = getFileNameFromSrc(audioPlayer.src).toLowerCase();
                const idx = playlistToShow.songIds.findIndex(songId => {
                    const song = allSongs.find(s => s.id === songId);
                    if (!song || !song.url) return false;
                    const songFile = getFileNameFromSrc(song.url).toLowerCase();
                    return songFile === currentFile;
                });
                if (idx !== -1) activeIndex = idx;
            }
            renderHomeQueueList(playlistToShow, activeIndex);
        } else {
            homeQueueSection.style.display = 'none';
            homeEmptyMessage.style.display = 'flex';
        }
    }
    function renderHomeQueueList(playlist, activeIndex = 0) {
        homeQueueList.innerHTML = '';
        const songObjects = playlist.songIds.map(id => allSongs.find(s => s.id === id));
        songObjects.forEach((song, index) => {
            if (!song) return;
            const li = document.createElement('li');
            li.className = (index === activeIndex) ? 'active-song' : '';
            const mediaType = song.mediaType || 'audio';
            const badgeLabel = mediaType === 'video' ? 'Video' : 'Audio';
            li.innerHTML = `
                <span>${song.title} - ${song.artist}</span>
                <span class="media-badge ${mediaType}">${badgeLabel}</span>
            `;
            li.addEventListener('click', () => {
                // Usar la playlist que se está reproduciendo actualmente
                const playlistToUse = currentlyPlayingPlaylist || currentPlaylist;
                setPlayerData(playlistToUse, allSongs, index);
                import('./player.js').then(({ playTrack }) => {
                    playTrack(index);
                });
                renderHomeQueue();
            });
            homeQueueList.appendChild(li);
        });
    }

    newPlaylistBtn.addEventListener('click', () => modal.classList.add('show'));
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
    createPlaylistBtn.addEventListener('click', () => {
        const name = playlistNameInput.value.trim();
        if (name) {
            savePlaylist(name, [], (newPlaylistId) => {
                
                playlistNameInput.value = '';
                modal.classList.remove('show');
                
                loadPlaylists();
                
                const store = getStore('playlists', 'readonly');
                if (store) {
                    store.get(newPlaylistId).onsuccess = (e) => {
                        const newPlaylist = e.target.result;
                        if (newPlaylist) {
                            currentPlaylist = { ...newPlaylist, songIds: [...newPlaylist.songIds] };
                            activePlaylistId = newPlaylistId;
                            isEditingPlaylist = true;
                            showEditScreen();
                            mainTitle.textContent = `Editando: ${newPlaylist.name}`;
                            mainSubtitle.textContent = 'Haz clic en las canciones para añadirlas o quitarlas. No olvides guardar.';
                            renderMasterSongList(visibleSongs, currentPlaylist, isEditingPlaylist, handleAddSong, handleToggleSongSelect);
                            renderPlaylistSongs(currentPlaylist, allSongs);
                        }
                    };
                }
            });
        }
    });
    savePlaylistBtn.addEventListener('click', () => {
        if (!isEditingPlaylist || !currentPlaylist) return;
        updatePlaylistSongs(currentPlaylist.id, currentPlaylist.songIds, () => {
            import('./playlist.js').then(({ getPlaylistById }) => {
                import('./ui.js').then(({ renderPlaylistSongs }) => {
                    getPlaylistById(currentPlaylist.id, (playlist) => {
                        renderPlaylistSongs(playlist, allSongs);

                        // Si la playlist guardada es la que se está reproduciendo, actualiza el reproductor y la cola
                        if (currentlyPlayingPlaylist && currentlyPlayingPlaylist.id === playlist.id) {
                            currentlyPlayingPlaylist = playlist;
                            setPlayerData(currentlyPlayingPlaylist, allSongs, 0);
                            renderHomeQueue();
                        } else {
                            //limpia el estado para que no se muestre la cola
                            currentPlaylist = null;
                            activePlaylistId = null;
                            isEditingPlaylist = false;
                            showHomeScreen();
                            renderHomeQueue();
                        }
                    });
                });
            });
        });
    });
    exitEditBtn.addEventListener('click', () => {
        isEditingPlaylist = false;
        activePlaylistId = null;
        currentPlaylist = null;
        showHomeScreen();
        refreshAll();
    });
    playlistList.addEventListener('click', (e) => {
        if (e.target.closest('.play-playlist-btn')) {
            const id = parseInt(e.target.closest('.play-playlist-btn').dataset.id);
            handlePlayPlaylist(id);
        }
        if (e.target.closest('.delete-playlist-btn')) {
            const id = parseInt(e.target.closest('.delete-playlist-btn').dataset.id);
            handleDeletePlaylist(id);
        }
        if (!e.target.closest('button')) {
            const li = e.target.closest('li');
            if (li) {
                const id = parseInt(li.querySelector('.play-playlist-btn').dataset.id);
                handleEditPlaylist(id);
            }
        }
    });
    function handleEditPlaylist(playlistId) {
        const store = getStore('playlists', 'readonly');
        if (!store) return;
        
        store.get(playlistId).onsuccess = (e) => {
            const playlist = e.target.result;
            if (!playlist) return;
            
            currentPlaylist = { ...playlist, songIds: [...playlist.songIds] };
            activePlaylistId = playlistId;
            isEditingPlaylist = true;
            showEditScreen();
            mainTitle.textContent = `Editando: ${playlist.name}`;
            mainSubtitle.textContent = 'Haz clic en las canciones para añadirlas o quitarlas. No olvides guardar.';
            renderMasterSongList(visibleSongs, currentPlaylist, isEditingPlaylist, handleAddSong, handleToggleSongSelect);
            renderPlaylistSongs(currentPlaylist, allSongs);
        };
    }

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
        }
    });
    nextBtn.addEventListener('click', () => {
        playNext();
        renderHomeQueue();
    });
    prevBtn.addEventListener('click', () => {
        playPrev();
        renderHomeQueue();
    });
    audioPlayer.addEventListener('ended', () => {
        playNext();
        renderHomeQueue();
    });
    audioPlayer.addEventListener('timeupdate', () => {
        progressBar.value = audioPlayer.currentTime;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    });
    audioPlayer.addEventListener('loadedmetadata', () => {
        progressBar.max = audioPlayer.duration;
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });
    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
    });
    audioPlayer.addEventListener('play', () => {
        playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
    });
    audioPlayer.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
    });

    refreshAll();
    showHomeScreen();
    setupFilterControls();
    setOnTrackChangeCallback(() => {
        renderHomeQueue();
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function getFileNameFromSrc(src) {
        if (!src) return '';
        try {
            return decodeURIComponent(src.split('/').pop().split('?')[0]);
        } catch {
            return src.split('/').pop().split('?')[0];
        }
    }

    function updateVisibleSongs() {
        visibleSongs = allSongs.filter(song => {
            if (currentFilter === 'all') return true;
            return (song.mediaType || 'audio') === currentFilter;
        });
    }

    function setupFilterControls() {
        if (!filterButtons.length) return;
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const nextFilter = btn.dataset.filter || 'all';
                if (nextFilter === currentFilter) return;
                currentFilter = nextFilter;
                filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter));
                updateVisibleSongs();
                if (isEditingPlaylist && currentPlaylist) {
                    renderMasterSongList(visibleSongs, currentPlaylist, isEditingPlaylist, handleAddSong, handleToggleSongSelect);
                }
            });
        });
    }
} 