# To-Do-Board

Lightweight sticky-note board built with vanilla HTML/CSS/JS.

## Files
- [index.html](index.html) — app shell and toolbar.
- [style.css](style.css) — UI styles.
- [script.js](script.js) — application logic.
- [assets/](assets/) — icons and static assets.

## Features
- Create draggable, resizable sticky notes (`New Note`).
- Per-note title, color and task list with reordering (drag & drop).
- Persistent storage via localStorage (key used by [`saveToStorage`](script.js)).
- Double-click a note to change its color (uses selected color from toolbar).
- Clear all notes (`Clear All`).

## Quick start
1. Open [index.html](index.html) in your browser.
2. Use the toolbar to add notes, pick colors, or clear the board.

## Important DOM IDs & functions
- Toolbar buttons / controls:
  - `addStickerBtn` (adds a note via [`addSticker`](script.js))
  - `clearAllBtn` (clears board)
  - `customColorPicker` (color input)
  - workspace container: `workspace`
- Key JS functions (in [script.js](script.js)):
  - [`initBoard`](script.js) — loads saved state and creates initial note(s).
  - [`loadFromStorage`](script.js) / [`saveToStorage`](script.js) — persistence.
  - [`createStickerElement`](script.js) — builds note DOM with drag/resize/tasks.
  - [`deleteSticker`](script.js) — removes a note.

## Data format
Notes are stored in localStorage under `sticky-board-data` as an array of objects:
- id, x, y, width, height, color, title, tasks (array of {text, done}), zIndex

(See [`saveToStorage`](script.js) / [`loadFromStorage`](script.js) for serialization.)

## Development notes
- No build step — plain static files.
- To modify appearance, edit [style.css](style.css).
- To change behavior, edit [script.js](script.js).
