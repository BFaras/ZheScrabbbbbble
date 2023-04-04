const { ipcRenderer } = require('electron');

let chatStatusCallback;

window.openChat = function(accountInfo){
  localStorage.setItem('account', JSON.stringify(accountInfo));
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