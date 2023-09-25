const http = require('http')

const port = 9001
const server = http.createServer()

server.on('request', (req, res) => {
  console.log("req.method:", req.method)
  console.log("req.url:", req.url)
  console.log("req.headers:", req.headers)

  let request = ''
  req.on('data', chunk => request += chunk)

  req.on('end', () => {
    console.log("req.body:", request)
    const body = JSON.parse(request ? request : '{}')

    body.method = req.method
    body.url = req.url

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(body))
  })

  req.on('err', () => {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'You bwoke it!' }))
  })
})

server.listen(port, () => console.info(`🚀 Listening on port ${port}`))
