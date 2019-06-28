const http = require('http')

const port = 9001

const server = http.createServer((req, res) => {
  console.log("req.method:", req.method)
  console.log("req.url:", req.url)
  console.log("req.headers:", req.headers)
  console.log("req.data:", req.data)

  res.statusCode = 200
  res.end(JSON.stringify({ foo: 'bar' }))
})

server.listen(port, () => console.log(`Listening on port ${port}`))
