# Lame Dimension Script Editor - AI Coding Guide

## Project Overview
An Electron-based desktop application for editing game dialogue and game data (items, skills, accessories, etc.). Built with Electron React Boilerplate, React 18, TypeScript (main process), and JSX (renderer). The editor manages multi-language dialogue organized into chapters and scenes, character sprites with emotes, and database categories for game items with customizable field templates.

## Architecture

### Process Model (Electron IPC)
- **Main Process** (`src/main/main.ts`): Manages file I/O, project config, sprite processing
- **Renderer Process** (`src/renderer/`): React UI with routing
- **IPC Bridge** (`src/main/preload.ts`): Exposes `window.electron.ipcRenderer.sendMessage(channel, ...args)` 

**Key IPC Channels:**
- `loadScript` - Loads `script.json` from current project
- `saveScript` - Saves script.json with `.bak` backup
- `loadDatabase`/`saveDatabase` - Database CRUD operations
- `getSpriteData` - Reads GameMaker `.yy` sprite files
- `open-file`/`new-file` - Project directory selection via menu

**Critical Pattern:** IPC uses `ipcMain.handle()` for async responses, `ipcMain.on()` for fire-and-forget. Menu triggers emit IPC events (`ipcMain.emit('open-file')`), which reload the renderer window.

### State Management
- **Jotai atoms** (`src/renderer/atoms/`): Global state for user auth and characters
- **Local useState**: Component-level state for scripts, chapters, scenes
- **immutability-helper**: All state updates use `update()` for immutable mutations

### Data Model
**Project Directory Structure** (external to app):
```
project/
  script.json      # Chapters, scenes, dialogue (multi-language)
  database.json    # Categories, category data (items, skills, etc.)
  assets/
    sprites/
      [emote]/
        spr_[character][emote]/
          *.png
          spr_[character][emote].yy  # GameMaker sprite metadata
```

**script.json Structure:**
- `chapters: { [key]: { scenes: { [sceneKey]: { dialogue: [] } } } }`
- `dialogue[]`: Array of entries with `text: {en, es, jp, fr, br, ch}`, `positions`, `active`, `emote`, `choices`

**database.json Structure:**
- `categories: { [key]: { template: [{key, label, dataType, localized}] } }`
- `categoryData: { [categoryKey]: { [itemKey]: {...fields} } }`

### Routing (`src/renderer/AppRouter.jsx`)
- `/editor/script` - ScriptEditor (dialogue, chapters, scenes)
- `/editor/database` - DatabaseEditor (categories, items)
- `/login`, `/user`, `/admin` - Auth routes (JWT-based, uses `process.env.REACT_APP_API_DOMAIN`)

### Custom File Protocol
`protocol.interceptFileProtocol('sprites', ...)` maps `sprites://character/emote/file` to local sprite assets. Used by PixiJS sprite rendering (`CharacterSprite.jsx`).

## Key Developer Workflows

### Development
```bash
npm start         # Starts renderer dev server + hot reload
npm run start:main   # Starts main process with electronmon
```

### Building
```bash
npm run build     # Webpack build for main + renderer
npm run package   # Creates distributable (uses electron-builder config in package.json)
```

### Testing
```bash
npm test          # Jest with jsdom environment
```

## Project-Specific Conventions

### File Naming
- **Main process:** `.ts` (TypeScript)
- **Renderer:** `.jsx` (React components), `.js` (utilities)
- **No default exports in components:** Many components use `export default () => { ... }` pattern
- **Atoms:** `[name].atom.js` files in `src/renderer/atoms/`

### Naming Conventions
- **Keys/IDs:** Snake_case for chapter/scene/category keys (`my_chapter_01`)
- **Sanitization:** `.replace(' ', '_').replace(/[^a-zA-Z0-9_]/, '')` applied to user-generated keys
- **Localized fields:** Objects with `{en, es, jp, fr, br, ch}` keys

### State Updates
**Always use immutability-helper or spread operators:**
```jsx
import update from 'immutability-helper';
let sceneCopy = { ...scene };
sceneCopy.dialogue[index] = update(sceneCopy.dialogue[index], { $merge: { text: newText } });
```

### Path Navigation Utility (`src/main/nina.js` & `src/renderer/util/nina.js`)
**Custom path syntax:** `"chapters.chapter1.scenes[0].dialogue[2].text.en"`
- `getValueAtPath(obj, path)` - Retrieves nested values
- `setValueAtPath(obj, path, value)` - Sets/deletes nested values (null = delete)
- `getDiff(obj1, obj2)` - Generates ADDED/REMOVED/CHANGED operations with paths

Used for merge conflict resolution and undo/redo.

### Config Storage
- **User config:** `~/.ld-editor.conf` (macOS) or `%LOCALAPPDATA%\ld-editor\.ld-editor.conf` (Windows)
- **Structure:** `{ currentProject: "path", previousProjects: [] }`
- Persisted on project open/new via menu actions

## Critical Integration Points

### GameMaker Asset Loading
`readYyFile()` strips trailing commas from `.yy` JSON before parsing (GameMaker quirk). Returns sprite frame data for PixiJS.

### NoSQL Remnant Stripping
`stripNoSqlRemnants()` recursively removes `_id` fields before saving (legacy MongoDB integration).

### Menu System
`src/main/menu.js` builds platform-specific menus. Triggering "Save" sends `start-save-file` event to renderer, which calls `saveScript`/`saveDatabase`.

### Character Sprite Processing
`processAssets()` scans `/assets/sprites/[emote]/spr_[character][emote]/` to generate `characters: { [name]: { emotes: [] } }` map.

## Common Pitfalls

1. **IPC Channel Types:** Renderer uses `sendMessage()` (promise-based), but main uses both `handle()` (async) and `on()` (sync). Don't mix.
2. **Project Path Dependency:** Most IPC handlers check `if (!config.currentProject) return;` - UI must handle null returns gracefully.
3. **Language Fallback:** Always check `text[language]` exists before rendering, fallback to `defaultLanguage`.
4. **Key Sanitization:** User-generated keys must be sanitized before use as object keys or file names.
5. **Backup Files:** `.bak` files created on save - don't auto-load them.

## External Dependencies
- **axios:** API calls to `process.env.REACT_APP_API_DOMAIN` for user auth (optional backend)
- **pixi.js + @pixi/react:** Character sprite rendering
- **react-toastify:** All error/success feedback uses `toast.error()` / `toast.info()`
- **Electron Webpack Config:** Uses `.erb/configs/` webpack configurations (don't modify directly)
