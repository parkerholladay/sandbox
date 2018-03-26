'use strict'

const keys = [
  1,
  2,
  4,
  8,
  16,
  32
]

function getPairPermutations() {
  const permutations = keys.reduce((perms, key) => {
    keys.map(k => {
      if (key !== k && !perms[key + k]) {
        perms[key + k] = { k1: key, k2: k }
      }
    })

    return perms
  }, {})

  console.log(Object.keys(permutations).join('\n'))
}

getPairPermutations()
