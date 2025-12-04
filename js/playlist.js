import { getStore } from './db.js';

export function savePlaylist(name, songIds, callback) {
    const store = getStore('playlists', 'readwrite');
    if (!store) return;
    const newPlaylist = { name: name, songIds: songIds || [] };
    const request = store.add(newPlaylist);
    request.onsuccess = (e) => {
        // e.target.result es el ID insertado
        callback(e.target.result);
    };
}

export function deletePlaylist(id, callback) {
    const store = getStore('playlists', 'readwrite');
    if (!store) return;
    store.delete(id).onsuccess = callback;
}

export function updatePlaylistSongs(playlistId, songIds, callback) {
    const store = getStore('playlists', 'readwrite');
    if (!store) return;
    store.get(playlistId).onsuccess = (e) => {
        const playlist = e.target.result;
        playlist.songIds = songIds;
        store.put(playlist).onsuccess = callback;
    };
}

export function getPlaylistById(id, callback) {
    const store = getStore('playlists', 'readonly');
    if (!store) return;
    store.get(id).onsuccess = (e) => {
        callback(e.target.result);
    };
} 