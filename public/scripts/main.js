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
var eventsOverThePast2min = [];
var twoMinutes = 2 * 60 * 1000;
var alerts = [{
  average: 0,
  highUsage: false,
  timestamp: new Date().getTime()
}];

socket.on('monitor', function (data) {
  eventsOverThePast2min.push(data);
  var tsFirstEvent = eventsOverThePast2min[0].timestamp;
  var tsLastEvent = eventsOverThePast2min[eventsOverThePast2min.length-1].timestamp;
  if( tsFirstEvent + twoMinutes <= tsLastEvent ){
    var i = eventsOverThePast2min.length;
    var totalAvg = 0;
    while (--i) totalAvg += eventsOverThePast2min[i].loadavg[0];

    var totalEvents = eventsOverThePast2min.length;
    var average = totalAvg / totalEvents;
    var highUsage = average > data.maxload / 4;

    if(alerts[alerts.length-1].highUsage !== highUsage){

      var alertInfo = {
        average: average,
        highUsage: highUsage,
        timestamp: new Date().getTime()
      };

      alerts.push(alertInfo);

      var node = document.createElement("p");
      var message;

      if(highUsage){
        message = "High load generated an alert - load = " + alertInfo.average + ", triggered at " + new Date(alertInfo.timestamp);
      }else{
        message = "High load alert recovered - load = " + alertInfo.average;
      }

      node.appendChild(document.createTextNode(message));
      document.getElementById("log").appendChild(node);
    }

    eventsOverThePast2min.length = 0;
  }


  // console.log('----------------------------------');
});

document.getElementById('ddos').addEventListener('click', function(){
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/ddos");
  oReq.send();
  document.getElementById('ddos').style.display = 'none';
  document.getElementById('ddos-clear').style.display = 'inline-block';
}, false);

document.getElementById('ddos-clear').addEventListener('click', function(){
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/ddos-clear");
  oReq.send();
  document.getElementById('ddos').style.display = 'inline-block';
  document.getElementById('ddos-clear').style.display = 'none';
}, false);
