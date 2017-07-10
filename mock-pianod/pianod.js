/*
   wscat -c ws://localhost:port/
  */
const ws = require('ws');
const response = require('./response');
const config = require('../config.js');

const wss = new ws.Server({port : config.mockPianod.port, path : '/pianod'});
console.log('Mock Pianod websocket started on port : ' +
    config.mockPianod.port);
wss.on('connection', function connection(ws) {
    response['connected'].forEach(msg => ws.send(msg));
    ws.on('message', (message) => {
        const responseToSend = lookUpResponse(message);
        if (responseToSend.length <= 0 && message !== 'null') {
            ws.send(`400 Bad command ${message}`);
        } else
            responseToSend.forEach(msg => ws.send(msg));
    });
});

function lookUpResponse(message) {
    let responseToSend = [];
    return Object.keys(response)
        .filter(key => key.toUpperCase() === message.toUpperCase())
        .reduce((results, key) => response[key], []);
}
