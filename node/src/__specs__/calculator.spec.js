const { expect } = require('chai')

const subject = require('../calculator')

const { TYPE, PRECEDENCE } = subject
const OPERATORS = {
  Addition: { type: TYPE.Operator, precedence: PRECEDENCE.Addition, value: '+' },
  Subtraction: { type: TYPE.Operator, precedence: PRECEDENCE.Subtraction, value: '-' },
  Multiplication: { type: TYPE.Operator, precedence: PRECEDENCE.Multiplication, value: '*' },
  Division: { type: TYPE.Operator, precedence: PRECEDENCE.Division, value: '/' },
  LeftPeren: { type: TYPE.LeftPeren, precedence: PRECEDENCE.Other, value: '(' },
  RightPeren: { type: TYPE.RightPeren, precedence: PRECEDENCE.Other, value: ')' }
}

describe('calculator', () => {
  describe('#getToken', () => {
    it('parses numbers', () => {
      expect(subject.getToken('1')).to.eql({ type: TYPE.Number, precedence: PRECEDENCE.Other, value: 1 })
      expect(subject.getToken('42')).to.eql({ type: TYPE.Number, precedence: PRECEDENCE.Other, value: 42 })
      expect(subject.getToken('0.75')).to.eql({ type: TYPE.Number, precedence: PRECEDENCE.Other, value: 0.75 })
    })
    it('parses operators', () => {
      expect(subject.getToken('+')).to.eql(OPERATORS.Addition)
      expect(subject.getToken('-')).to.eql(OPERATORS.Subtraction)
      expect(subject.getToken('*')).to.eql(OPERATORS.Multiplication)
      expect(subject.getToken('/')).to.eql(OPERATORS.Division)
    })
    it('parses perentheses', () => {
      expect(subject.getToken('(')).to.eql(OPERATORS.LeftPeren)
      expect(subject.getToken(')')).to.eql(OPERATORS.RightPeren)
    })
  })

  describe('#evaluateNextOperation', () => {
    it('adds 1 + 2', () => {
      const operators = [OPERATORS.Addition]
      const operands = [1, 2]

      subject.evaluateNextOperation(operators, operands)

      expect(operators).to.be.empty
      expect(operands).to.eql([3])
    })

    it('subtracts 2 - 1', () => {
      const operators = [OPERATORS.Subtraction]
      const operands = [2, 1]

      subject.evaluateNextOperation(operators, operands)

      expect(operators).to.be.empty
      expect(operands).to.eql([1])
    })

    it('multiplies 2 * 3', () => {
      const operators = [OPERATORS.Multiplication]
      const operands = [2, 3]

      subject.evaluateNextOperation(operators, operands)

      expect(operators).to.be.empty
      expect(operands).to.eql([6])
    })

    it('divides 4 / 2', () => {
      const operators = [OPERATORS.Division]
      const operands = [4, 2]

      subject.evaluateNextOperation(operators, operands)

      expect(operators).to.be.empty
      expect(operands).to.eql([2])
    })

    it('calculates top of 1 + 2 * 3', () => {
      const operators = [OPERATORS.Addition, OPERATORS.Multiplication]
      const operands = [1, 2, 3]

      subject.evaluateNextOperation(operators, operands)

      expect(operators).to.eql([OPERATORS.Addition])
      expect(operands).to.eql([1, 6])
    })
  })

  describe('#applyNextToken', () => {
    let operators
    let operands
    let input

    describe('when the next token is an integer', () => {
      it('adds it to the operands stack', () => {
        operators = [OPERATORS.Addition]
        operands = [1]
        input = ['2']

        subject.applyNextToken(input, operators, operands)

        expect(operators).to.eql([OPERATORS.Addition])
        expect(operands).to.eql([1, 2])
        expect(input).to.be.empty
      })
    })

    describe('when the next token is a float', () => {
      it('adds it to the operands stack', () => {
        const operators = [OPERATORS.Addition]
        const operands = [1]
        const input = ['3', '.', '1', '4']

        subject.applyNextToken(input, operators, operands)

        expect(operators).to.eql([OPERATORS.Addition])
        expect(operands).to.eql([1, 3.14])
      })
    })

    describe('when the next token is an operator', () => {
      describe('when the operator stack is empty', () => {
        beforeEach(() => {
          operators = []
          operands = [1]
        })

        it('adds the token to the operator stack', () => {
          input = ['*', '2']
          subject.applyNextToken(input, operators, operands)
          expect(operators).to.eql([OPERATORS.Multiplication])
          expect(operands).to.eql([1])
          expect(input).to.eql(['2'])
        })
      })

      describe('when the next token has higher precedece', () => {
        beforeEach(() => {
          operators = [OPERATORS.Addition]
          operands = [1, 2]
        })

        it('adds multiplication over addition to the operators stack', () => {
          input = ['*', '3']
          const expectedOperators = [OPERATORS.Addition, OPERATORS.Multiplication]

          subject.applyNextToken(input, operators, operands)

          expect(operators).to.eql(expectedOperators)
          expect(operands).to.eql([1, 2])
          expect(input).to.eql(['3'])
        })

        it('adds division over addition to the operators stack', () => {
          input = ['/', '3']
          const expectedOperators = [OPERATORS.Addition, OPERATORS.Division]

          subject.applyNextToken(input, operators, operands)

          expect(operators).to.eql(expectedOperators)
          expect(operands).to.eql([1, 2])
          expect(input).to.eql(['3'])
        })
      })

      describe('when the next token has the same precedence', () => {
        beforeEach(() => {
          operators = [OPERATORS.Addition]
        })

        it('evaluates the operator at the top of the stack', () => {
          operands = [1, 2]
          input = ['-', '3']

          subject.applyNextToken(input, operators, operands)

          expect(operators).to.be.empty
          expect(operands).to.eql([3])
          expect(input).to.eql(['-', '3'])
        })
      })

      describe('when the next token has lower precedence', () => {
        beforeEach(() => {
          operators = [OPERATORS.Multiplication]
        })

        it('evaluates the operator at the top of the stack', () => {
          operands = [2, 2]
          input = ['-', '3']

          subject.applyNextToken(input, operators, operands)

          expect(operators).to.be.empty
          expect(operands).to.eql([4])
          expect(input).to.eql(['-', '3'])
        })
      })
    })

    describe('when the next token is a left perenthsis', () => {
      it('adds it to the operators stack', () => {
        operators = []
        operands = []
        input = ['(', '2']

        subject.applyNextToken(input, operators, operands)

        expect(operators).to.eql([OPERATORS.LeftPeren])
        expect(operands).to.be.empty
        expect(input).to.eql(['2'])
      })
    })

    describe('when next token is a right perenthesis', () => {
      it('evaluates the stack until the previous left perenthesis', () => {
        operators = [
          OPERATORS.Multiplication,
          OPERATORS.LeftPeren,
          OPERATORS.Addition,
          OPERATORS.Multiplication
        ]
        operands = [5, 1, 2, 3]
        input = [')', '+', '2', '0']

        subject.applyNextToken(input, operators, operands)

        expect(operators).to.eql([OPERATORS.Multiplication])
        expect(operands).to.eql([5, 7])
        expect(input).to.eql(['+', '2', '0'])
      })

      it('throws when there is no left perenthesis', () => {
        operators = [OPERATORS.Multiplication, OPERATORS.Addition, OPERATORS.Multiplication]
        operands = [5, 1, 2, 3]
        input = [')', '+', '2', '0']

        expect(() => subject.applyNextToken(input, operators, operands)).to.throw(Error)
      })
    })

    describe('when input is empty', () => {
      beforeEach(() => {
        input = []
      })

      it('evaluates the operator at the top of the stack', () => {
        operators = [OPERATORS.Addition, OPERATORS.Subtraction, OPERATORS.Division]
        operands = [8, 3, 4, 2]

        subject.applyNextToken(input, operators, operands)

        expect(operators).to.eql([operators[0], operators[1]])
        expect(operands).to.eql([8, 3, 2])
        expect(input).to.be.empty
      })
    })
  })

  describe('#calculate', () => {
    it('calculates all the things', () => {
      const result = subject.calculate('1+2*4/2+3*2', [], [])
      expect(result).to.eql(11)
    })

    it('calculates all the things with perens', () => {
      const result = subject.calculate('1+2*4/(2+3*2)', [], [])
      expect(result).to.eql(2)
    })
  })
})
