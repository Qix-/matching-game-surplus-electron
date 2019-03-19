import {app, BrowserWindow} from 'electron';

// Allow us to use <video autoplay>
// https://github.com/electron/electron/issues/13525#issuecomment-410923391
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow(): void {
	let win = new BrowserWindow({
		width: 1024,
		height: 768,
		minWidth: 340,
		minHeight: 270,
		show: false,
		backgroundColor: '#FFFFFF',
		webPreferences: {
			nodeIntegration: false
		},
		titleBarStyle: 'hiddenInset'
	});

	win.once('ready-to-show', (): void => {
		win.show();
		win.webContents.openDevTools();
	});

	win.on('close', (): void => {
		win = null;
	});

	win.loadURL(`file:///${__dirname}/browser/index.html`);
}

app.on('ready', createWindow);

