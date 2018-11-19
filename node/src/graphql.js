'use strict'

const { graphql, buildSchema } = require('graphql')

const schema = buildSchema(`
  type Query {
    hello: String
    herp: Herp
  }
  type Herp {
    derp: String,
    lerp: String
  }
`)

const root = {
  hello: () => 'Hello world!',
  herp: () => ({
    derp: 'such derpness',
    lerp: 'larp'
  })
}

graphql(schema, '{ hello, herp { derp } }', root).then((response) => {
  console.log("response.data:", response.data)
})
