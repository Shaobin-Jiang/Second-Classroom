const ipc = require('electron').ipcRenderer;

// Toggle dev tools
document.onkeydown = function(e) {
    switch (e.key) {
        case 'F12': ipc.send('dev-tools'); break;
        case 'F5': document.querySelector('iframe').contentWindow.document.location.reload(true); break;
        case 'r': case 'R': if (e.ctrlKey) {
            parent.document.location.reload(true);
        }
    }
}

for (let option of document.querySelectorAll('.option')) {
    option.addEventListener('click', function() {
        document.querySelector('iframe').style.display = 'block';

        // highlight
        for (let option of document.querySelectorAll('.option')) {
            if (option.classList.contains('highlight')) {
                option.classList.remove('highlight');;
            }
        }

        if (!option.classList.contains('highlight')) {
            option.classList.add('highlight');;
        }
    });
}

// Fake icons
document.querySelector('#minimize').onclick = function() {
    ipc.send('minimize');
}
document.querySelector('#close').onclick = function() {
    ipc.send('close');
}