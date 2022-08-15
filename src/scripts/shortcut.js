const ipc = require('electron').ipcRenderer;
document.onkeydown = function (e) {
    switch (e.key) {
        case 'F12': ipc.send('dev-tools'); break;
        case 'F5': document.location.reload(true); break;
        case 'r': case 'R': if (e.ctrlKey) {
            parent.document.location.reload(true);
        }
    }
}