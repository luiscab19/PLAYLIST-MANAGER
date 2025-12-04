const audioFiles = [
    "Blanca Navidad - Jubert Perez.mp3",
    "Mariah Carey - All I Want for Christmas Is You (Make My Wish Come True Edition).mp3",
    "Mi Burrito Sabanero, Juana, Villancico Animado - Mundo Canticuentos.mp3",
    "Rodolfo El Reno, Villancico Clásico Animado - Canticuentos.mp3"
];

const videoFiles = [
    "Blanca Navidad - Jubert Perez.mkv",
    "Mariah Carey - All I Want for Christmas Is You (Make My Wish Come True Edition).mkv",
    "Mi Burrito Sabanero, Juana, Villancico Animado - Mundo Canticuentos.webm",
    "Rodolfo El Reno, Villancico Clásico Animado - Canticuentos.webm"
];

function stripExtension(name) {
    return name.replace(/\.[^.]+$/, '');
}

export function parseSongFilename(filename) {
    const name = stripExtension(filename).trim();

    // Caso: Titulo ft. Artista - Artista
    let match = name.match(/^(.+?)\s+ft\.?\s+(.+?)\s*-\s*(.+)$/i);
    if (match) {
        return {
            title: `${match[1]} ft. ${match[2]}`.trim(),
            artist: match[3].trim()
        };
    }

    // Caso clásico Artista - Título
    match = name.match(/^(.+?)\s*-\s*(.+)$/);
    if (match) {
        return {
            artist: match[1].trim(),
            title: match[2].trim()
        };
    }

    // Fallback: solo título
    return {
        artist: 'Unknown Artist',
        title: name
    };
}

function createMediaItems(files, mediaType, basePath) {
    return files.map((filename) => {
        const { title, artist } = parseSongFilename(filename);
        return {
            title,
            artist,
            mediaType,
            url: `${basePath}/${filename}`
        };
    });
}

const mediaItems = [
    ...createMediaItems(audioFiles, 'audio', 'audio'),
    ...createMediaItems(videoFiles, 'video', 'video')
];

export const songs = mediaItems.map((item, idx) => ({
    id: idx + 1,
    ...item
}));