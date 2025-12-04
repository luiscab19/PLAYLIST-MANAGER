# Playlist Manager - Práctica de IndexedDB

Un proyecto universitario simple para aprender y practicar el uso de IndexedDB en aplicaciones web.

## Objetivo del Proyecto

Crear una aplicación web que permita gestionar listas de reproducción musical usando IndexedDB para almacenamiento local en el navegador.

## Funcionalidades Principales

- Crear, editar y eliminar playlists
- Agregar/remover canciones de playlists
- Almacenamiento local con IndexedDB
- Interfaz web básica y funcional
- Búsqueda de canciones

## Tecnologías Usadas

- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos básicos
- **JavaScript ES6+** - Lógica de la aplicación
- **IndexedDB API** - Base de datos en el navegador
- **Visual Studio Code** - Editor de código

## Estructura del Proyecto

```
PLAYLIST-MANAGER/
├── index.html          # Página principal
├── style.css          # Estilos CSS
├── app.js             # Lógica principal de la aplicación
├── db.js              # Configuración de IndexedDB
├── README.md          # Este archivo
└── assets/            # Recursos (imágenes, íconos, etc.)
```

## Cómo Usar

1. Clona el repositorio:
```bash
git clone https://github.com/luiscab19/PLAYLIST-MANAGER.git
```

2. Abre el proyecto en tu editor de código

3. Abre `index.html` en tu navegador web

4. ¡Comienza a crear tus playlists!

## 📖 Características de IndexedDB Implementadas

- **Creación de base de datos** - Configuración inicial
- **Object Stores** - Para playlists y canciones
- **CRUD Completo** - Crear, Leer, Actualizar, Eliminar
- **Transacciones** - Operaciones seguras
- **Índices** - Búsquedas eficientes

## Ejemplo de Código IndexedDB

```javascript
// Abrir/Crear base de datos
const request = indexedDB.open('PlaylistDB', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // Crear object store para playlists
  const playlistStore = db.createObjectStore('playlists', {
    keyPath: 'id',
    autoIncrement: true
  });
  
  // Crear object store para canciones
  const songStore = db.createObjectStore('songs', {
    keyPath: 'id',
    autoIncrement: true
  });
};
```

## Funcionalidades de la Aplicación

1. **Gestión de Playlists:**
   - Crear nueva playlist
   - Ver todas las playlists
   - Editar nombre de playlist
   - Eliminar playlist

2. **Gestión de Canciones:**
   - Agregar canciones a playlists
   - Remover canciones
   - Buscar canciones
   - Ver detalles de canciones

## Conceptos de IndexedDB Aprendidos

- Configuración de bases de datos
- Manejo de versiones
- Operaciones asíncronas
- Manejo de errores
- Optimización de consultas

## Requisitos Universitarios Cumplidos

- [x] Implementación de IndexedDB
- [x] Interfaz de usuario funcional
- [x] Operaciones CRUD completas
- [x] Código bien documentado
- [x] Manejo de errores apropiado

## Autor

**Luis Alvarez**  
Estudiante Universitario  
GitHub: [@luiscab19](https://github.com/luiscab19)
Proyecto educativo - Uso libre para fines académicos.

---

⭐ **Proyecto creado con fines educativos para practicar IndexedDB** ⭐
