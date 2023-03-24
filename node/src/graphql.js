const { graphql, buildASTSchema, buildSchema } = require('graphql')
const gql = require('graphql-tag')

const schema = buildASTSchema(gql`
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

graphql({ rootValue: root, schema, source: '{ hello, herp { derp } }' }).then((response) => {
  console.log('response.data:', response.data)
})
