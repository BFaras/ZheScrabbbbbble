const { ipcRenderer } = require('electron');

let updateTheme;
let updateLanguage;
let updateGameRoomChat;

window.setCallbacks = function(updateThemeCallback, updateLanguageCallback, updateGameRoomCallback) {
    updateTheme = updateThemeCallback;
    updateLanguage = updateLanguageCallback;
    updateGameRoomChat = updateGameRoomCallback;
}  

ipcRenderer.on('update-theme', function(){
    updateTheme();
});

ipcRenderer.on('update-language', function(){
    updateLanguage();
});

ipcRenderer.on('update-game-chat', function(){
    updateGameRoomChat();
});