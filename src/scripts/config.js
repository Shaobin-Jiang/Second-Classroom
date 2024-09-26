const require = parent.window.require;
const { Config } = require("../second-classroom.js");

let config = new Config();

let maxActivity = document.querySelector('#maxActivity')
maxActivity.value = config.config.maxActivityScore;

let maxWork = document.querySelector('#maxWork')
maxWork.value = config.config.maxWorkScore;

document.querySelector('#apply').addEventListener('click', function () {
    config.config = {
        maxActivityScore: maxActivity.value,
        maxWorkScore: maxWork.value,
    }

    config.apply();
    alert('设置已应用');
});
