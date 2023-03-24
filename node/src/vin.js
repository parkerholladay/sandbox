const axios = require('axios')

const nhtsaVariablesMap = {
  'fuel type - primary': 'fuel_type',
  make: 'make',
  model: 'model',
  'model year': 'year',
}
const matchingVariables = Object.keys(nhtsaVariablesMap)
const fieldNames = Object.values(nhtsaVariablesMap)

function validateField(fieldName, nhtsa, input) {
  if (nhtsa.toLowerCase() !== input.toLowerCase()) {
    return fieldName
  }

  return null
}

async function validateVin({ vin, ...options }) {
  if (vin.length !== 17 || /[Q,I,O]/.test(vin)) {
    return ['vin']
  }

  try {
    const res = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`)

    const vinResult = res.data.Results.reduce((acc, curr) => {
      const variable = curr.Variable.toLowerCase()
      if (matchingVariables.includes(variable)) {
        const varName = nhtsaVariablesMap[variable]
        acc[varName] = curr.Value
      }

      return acc
    }, {})

    return fieldNames
      .map(n => validateField(n, vinResult[n], options[n]))
      .filter(r => r !== null)
  } catch (err) {
    console.log("err:", err)
    return ['vin']
  }
}

module.exports = {
  validateVin,
}
