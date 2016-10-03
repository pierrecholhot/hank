const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const os = require('os')
const monitor = require('os-monitor')
const exec = require('child_process').exec

const monitorConfig = {
  delay: monitor.seconds(1),
  immediate: true
}

const TOTAL_CPU = os.cpus().length
const MAX_LOAD = TOTAL_CPU / 4

const history = []
const recentEvents = []

const alerts = [{
  average: 0,
  highUsage: false,
  timestamp: new Date().getTime()
}]

app.use(express.static('public'))
app.set('views', './app/views')
app.set('view engine', 'pug')

app.get('/stress', (req, res) => {
  stress()
  res.sendStatus(200)
})

app.get('/unstress', (req, res) => {
  unstress()
  res.sendStatus(200)
})

app.get('/', (req, res) => {
  res.render('index', {
    totalCPUs: TOTAL_CPU,
    maxLoad: MAX_LOAD
  })
})

monitor.start(monitorConfig)
monitor.on('monitor', handleMonitorEvent)
io.on('connection', emitInitialState)
listen();

function listen() {
  server.listen(3000, () => {
    console.log('Hank is listening on port 3000')
  })
}

function kill() {
  server.close(() => {
    console.log('Hank is no longer listening on port 3000')
  })
}

function stress() {
  exec('cat /dev/zero > /dev/null')
}

function unstress() {
  exec('killall cat')
}

function emitInitialState() {
  io.emit('initialState', {
    history,
    cpus: TOTAL_CPU,
    alerts: alerts.filter((a, i) => i !== 0)
  })
}

function handleMonitorEvent(event) {
  const data = {
    loadavg: event.loadavg[0],
    timestamp: new Date().getTime(),
    usedmemory: Math.floor((event.totalmem - event.freemem) * 100 / event.totalmem)
  }

  history.push(data)
  recentEvents.push(data)

  if (isCollectionFull(recentEvents, monitor.minutes(2))) {
    const totalLoadAvg = recentEvents.reduce((a, b) => (a.loadavg || a) + b.loadavg)
    const average = totalLoadAvg / recentEvents.length
    checkForAlert(average, data.timestamp)
    recentEvents.length = 0
  }

  if (isCollectionFull(history, monitor.minutes(10))) {
    history.shift()
    data.historyFull = true
  }

  io.emit('monitor', data)
}

function isCollectionFull(col, max){
  return col[0].timestamp + max <= col[col.length - 1].timestamp
}

function checkForAlert(average, timestamp) {
  const highUsage = average > MAX_LOAD
  const lastAlert = alerts[alerts.length - 1]
  const alertInfo = { average, highUsage, timestamp }

  if (lastAlert.highUsage !== highUsage) {
    alerts.push(alertInfo)
    io.emit('alert', alertInfo)
  }

  return alertInfo;
}

module.exports = { listen, kill, checkForAlert }
