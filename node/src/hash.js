const { createHash } = require('crypto')

const { value } = require('yargs').parse()

const hashValue = (value) => createHash('sha256').update(value).digest('hex')

console.log("value:", value)
console.log("hashed:", hashValue(value))
