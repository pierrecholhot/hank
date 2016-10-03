export const humanizeData = function({ timestamp, highUsage, average }) {
  const date = `[${new Date(timestamp).toLocaleString()}]`
  const info = highUsage ? 'High load generated an alert' : 'Recovered'
  return `${date} ${info}.. Current load average is ${average}`
}

export const alertUser = function (data) {
  const text = humanizeData(data)
  const node = document.createElement('p')
  const log = document.getElementById('log')
  data.highUsage && node.classList.add('danger')
  node.appendChild(document.createTextNode(text))
  log.insertBefore(node, log.firstChild)
}
