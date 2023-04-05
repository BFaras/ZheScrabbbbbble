const { ipcRenderer } = require('electron');

let chatStatusCallback;

window.openChat = function(accountInfo, theme, language){
  localStorage.setItem('account', JSON.stringify(accountInfo));
  localStorage.setItem('theme', JSON.stringify(theme));
  localStorage.setItem('language', language);
  window.chatOpen = true;
  chatStatusCallback();
  ipcRenderer.send('open-chat');
}

window.setChatStatusCallback = function(callbackFunction){
  chatStatusCallback = callbackFunction;
}

ipcRenderer.on('close-chat', function(){
  window.chatOpen = false;
  chatStatusCallback();
});

window.updateTheme = function(theme){
  localStorage.setItem('theme', JSON.stringify(theme));
  ipcRenderer.send('update-theme');
}

window.updateLanguage = function(language){
  localStorage.setItem('language', language);
  ipcRenderer.send('update-language');
}