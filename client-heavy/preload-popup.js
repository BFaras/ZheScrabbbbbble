const { ipcRenderer } = require('electron');

let updateTheme;
let updateLanguage;

window.setCallbacks = function(updateThemeCallback, updateLanguageCallback) {
    updateTheme = updateThemeCallback;
    updateLanguage = updateLanguageCallback;
}  

ipcRenderer.on('update-theme', function(){
    updateTheme();
});

ipcRenderer.on('update-language', function(){
    updateLanguage();
});