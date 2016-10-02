import IO from 'socket.io-client'
import request from 'superagent'
import Highcharts from 'highcharts'
require('./charts/')(Highcharts)

import { alertUser } from './alert'
import loadChartConfig from './config/load-average'
import memoryChartConfig from './config/memory'

const socket = IO.connect('http://localhost:3000/')

socket
  .on('initialState', (state) => {
    const loadChart = initializeLoadAvgChart(state)
    const memoryChart = initializeMemoryChart(state)
    state.alerts.forEach(alertUser)
  })
  .on('alert', alertUser)

function loadAvgChartReady (e) {
  socket.on('monitor', ({ timestamp, loadavg }) => {
    e.target.series[0].addPoint([timestamp, loadavg[0]], true, true)
  })
}

function memoryChartReady (e) {
  socket.on('monitor', ({ usedmemory }) => {
    e.target.series[0].points[0].update(usedmemory)
  })
}

function initializeLoadAvgChart (state) {
  const rewriteHistoryObj = ({ timestamp, loadavg }) => [timestamp, loadavg[0]]
  loadChartConfig.chart.events.load = loadAvgChartReady
  loadChartConfig.yAxis.max = state.cpus
  loadChartConfig.series[0].data = state.history.map(rewriteHistoryObj)
  return new Highcharts.Chart(loadChartConfig)
}

function initializeMemoryChart (state) {
  memoryChartConfig.chart.events.load = memoryChartReady
  return new Highcharts.Chart(memoryChartConfig)
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
