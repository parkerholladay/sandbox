const { expect } = require('chai')
const R = require('ramda')
const { v4: uuid } = require('uuid')

const { addEdge, getEdgePopularity, seedGraph } = require('../skillnet')

describe.only('skillnet', () => {
  let nodeIds

  beforeEach(() => {
    nodeIds = R.compose(
      R.keys,
      R.prop('nodes')
    )(seedGraph)
  })

  const generateEdge = edge => ({
    ...edge,
    id: uuid()
  })

  describe('#addEdge', () => {
    it('adds the edge', () => {
      const newEdge = generateEdge({
        source: nodeIds[2],
        target: nodeIds[1],
        label: 'some_label'
      })
      const expectedGraph = R.assocPath(['edges', newEdge.id], newEdge)(seedGraph)

      const graph = addEdge(newEdge, seedGraph)

      expect(graph).to.deep.equal(expectedGraph)
    })
  })

  describe('#getEdgePopularity', () => {
    it('gets the weight sum of up and down edges between nodes', () => {
      const [source, target] = [nodeIds[2], nodeIds[1]]
      const positiveWeightEdge = {
        source,
        target,
        label: 'up'
      }
      const negativeWeightEdge = {
        source,
        target,
        label: 'down'
      }

      const weight = R.compose(
        getEdgePopularity(source, target),
        addEdge(generateEdge(positiveWeightEdge)),
        addEdge(generateEdge(positiveWeightEdge)),
        addEdge(generateEdge(negativeWeightEdge)),
        addEdge(generateEdge(positiveWeightEdge)),
        addEdge(generateEdge(positiveWeightEdge)),
      )(seedGraph)

      expect(weight).to.equal(3)
    })
  })
})
