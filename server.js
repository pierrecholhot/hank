var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os');
var monitor = require('os-monitor');
var exec = require('child_process').exec;
var uuid = require('node-uuid');

var history = [];
var recentEvents = [];
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

io.on('connection', function(){
  io.emit('initialState', { history: history, alerts: alerts, cpus: os.cpus().length });
});

monitor.on('monitor', function(event) {
  var data = {
    loadavg: event.loadavg,
    timestamp: new Date().getTime(),
    usedmemory: Math.floor((event.totalmem - event.freemem) * 100 / event.totalmem)
  };
  io.emit('monitor', data);

  recentEvents.push(data);
  if (recentEvents[0].timestamp + monitor.minutes(2) <= recentEvents[recentEvents.length-1].timestamp) {
    var average = totalAverage(recentEvents) / recentEvents.length;
    var highUsage = average > os.cpus().length / 4;
    if(alerts[alerts.length-1].highUsage !== highUsage){
      var alertInfo = {
        average: average,
        highUsage: highUsage,
        timestamp: data.timestamp
      };
      alerts.push(alertInfo);
      io.emit('alert', alertInfo);
    }
    recentEvents.length = 0;
  }

  history.push(data);
  if (history[0].timestamp + monitor.minutes(10) <= history[history.length-1].timestamp) {
    history.shift();
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

function totalAverage(arr){
  var i = arr.length, total = 0;
  while (--i) total += arr[i].loadavg[0];
  return total;
}
