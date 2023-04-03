//const path = require('path');

const { ipcRenderer } = require('electron');

window.openChat = function(accountInfo){
  localStorage.setItem('account', JSON.stringify(accountInfo));
  ipcRenderer.send('asynchronous-message', []);
}