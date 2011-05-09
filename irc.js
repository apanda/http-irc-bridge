var sys = require('sys'),
    irc = require('irc'),
    express = require('express'),
    io = require('socket.io'),
    ejs = require('ejs');


var clients = [];
var sockets = [];
var uniqueClientId = 0;

function registerClient() {
    clientId = uniqueClientId;
    uniqueClientId++;
    sys.puts('Using name pandabot' + clientId);
    clients[clientId] = new irc.Client('irc.freenode.net', 'pandabot' + clientId, {
                    userName: 'pandabot' + clientId,
                    realName: 'Panda Bot',
                    channels: ['##meatspace']});
    clients[clientId].addListener('raw', function(message) {
        sys.puts('maybe send ' + clientId);
        if (sockets[clientId] != null) {
            sys.puts('successfully sending message');
            sockets[clientId].send('event ' + message.command + ':' + message.args);
        }
        //sys.puts('event ' + message.command + ':' +  message.args);
    });
    
    clients[clientId].addListener('message', function(nick, to, text) {
        //sys.puts('message ' + to + ' ' + text);
    });
    return  clientId;
}

var app = express.createServer();

app.mounted(function(other){
  console.log('ive been mounted!');
});

var html = '\
    <html>\
    <head>\
    <script src=\"http://demo.instagram.com/socket.io/socket.io.js\"> </script>\
    <script>\
    var socket = new io.Socket();\
    socket.connect();\
    socket.on(\'connect\', function() {document.body.innerHTML=\'connected\';});\
    socket.on(\'message\', function(message) {document.body.innerHTML += \'<br />\' + message;});\
    socket.send(\'<%= id %>\');\
    </script>\
    </head>\
    <body>\
    </body>\
    </html>'

app.get('/', function(req, res) {
    sys.puts("Received connection fd: " + req.connection.fd + " remote IP = " + req.connection.remoteAddress + ':' + req.connection.remotePort);
    var clientId = registerClient();
    res.send(ejs.render(html, {
                locals: {
                        id: clientId,
                        clientNumber: clients.length}}));
});


app.listen(7000);

var socket = io.listen(app);
socket.on('connection', function(client) {
    clientId = -1;
    sys.puts('Connected');
    client.on('message', function(message) {
        clientId = parseInt(message);
        sockets[clientId] = client;
        sys.puts('connected ' + clientId);
    });
    client.on('disconnect', function() {
        sys.puts('disconnection ' + clientId);
        clients[clientId].disconnect();
    });
});

sys.puts('Listening at 7000');
