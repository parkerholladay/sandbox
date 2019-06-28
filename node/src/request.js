const axios = require('axios')

const makeRequest = async () => {
  try {
    const res = await axios.post('/derp', { baseURL: 'https://acme.com' })
    console.log("res:", res)
  } catch (err) {
    console.log("err.message:", err.message)
    console.log("err.config:", err.config)
  }
}

makeRequest()
