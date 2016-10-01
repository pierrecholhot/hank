var socket = io.connect('http://localhost:3000/');

var loadAvgChart, memoryChart;

loadAvgChart = new Highcharts.Chart({
  title: {
    text: 'CPU Load Average over the past 10 minutes'
  },
  credits: {
    enabled: false
  },
  legend: {
    enabled: false
  },
  chart: {
    renderTo: 'loadAvgChart',
    defaultSeriesType: 'area',
    events: {
      load: function () {
        // Each time you receive a value from the socket, I put it on the graph
        socket.on('monitor', function (data) {
          var series = loadAvgChart.series[0];
          series.addPoint([data.timestamp, data.loadavg[0]]);
          loadAvgChart.yAxis[0].update({
            max: data.maxload
          });
        });
      }
    }
  },
  xAxis: {
    type: 'datetime',
    maxZoom: 10 * 60 * 1000, // 10 minutes
    labels: {
      rotation: -45
    }
  },
  yAxis: {
    title: {
      text: 'Load Average'
    }
  },
  series: [{
    name: 'loadavg1',
    data: []
  }]
});

memoryChart = new Highcharts.Chart({
  title: {
    text: 'Current Memory Usage'
  },
  tooltip: {
    enabled: false
  },
  credits: {
    enabled: false
  },
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
  pane: {
    startAngle: -150,
    endAngle: 150,
    background: null
  },
  yAxis: {
    min: 0,
    max: 100
  },
  series: [{
    name: 'Memory',
    data: [0],
    dataLabels: {
      format: '{y}%'
    },
  }]
});

socket.on('alert', function(alertInfo){
  var node = document.createElement("p");
  var message = "High load alert recovered - load = " + alertInfo.average;

  if (alertInfo.highUsage) {
    message = "High load generated an alert - load = " + alertInfo.average + ", triggered at " + new Date(alertInfo.timestamp);
  }

  node.appendChild(document.createTextNode(message));
  document.getElementById("log").appendChild(node);
})

document.getElementById('stress').addEventListener('click', function(){
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/stress");
  oReq.send();
  document.getElementById('stress').style.display = 'none';
  document.getElementById('unstress').style.display = 'inline-block';
}, false);

document.getElementById('unstress').addEventListener('click', function(){
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/unstress");
  oReq.send();
  document.getElementById('stress').style.display = 'inline-block';
  document.getElementById('unstress').style.display = 'none';
}, false);
