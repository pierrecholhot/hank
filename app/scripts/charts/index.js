module.exports = function (Highcharts) {
  require('./theme')(Highcharts)
  require('highcharts/highcharts-more')(Highcharts)
  require('highcharts/modules/solid-gauge')(Highcharts)
}
