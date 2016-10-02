const loadAverage = {
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
    events: {}
  },
  xAxis: {
    type: 'datetime',
    maxZoom: 10 * 60 * 1000
  },
  yAxis: {
    title: {
      text: 'Load Average'
    }
  },
  series: [{
    name: 'loadavg1'
  }]
};

export default loadAverage;
