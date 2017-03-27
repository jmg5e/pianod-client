/*
   wscat -c ws://localhost:port/
*/
// import {Injectable} from '@angular/core';
// @Injectable()
const ws = require('ws');

const response = require('./response');
const config = require('../config.json');

const wss = new ws.Server({port : config.testServer.port, path : '/pianod'});
console.log('websocket server started on port : ' + config.testServer.port);
wss.on('connection', function connection(ws) {
  response['connected'].forEach(msg => ws.send(msg));
  ws.on('message', (message) => {
    if (message === 'null') {

    }
    // console.log(message);
    else {
      let responseToSend = lookForResponse(message);
      if (responseToSend.length <= 0) {
        ws.send(`400 Bad command ${message}`);
      } else
        responseToSend.forEach(msg => ws.send(msg));
    }
  });
});

function lookForResponse(message) {
  let responseToSend = [];
  return Object.keys(response)
      .filter(key => key.toUpperCase() === message.toUpperCase())
      .reduce((results, key) => response[key], []);
}
