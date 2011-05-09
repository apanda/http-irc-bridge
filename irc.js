var sys = require('sys')
var irc = require('irc')

var client = new irc.Client('irc.freenode.net', 'pandabot', {
                userName: 'pandabot',
                realName: 'Panda Bot',
                channels: ['##meatspace']});

client.addListener('raw', function(message) {
    sys.puts('event ' + message.command + ':' +  message.args);
});

client.addListener('message', function(nick, to, text) {
    sys.puts('message ' + to + ' ' + text);
});


