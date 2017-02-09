const {app} = require('electron');
//var BrowserWindow = require('browser-window');
const {BrowserWindow} = require('electron');
const {crashReporter} = require('electron');

crashReporter.start({
  productName: 'YourName',
  companyName: 'YourCompany',
  submitURL: 'https://your-domain.com/url-to-submit',
  autoSubmit: true
});

let player = null;

/*app.on(
    'window-all-closed',
    function() {
        if (process.platform != 'darwin') {
            app.quit();
        }
    }
);
*/
app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on(
    'ready',
    function() {
        player = new BrowserWindow(
            {
                title:'Electron Video Player',
                'accept-first-mouse':true,
                width: 640,
                height: 480,
                'min-width': 640,
                'min-height': 480,
                frame:false,
                icon:__dirname+'/img/logo-256.png',
                'text-areas-are-resizable':false
            }
        );

        player.loadURL('file://' + __dirname + '/index.html');

        /* for debugging */
        //player.openDevTools();
        
        player.show();

        player.on(
            'closed', () =>{
                player = null;
            }
        );
    }
);
