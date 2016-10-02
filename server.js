var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os');
var monitor = require('os-monitor');
var exec = require('child_process').exec;

var monitorConfig = {
  delay: monitor.seconds(1),
  immediate: true
};

var TOTAL_CPU = os.cpus().length;
var MAX_LOAD = TOTAL_CPU / 4;

var history = [];
var recentEvents = [];

var alerts = [{
  average: 0,
  highUsage: false,
  timestamp: new Date().getTime()
}];

app.use(express.static('public'));
app.set('views', './app/views')
app.set('view engine', 'pug');

app.get('/stress', function (req, res) {
  stress();
  res.sendStatus(200);
});

app.get('/unstress', function (req, res) {
  unstress();
  res.sendStatus(200);
});

app.get('/', function (req, res) {
  res.render('index', {
    totalCPUs: TOTAL_CPU,
    maxLoad: MAX_LOAD
  });
});

monitor.start(monitorConfig);
monitor.on('monitor', handleMonitorEvent);

io.on('connection', emitInitialState);

server.listen(3000, started);

function started() {
  console.log('Hank is listening on port 3000');
}

function stress() {
  exec('cat /dev/zero > /dev/null');
}

function unstress() {
  exec('killall cat');
}

function emitInitialState() {
  io.emit('initialState', {
    cpus: TOTAL_CPU,
    history: history,
    alerts: alerts.filter(function (a, i) {
      return i !== 0;
    })
  });
}

function handleMonitorEvent(event) {

  var data = {
    loadavg: event.loadavg[0],
    timestamp: new Date().getTime(),
    usedmemory: Math.floor((event.totalmem - event.freemem) * 100 / event.totalmem)
  };

  history.push(data);
  recentEvents.push(data);

  if (isCollectionFull(recentEvents, monitor.minutes(2))) {
    var totalLoadAvg = recentEvents.reduce(function (a, b) {
      return (a.loadavg || a) + b.loadavg;
    });
    var average = totalLoadAvg / recentEvents.length;

    checkForAlert(average, data.timestamp);
    recentEvents.length = 0;
  }

  if (isCollectionFull(history, monitor.minutes(10))) {
    history.shift();
    data.historyFull = true;
  }

  io.emit('monitor', data);
}

function isCollectionFull(col, max){
  return col[0].timestamp + max <= col[col.length - 1].timestamp;
}

function checkForAlert(average, timestamp) {
  var highUsage = average > MAX_LOAD;
  var lastAlert = alerts[alerts.length - 1];

  if (lastAlert.highUsage !== highUsage) {
    var alertInfo = {
      average: average,
      highUsage: highUsage,
      timestamp: timestamp
    };

    alerts.push(alertInfo);
    io.emit('alert', alertInfo);
  }
}
