const { ipcRenderer } = require('electron');

localStorage.removeItem('theme');
localStorage.removeItem('language');
localStorage.removeItem('account');
localStorage.removeItem('gameRoomChat');

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

window.updateRoomChat = function(chatId){
  if(chatId){
    localStorage.setItem('gameRoomChat', chatId);
  }else{
    localStorage.removeItem('gameRoomChat');
  }
  ipcRenderer.send('update-game-chat');
}
