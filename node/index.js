const path = require('path')
const yargs = require('yargs')

const argv = yargs
  .demandCommand(1, 'You must provide an adhoc name. Ex: "npm start path/to/file"')
  .argv

const commandPath = path.resolve('.', 'src', argv._[0])

require(commandPath)
