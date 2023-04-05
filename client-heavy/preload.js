//const path = require('path');

const { ipcRenderer } = require('electron');

window.openChat = function(hi){
  /*
  const combox = document.getElementById('ComBox');
  combox.classList.add('d-none');
  const body = document.querySelector("body");
  const socketID = body.getAttribute('socketID');
  const currentChannel = body.getAttribute('currentChannel');
  const classList = Object.values(body.classList).join(' ');
  */
  console.log(hi);
  ipcRenderer.send('asynchronous-message', [hi]);
}