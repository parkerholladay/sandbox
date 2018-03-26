Array.prototype.first = function() {
  return this[0]
}
Array.prototype.last = function() {
  return this[this.length - 1]
}
Array.prototype.isEmpty = function() {
  return this.length === 0
}

const OPERATORS = { Plus: '+', Minus: '-', Multiply: '*', Divide: '/' }
const PRECEDENCE = { Other: null, Addition: 1, Subtraction: 1, Multiplication: 2, Division: 2 }
const TYPE = { Unknown: null, Number: 0, Operator: 1, LeftPeren: 2, RightPeren: 3 }

function getToken(stringValue) {
  let type = TYPE.Operator
  let precedence = PRECEDENCE.Other
  let value = stringValue

  switch (stringValue) {
    case OPERATORS.Plus:
      precedence = PRECEDENCE.Subtraction
      break
    case OPERATORS.Minus:
      precedence = PRECEDENCE.Addition
      break
    case OPERATORS.Multiply:
      precedence = PRECEDENCE.Multiplication
      break
    case OPERATORS.Divide:
      precedence = PRECEDENCE.Multiplication
      break
    case '(':
      type = TYPE.LeftPeren
      break
    case ')':
      type = TYPE.RightPeren
      break
    default:
      type = TYPE.Number
      value = parseFloat(stringValue)
      if (isNaN(value)) {
        value = stringValue
        type = TYPE.Unknown
      }
  }

  return { type, precedence, value }
}

function evaluateNextOperation(operators, operands) {
  let result
  const operator = operators.pop()
  const b = operands.pop()
  const a = operands.pop()

  switch (operator.value) {
    case OPERATORS.Plus:
      result = a + b
      break
    case OPERATORS.Minus:
      result = a - b
      break
    case OPERATORS.Multiply:
      result = a * b
      break
    case OPERATORS.Divide:
      result = a / b
      break
    default:
      throw new Error(`Invalid operator: ${operator}`)
  }

  operands.push(result)
}

function getFloatToken(input, number, token) {
  let isFloat = false
  while (!input.isEmpty() && input.first().match(/[0-9\.]/)) {
    isFloat = true
    number += input.shift()
  }

  if (isFloat)
    token = getToken(number)

  return token
}

function evaluateToPreviousPeren(operators, operands) {
  while (!operators.isEmpty() && operators.last().type === TYPE.Operator)
    evaluateNextOperation(operators, operands)

  if (!operators.isEmpty() && operators.last().type === TYPE.LeftPeren)
    operators.pop()
  else
    throw new Error('Mismatching perentheses')
}

function applyNextToken(input, operators, operands) {
  if (input.isEmpty() && !operators.isEmpty())
    return evaluateNextOperation(operators, operands)

  let next = input.shift()
  let token = getToken(next)

  switch (token.type) {
    case TYPE.Number:
      token = getFloatToken(input, next, token)
      operands.push(token.value)
      break
    case TYPE.Operator:
      if (operators.isEmpty() || token.precedence > operators.last().precedence) {
        operators.push(token)
      } else if (token.precedence <= operators.last().precedence) {
        input.unshift(next)
        evaluateNextOperation(operators, operands)
      }
      break
    case TYPE.LeftPeren:
      operators.push(token)
      break
    case TYPE.RightPeren:
      evaluateToPreviousPeren(operators, operands)
      break
    default:
      throw new Error(`Invalid input: ${token.value}`)
  }
}

function calculate(stringInput) {
  const input = stringInput.split('')
  const operators = []
  const operands = []

  while (!input.isEmpty() || !operators.isEmpty())
    applyNextToken(input, operators, operands)

  return operands.first()
}

module.exports = {
  PRECEDENCE,
  TYPE,
  getToken,
  evaluateNextOperation,
  applyNextToken,
  calculate
}
