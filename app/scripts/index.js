import IO from 'socket.io-client'
import request from 'superagent'
import Highcharts from 'highcharts'
require('./charts/')(Highcharts)

import 'normalize.css'
import '../styles/index.css'

import loadChartConfig from './config/load-average'
import memoryChartConfig from './config/memory'
import { alertUser } from './alert'

const socket = IO.connect('http://localhost:3000/')

socket.on('initialState', initialize)
socket.on('alert', alertUser)

function initialize (state) {
  const loadChart = initializeLoadAvgChart(state)
  const memoryChart = initializeMemoryChart(state)
  state.alerts.forEach(alertUser)
}

function initializeLoadAvgChart (state) {
  const rewriteHistoryObj = ({ timestamp, loadavg }) => [timestamp, loadavg]
  loadChartConfig.chart.events.load = loadAvgChartReady
  loadChartConfig.yAxis.max = state.cpus
  loadChartConfig.series[0].data = state.history.map(rewriteHistoryObj)
  return new Highcharts.Chart(loadChartConfig)
}

function initializeMemoryChart (state) {
  memoryChartConfig.chart.events.load = memoryChartReady
  return new Highcharts.Chart(memoryChartConfig)
}

function loadAvgChartReady (e) {
  socket.on('monitor', ({ timestamp, loadavg, historyFull }) => {
    // the last two arguments are responsible for clearing old points
    // and moving the chart when new points are added,
    // hence their relation to our history.
    // in other words, if we have 10 minutes of history to show,
    // we start animating the graph when pushing new data.
    // this circumvents a bug when the server just started and has no history
    e.target.series[0].addPoint([timestamp, loadavg], historyFull, historyFull)
  })
}

function memoryChartReady (e) {
  socket.on('monitor', ({ usedmemory }) => {
    e.target.series[0].points[0].update(usedmemory)
  })
}

function stress (e) {
  request.get('/stress').end()
  document.getElementById('stress').style.display = 'none'
}

function unstress (e) {
  request.get('/unstress').end()
  document.getElementById('stress').style.display = 'inline-block'
}

document.getElementById('stress').addEventListener('click', stress, false)
document.getElementById('unstress').addEventListener('click', unstress, false)
