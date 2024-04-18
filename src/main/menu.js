import {
    app,
    Menu,
    shell,
    BrowserWindow,
    MenuItemConstructorOptions,
    ipcMain,
    dialog,
} from 'electron';

export default class MenuBuilder {
    mainWindow;

    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    }

    openFile = async () => {
        ipcMain.emit('open-file');
    };

    saveFile = async () => {
        this.mainWindow.webContents.send('start-save-file');
    }

    newFile = async () => {
        ipcMain.emit('new-file');
    }

    reload = async () => {
        this.mainWindow.reload();
    }

    buildMenu() {
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

    setupDevelopmentEnvironment() {
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

    buildDarwinTemplate() {
        const subMenuAbout = {
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

        const subMenuFile = {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    accelerator: 'Command+N',
                    selector: 'new:',
                    click: this.newFile,
                },{
                    label: 'Open',
                    accelerator: 'Command+O',
                    selector: 'open:',
                    click: this.openFile,
                },{
                    label: 'Clone',
                    accelerator: 'Command+Shift+C',
                    selector: 'clone:',
                    enabled: false
                },{ type: 'separator' },
                {
                    label: 'Save',
                    accelerator: 'Command+S',
                    selector: 'save:',
                    click: this.saveFile
                }
            ],
        };

        const subMenuEdit = {
            label: 'Edit',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'Command+R',
                    selector: 'undo:',
                    click: this.reload,
                }
            ],
        };

        return [subMenuAbout, subMenuFile, subMenuEdit];
    }

    buildDefaultTemplate() {
        const templateDefault = [
            {
                label: '&File',
                submenu: [
                    {
                        label: '&New',
                        accelerator: 'Ctrl+N',
                        click: this.newFile
                    },{
                        label: '&Open',
                        accelerator: 'Ctrl+O',
                        click: this.openFile
                    },{
                        label: '&Clone',
                        accelerator: 'Ctrl+Shift+C',
                        enabled: false
                    },{
                        type: 'separator'
                    },{
                        label: '&Save',
                        accelerator: 'Ctrl+S',
                        click: this.saveFile
                    }
                ],
            },{
                label: '&Edit',
                submenu: [
                    {
                        label: '&Reload',
                        accelerator: 'Ctrl+R',
                        click: this.reload
                    }
                ],
            }
        ];

        return templateDefault;
    }
}
