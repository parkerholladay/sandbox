const { graphql, buildASTSchema, buildSchema } = require('graphql')
const gql = require('graphql-tag')

const schema = buildASTSchema(gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type Query {
    hello: String
    herp: Herp
  }
  type Herp @key(fields: "derp") {
    derp: String
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

graphql({ rootValue: root, schema, source: '{ hello, herp { derp } }' }).then((response) => {
  console.log('response.data:', response.data)
})
