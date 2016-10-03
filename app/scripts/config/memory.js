const memory = {
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
    events: {},
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
    }
  }]
}

export default memory
