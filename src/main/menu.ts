import {
    app,
    Menu,
    shell,
    BrowserWindow,
    MenuItemConstructorOptions,
    ipcMain,
    dialog,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
    selector?: string;
    submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
    mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    openFile = async () => {
        ipcMain.emit('open-file');
    };

    saveFile = async () => {
        this.mainWindow.webContents.send('start-save-file');
    }

    buildMenu(): Menu {
        if (
            process.env.NODE_ENV === 'development' ||
            process.env.DEBUG_PROD === 'true'
        ) {
            this.setupDevelopmentEnvironment();
        }

        const template =
            process.platform === 'darwin'
                ? this.buildDarwinTemplate()
                : this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment(): void {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }

    buildDarwinTemplate(): MenuItemConstructorOptions[] {
        const subMenuAbout: DarwinMenuItemConstructorOptions = {
            label: 'Electron',
            submenu: [
                {
                    label: 'About ElectronReact',
                    selector: 'orderFrontStandardAboutPanel:',
                },
                { type: 'separator' },
                { label: 'Services', submenu: [] },
                { type: 'separator' },
                {
                    label: 'Hide ElectronReact',
                    accelerator: 'Command+H',
                    selector: 'hide:',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:',
                },
                { label: 'Show All', selector: 'unhideAllApplications:' },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        };

        const subMenuFile: DarwinMenuItemConstructorOptions = {
            label: 'File',
            submenu: [
                { label: 'New', accelerator: 'Command+N', selector: 'new:' },
                {
                    label: 'Open',
                    accelerator: 'Command+O',
                    selector: 'open:',
                    click: this.openFile,
                },
                {
                    label: 'Clone',
                    accelerator: 'Command+Shift+C',
                    selector: 'clone:',
                },
                { type: 'separator' },
                { label: 'Save', accelerator: 'Command+S', selector: 'save:', click: this.saveFile },
                {
                    label: 'Merge',
                    accelerator: 'Command+M',
                    selector: 'merge:',
                },
            ],
        };

        return [subMenuAbout, subMenuFile];
    }

    buildDefaultTemplate() {
        const templateDefault = [
            {
                label: '&File',
                submenu: [
                    { label: '&New', accelerator: 'Ctrl+N' },
                    { label: '&Open', accelerator: 'Ctrl+O', click: this.openFile },
                    { label: '&Clone', accelerator: 'Ctrl+Shift+C' },
                    { type: 'separator' },
                    { label: '&Save', accelerator: 'Ctrl+S', click: this.saveFile },
                    { label: '&Merge', accelerator: 'Ctrl+M' },
                ],
            },
        ];

        return templateDefault;
    }
}
