var sys = require('sys'),
    irc = require('irc'),
    express = require('express'),
    io = require('socket.io'),
    ejs = require('ejs'),
    ircjs = require('irc-js');


var clients = [];
var sockets = [];
var uniqueClientId = 0;

function registerClient() {
    var clientId = uniqueClientId;
    uniqueClientId++;
    sys.puts('Using name pandabot' + Date.now());
    //clients[clientId] = new irc.Client('irc.freenode.net', 'pandabot' + clientId, {
    //                userName: 'pandabot' + clientId,
    //                realName: 'Panda Bot',
    //                channels: ['##meatspace']});
    clients[clientId] = new ircjs({server: 'irc.freenode.net',
                                   user : {
                                       username: 'pandabot' + Date.now(),
                                       realname: 'PandaBots -- ' + Date.now()
                                   }});

    clients[clientId].addListener('raw', function(evt, message) {
        if (sockets[clientId] != null) {
            sys.puts('successfully sending message');
            sockets[clientId].send('event ' + evt + ':' + message);
        }
        //sys.puts('event ' + message.command + ':' +  message.args);
    });

    clients[clientId].addListener('error', function(er) {
        sys.puts('Error ' + er);
        if (sockets[clientId] != null) {
            sockets[clientId].send('error' + er);
        }
    });
    clients[clientId].connect(function() { 
        sys.puts('connected ' + clientId);
        clients[clientId].join('##meatspace');
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
