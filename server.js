var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os');
var monitor = require('os-monitor');
var exec = require('child_process').exec;

var recentEvents = [];
var twoMinutes = 2 * 60 * 1000;
var alerts = [{
  average: 0,
  highUsage: false,
  timestamp: new Date().getTime()
}];

app.use(express.static('public'));

monitor.start({
  delay: monitor.seconds(1),
  immediate: true
});

monitor.on('monitor', function(event) {
  var used = event.totalmem - event.freemem;
  var data = {
    loadavg: event.loadavg,
    maxload: os.cpus().length,
    timestamp: new Date().getTime(),
    usedmemory: Math.floor(used * 100 / event.totalmem)
  };
  io.emit('monitor', data);
  recentEvents.push(data);
  var tsFirstEvent = recentEvents[0].timestamp;
  var tsLastEvent = recentEvents[recentEvents.length-1].timestamp;
  if( tsFirstEvent + twoMinutes <= tsLastEvent ){
    var i = recentEvents.length;
    var totalAvg = 0;
    while (--i) totalAvg += recentEvents[i].loadavg[0];

    var average = totalAvg / recentEvents.length;
    var highUsage = average > data.maxload / 4;

    if(alerts[alerts.length-1].highUsage !== highUsage){
      var alertInfo = {
        average: average,
        highUsage: highUsage,
        timestamp: new Date().getTime()
      };
      alerts.push(alertInfo);
      io.emit('alert', alertInfo);
    }

    recentEvents.length = 0;
  }
});

app.get('/stress', function (req, res) {
  exec('cat /dev/zero > /dev/null');
  res.sendStatus(200);
});

app.get('/unstress', function (req, res) {
  exec('killall cat');
  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function () {
  console.log('App listening on port 3000');
});
