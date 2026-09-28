function findSubstrings(input, substring) {
  const result = []

  for (let i = 0; i <= input.length - substring.length; i++) {
    const candidate = input.substring(i, i + substring.length)
    console.log("candidate:", candidate)
    if (candidate === substring) {
      result.push(i)
    }
  }

  console.log("result:", result)
  return result
}

findSubstrings('Bananas', 'na')

module.exports = {
  findSubstrings,
}
