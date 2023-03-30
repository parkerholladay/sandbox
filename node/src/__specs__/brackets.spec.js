const { expect } = require('chai')
const subject = require('../brackets')

describe('brackets', () => {
  describe('#validateBrackets', () => {
    it('returns true when brackets match', () => {
      expect(subject.validateBrackets('<abc>')).to.be.true
    })

    it('returns true when brackets are nested', () => {
      expect(subject.validateBrackets('<a<b>c>')).to.be.true
    })

    it('returns true when brackets are spread out', () => {
      expect(subject.validateBrackets('<a>b<c>')).to.be.true
    })

    it('returns true when there are no brackets', () => {
      expect(subject.validateBrackets('abc')).to.be.true
      expect(subject.validateBrackets('')).to.be.true
    })

    it('returns false when brackets are not closed', () => {
      expect(subject.validateBrackets('a>b<c')).to.be.false
      expect(subject.validateBrackets('><')).to.be.false
      expect(subject.validateBrackets('<a<b>c')).to.be.false
      expect(subject.validateBrackets('<a>b<c')).to.be.false
      expect(subject.validateBrackets('<a>b<c<d>efg<hi<jkl>m>')).to.be.false
    })

    it('returns false when close bracket precedes open bracket', () => {
      expect(subject.validateBrackets('a>b<c>')).to.be.false
      expect(subject.validateBrackets('<a>b>c<d>')).to.be.false
    })
  })
})
