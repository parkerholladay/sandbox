function validateBrackets(input) {
  let brackets = []

  for (const char of input) {
    if (char === '<') {
      brackets.push(char)
    } else if (char === '>') {
      const open = brackets.pop()
      if (!open) {
        return false
      }
    }
  }

  return !brackets.length
}

module.exports = {
  validateBrackets
}
