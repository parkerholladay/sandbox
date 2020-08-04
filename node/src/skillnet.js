const R = require('ramda')

const addEdge = R.curry((newEdge, graph) => 
  R.assocPath(['edges', newEdge.id], newEdge)(graph)
)

const getEdgesBetweenNodes = (source, target) => R.filter(
  R.allPass([
    R.propEq('source', source),
    R.propEq('target', target)
  ])
)

const getEdgePopularity = R.curry((source, target, graph) => {
  return R.compose(
    R.converge(
      R.subtract,
      [
        R.prop('up'),
        R.prop('down')
      ]
    ),
    R.countBy(R.prop('label')),
    getEdgesBetweenNodes(source, target),
    R.values,
    R.prop('edges')
  )(graph)
})

const seedGraph = {
  nodes: {
    '0e2ead87-9e9a-4c57-8255-7087932b4d9e': {
      id: '0e2ead87-9e9a-4c57-8255-7087932b4d9e'
    },
    'e356b843-0c08-44a5-98a6-9f5c1a55cadb': {
      id: 'e356b843-0c08-44a5-98a6-9f5c1a55cadb'
    },
    'f63c3bdf-aefe-4c5d-81e5-679c373e4a6c': {
      id: 'f63c3bdf-aefe-4c5d-81e5-679c373e4a6c'
    },
    '9db84da3-3647-43be-80da-9a94a84587c2': {
      id: '9db84da3-3647-43be-80da-9a94a84587c2'
    },
  },
  edges: {
    'c2d4c302-291d-42b6-a9ef-9d8df873978f': {
      id: 'c2d4c302-291d-42b6-a9ef-9d8df873978f',
      label: 'type_a',
      source: '0e2ead87-9e9a-4c57-8255-7087932b4d9e',
      target: '0e2ead87-9e9a-4c57-8255-7087932b4d9e',
    },
    'c2d4c302-291d-42b6-a9ef-9d8df873978f': {
      id: 'c2d4c302-291d-42b6-a9ef-9d8df873978f',
      label: 'type_a',
      source: 'e356b843-0c08-44a5-98a6-9f5c1a55cadb',
      target: 'e356b843-0c08-44a5-98a6-9f5c1a55cadb',
    },
    '8d103843-7f5a-4f4d-81a7-9c56a0e277b4': {
      id: '8d103843-7f5a-4f4d-81a7-9c56a0e277b4',
      label: 'type_b',
      source: 'f63c3bdf-aefe-4c5d-81e5-679c373e4a6c',
      target: 'f63c3bdf-aefe-4c5d-81e5-679c373e4a6c',
    },
    '1b97131f-cac2-4c8f-8f7a-648836b61c2e': {
      id: '1b97131f-cac2-4c8f-8f7a-648836b61c2e',
      label: 'type_b',
      source: '9db84da3-3647-43be-80da-9a94a84587c2',
      target: '9db84da3-3647-43be-80da-9a94a84587c2',
    },
    '8cc62ea9-77d8-4e4c-acab-cdb3717bf897': {
      id: '8cc62ea9-77d8-4e4c-acab-cdb3717bf897',
      label: 'enables',
      source: '0e2ead87-9e9a-4c57-8255-7087932b4d9e',
      target: 'e356b843-0c08-44a5-98a6-9f5c1a55cadb',
    },
    'fbfc85be-8f52-44f7-911b-1ea18c5be425': {
      id: 'fbfc85be-8f52-44f7-911b-1ea18c5be425',
      label: 'comes_before',
      source: 'f63c3bdf-aefe-4c5d-81e5-679c373e4a6c',
      target: '0e2ead87-9e9a-4c57-8255-7087932b4d9e',
    },
    '53f09cc9-b53e-4285-a75b-24088a665d1d': {
      id: '53f09cc9-b53e-4285-a75b-24088a665d1d',
      label: 'comes_before',
      source: '9db84da3-3647-43be-80da-9a94a84587c2',
      target: '0e2ead87-9e9a-4c57-8255-7087932b4d9e',
    },
    '3d44fabd-4b89-4a4e-bb19-450507104a00': {
      id: '3d44fabd-4b89-4a4e-bb19-450507104a00',
      label: 'adds_to',
      source: 'f63c3bdf-aefe-4c5d-81e5-679c373e4a6c',
      target: 'e356b843-0c08-44a5-98a6-9f5c1a55cadb',
    },
    'bde6f956-6bfe-46e8-b01e-4b3c2c42659c': {
      id: 'bde6f956-6bfe-46e8-b01e-4b3c2c42659c',
      label: 'adds_to',
      source: '9db84da3-3647-43be-80da-9a94a84587c2',
      target: 'e356b843-0c08-44a5-98a6-9f5c1a55cadb',
    },
  }
}

module.exports = {
  addEdge,
  getEdgePopularity,
  seedGraph,
}
