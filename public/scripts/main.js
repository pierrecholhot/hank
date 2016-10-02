var socket = io.connect('http://localhost:3000/');

socket.on('initialState', initialize);
socket.on('alert', addAlert);

function initialize(state) {
  initializeLoadAvgChart(state);
  initializeMemoryChart(state);
  initializeAlerts(state);
}

function initializeLoadAvgChart(state){
  var loadAvgChart;
  loadAvgChart = new Highcharts.Chart({
    title: { text: 'CPU Load Average over the past 10 minutes' },
    credits: { enabled: false },
    legend: { enabled: false },
    chart: {
      renderTo: 'loadAvgChart',
      defaultSeriesType: 'area',
      events: {
        load: function () {
          socket.on('monitor', function (data) {
            loadAvgChart.series[0].addPoint([data.timestamp, data.loadavg[0]], true, true);
          });
        }
      }
    },
    xAxis: { type: 'datetime', maxZoom: 10 * 60 * 1000 },
    yAxis: { title: { text: 'Load Average' }, max: state.cpus },
    series: [{
      name: 'loadavg1',
      data: state.history.map(function (a) {
        return [a.timestamp, a.loadavg[0]]
      })
    }]
  });
}

function initializeMemoryChart(state){
  var memoryChart;
  memoryChart = new Highcharts.Chart({
    title: { text: 'Current Memory Usage' },
    tooltip: { enabled: false },
    credits: { enabled: false },
    chart: {
      renderTo: 'memoryChart',
      defaultSeriesType: 'solidgauge',
      events: {
        load: function () {
          socket.on('monitor', function (data) {
            memoryChart.series[0].points[0].update(data.usedmemory);
          });
        }
      },
    },
    pane: { startAngle: -150, endAngle: 150, background: null },
    yAxis: { min: 0, max: 100 },
    series: [{ name: 'Memory', data: [0], dataLabels: { format: '{y}%' } }]
  });
}

function initializeAlerts(state){
  state.alerts.forEach(function (a, i) {
    i && addAlert(a);
  });
}

function addAlert(data) {
  var text = humanizeAlert(data);
  var node = document.createElement("p");
  var log = document.getElementById("log");
  node.appendChild(document.createTextNode(text));
  log.insertBefore(node, log.firstChild);
}

function humanizeAlert(data){
  var date = ["[", new Date(data.timestamp).toLocaleString(), "]"].join('');
  var info = data.highUsage ? "High load generated an alert.." : "Recovered..";
  return [date, info, "Current load average is", data.average].join(' ');
}

function stress () {
  var xhr = new XMLHttpRequest(); xhr.open("GET", "/stress"); xhr.send();
  document.getElementById('stress').style.display = 'none';
}

function unstress () {
  var xhr = new XMLHttpRequest(); xhr.open("GET", "/unstress"); xhr.send();
  document.getElementById('stress').style.display = 'inline-block';
}

document.getElementById('stress').addEventListener('click', stress, false);
document.getElementById('unstress').addEventListener('click', unstress, false);
