export const humanizeData = function(data) {
  var date = ["[", new Date(data.timestamp).toLocaleString(), "]"].join('');
  var info = data.highUsage ? "High load generated an alert.." : "Recovered..";
  return [date, info, "Current load average is", data.average].join(' ');
};

export const alertUser = function (data) {
  var text = humanizeData(data);
  var node = document.createElement("p");
  var log = document.getElementById("log");
  node.appendChild(document.createTextNode(text));
  log.insertBefore(node, log.firstChild);
};
