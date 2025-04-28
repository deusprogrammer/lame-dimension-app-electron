/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, protocol, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';

const HOME: string =
    process.platform === 'darwin'
        ? process.env.HOME || '/'
        : `${process.env.HOMEDRIVE}${process.env.HOMEPATH}/AppData/Local/ld-editor`;
const CONFIG_FILE: string = `${HOME}/.ld-editor.conf`;

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
        .default(
            extensions.map((name) => installer[name]),
            forceDownload,
        )
        .catch(console.log);
};

type CharacterObject = {
    name: String;
    emotes: [String?];
};

const processAssets = (assetsPath: String) => {
    let emotes = fs.readdirSync(assetsPath + '/sprites', {
        withFileTypes: true,
    });
    let characterObject: { [Name: string]: CharacterObject } = {};

    emotes
        .filter((file) => file.isDirectory())
        .forEach((file) => {
            let emoteName = file.name;
            let characters = fs.readdirSync(
                assetsPath + '/sprites/' + file.name,
            );
            characters
                .filter((file) => !file.startsWith('.'))
                .forEach((characterName) => {
                    characterName = characterName
                        .replace(emoteName, '')
                        .replace('spr_', '');
                    if (!characterObject[characterName]) {
                        characterObject[characterName] = {
                            name: characterName,
                            emotes: [],
                        };
                    }
                    characterObject[characterName].emotes.push(emoteName);
                });
        });

    return characterObject;
};

const createWindow = async () => {
    if (isDebug) {
        await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'assets')
        : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1920,
        height: 1080,
        minWidth: 1920,
        minHeight: 1080,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            preload: app.isPackaged
                ? path.join(__dirname, 'preload.js')
                : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    protocol.interceptFileProtocol('sprites', (request, callback) => {
        if (!config.currentProject) {
            return;
        }

        let filePath = request.url.substring('sprites://'.length);

        let [, character, emote, file] =
            filePath.match(/(.*)\/(.*)\/(.*)/) ?? [];

        let spritePath = `${config.currentProject}/assets/sprites/${emote}/spr_${character}${emote}/${file}.png`;

        callback(spritePath);
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady()
    .then(() => {
        createWindow();
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) createWindow();
        });
    })
    .catch(console.log);

const readYyFile = (yyFile: string) => {
    const data: Buffer = fs.readFileSync(yyFile);

    // Remove trailing commas with whitespace using regex
    const cleanedData = data.toString().replace(/,\s*([\]}])/g, '$1');

    // Parsing as JSON
    const jsonData = JSON.parse(cleanedData);
    return jsonData;
}

const writeConfig = (newConfig: any) => {
    console.log("CONFIG FILE: " + CONFIG_FILE);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 5));
};

const readConfig = (): any => {
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.mkdirSync(HOME, { recursive: true });
        fs.writeFileSync(
            CONFIG_FILE,
            `{
            "currentProject": "",
            "previousProjects": []
        }`,
        );
    }

    let configJSON = fs.readFileSync(CONFIG_FILE);
    return JSON.parse(configJSON.toString());
};

const stripNoSqlRemnants = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(stripNoSqlRemnants);
    }

    Object.keys(obj).forEach((key) => {
        if (key === '_id') {
            delete obj[key];
        } else {
            obj[key] = stripNoSqlRemnants(obj[key]);
        }
    });

    return obj;
};

// Global variables
let config: any = readConfig();

ipcMain.handle('loadScript', (event) => {
    if (!config.currentProject) {
        return {
            categories: {},
            categoryData: {},
            chapters: [],
        };
    }
    let scriptDir = `${config.currentProject}/script.json`;
    let assetDirectory = `${config.currentProject}/assets`;
    const fileContents = fs.readFileSync(scriptDir);
    let data = JSON.parse(fileContents.toString());
    data = { ...data, characters: processAssets(assetDirectory) };
    return data;
});

ipcMain.handle('loadDatabase', (event) => {
    if (!config.currentProject) {
        return {
            categories: {},
            categoryData: {},
            chapters: [],
        };
    }
    let dbDir = `${config.currentProject}/database.json`;
    const fileContents = fs.readFileSync(dbDir);
    let data = JSON.parse(fileContents.toString());
    data = { ...data };
    return data;
});

ipcMain.handle('getSpriteData', (event, character, emote) => {
    if (!config.currentProject) {
        return {};
    }
    let directory = `${config.currentProject}/assets/sprites/${emote}/spr_${character}${emote}`;
    let spriteFile = `${directory}/spr_${character}${emote}.yy`;

    return readYyFile(spriteFile);
});

ipcMain.handle('getScriptName', (event, character, emote) => {
    return config.currentProject.substring(
        config.currentProject.lastIndexOf('/') + 1,
    );
});

ipcMain.handle('saveScript', async (event, script) => {
    script = stripNoSqlRemnants(script);
    fs.copyFileSync(
        `${config.currentProject}/script.json`,
        `${config.currentProject}/script.json.bak`,
    );
    fs.writeFileSync(
        `${config.currentProject}/script.json`,
        JSON.stringify(script, null, 5),
    );
});

ipcMain.handle('saveDatabase', async (event, db) => {
    db = stripNoSqlRemnants(db);
    fs.copyFileSync(
        `${config.currentProject}/database.json`,
        `${config.currentProject}/database.json.bak`,
    );
    fs.writeFileSync(
        `${config.currentProject}/database.json`,
        JSON.stringify(db, null, 5),
    );
});

ipcMain.handle('mergeFile', async (event) => {
    const response = await dialog.showOpenDialog({
        title: "Select File to Merge",
        properties: ['openFile'],
    });

    if (response.canceled) {
        return;
    }

    let mergingStr : string = fs.readFileSync(response.filePaths[0]).toString();
    let merging = JSON.parse(mergingStr);
    return merging;
});

ipcMain.on('open-file', async (event) => {
    const response = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });

    if (response.canceled) {
        return;
    }

    config.currentProject = response.filePaths[0];
    console.log("CURRENT PROJECT: " + config.currentProject);
    writeConfig(config);

    mainWindow?.reload();
});

ipcMain.on('new-file', async (event) => {
    config.currentProject = null;
    writeConfig(config);

    mainWindow?.reload();
});
