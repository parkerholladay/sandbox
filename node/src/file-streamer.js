'use strict'

const { Readable } = require('stream')

const LINE_BREAK = '/r/n'
const UTF8 = 'utf-8'

const getBoundary = () => {
  let randomString = ''
  for (let i = 0; i < 24; i++) {
    randomString += Math.floor(Math.random() * 10).toString()
  }

  return `--------------------------${randomString}`
}

const getHeaders = (fileName, boundary) => {
  const headers = `Content-Disposition: form-data; filename="${fileName}";${LINE_BREAK}Content-Type: application/octet-stream;${LINE_BREAK}`

  return `--${boundary}${LINE_BREAK}${headers}`
}

const getFooter = boundary => {
  return `--${boundary}--${LINE_BREAK}`
}

const getFileStream = (fileName, contents, boundary) => {
  let fileStream = new Readable()
  fileStream.push(Buffer.from(getHeaders(fileName, boundary), UTF8), UTF8)
  fileStream.push(contents, UTF8)
  fileStream.push(Buffer.from(getFooter(boundary)), UTF8)
  fileStream.push(null)

  return fileStream
}

module.exports = {
  getFileStream,
  getFileStreamBoundary: getBoundary,
  getFooter,
  getHeaders
}
