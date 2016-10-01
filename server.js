var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os');
var monitor = require('os-monitor');
var exec = require('child_process').exec;

app.use(express.static('public'));

monitor.start({
  delay: monitor.seconds(1),
  immediate: true
});

monitor.on('monitor', function(event) {
  var used = event.totalmem - event.freemem;
  io.emit('monitor', {
    loadavg: event.loadavg,
    maxload: os.cpus().length,
    timestamp: new Date().getTime(),
    usedmemory: Math.floor(used * 100 / event.totalmem)
  });
});

app.get('/ddos', function (req, res) {
  exec('cat /dev/zero > /dev/null');
  res.sendStatus(200);
});

app.get('/ddos-clear', function (req, res) {
  exec('killall cat');
  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function () {
  console.log('App listening on port 3000');
});
