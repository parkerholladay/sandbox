const { expect } = require('chai')
const moment = require('moment-timezone')

const subject = require('../events')

function generateEvent(overrides) {
  overrides = overrides || {}
  const eventDate = overrides.eventDate || moment().utc().toISOString()

  delete overrides.eventDate

  return Object.assign({}, {
    description: 'event-1',
    eventDate,
    offset: null,
    timezone: null,
    order: 1
  }, overrides)
}

describe.skip('events', () => {
  describe('#createWithOffset', () => {
    describe('when no prior events exist', () => {
      describe('when offset is not provided', () => {
        it('uses the offset of the new event', () => {
          const newEvent = generateEvent({ eventDate: '2017-01-01T01:23:45-05:00' })
          const expected = Object.assign({}, newEvent, { offset: '-05:00' })

          const results = subject.createWithOffset(newEvent, [])

          expect(results).to.eql([expected])
        })
      })
      describe('when offset is provided', () => {
        it('uses the offset for the event', () => {
          const newEvent = generateEvent({ eventDate: '2017-01-01T01:23:45', offset: '-05:00' })
          const expected = Object.assign({}, newEvent, { eventDate: '2017-01-01T01:23:45-05:00' })

          const results = subject.createWithOffset(newEvent, [])

          expect(results).to.eql([expected])
        })
      })
      describe('when date offset and event offset are provided', () => {
        it('uses the event offset for the event timezone', () => {
          const newEvent = generateEvent({ eventDate: '2017-01-01T01:23:45-03:00', offset: '-05:00' })
          const expected = Object.assign({}, newEvent, { eventDate: '2017-01-01T01:23:45-05:00' })

          const results = subject.createWithOffset(newEvent, [])

          expect(results).to.eql([expected])
        })
      })

    })
  })

  describe('#createWithTimezone', () => {
    describe('when no prior events exist', () => {
      describe('when timezone is not provided', () => {
        it('uses the offset of the new event', () => {
          const newEvent = generateEvent({ eventDate: '2017-01-01T01:23:45-05:00' })
          const results = subject.createWithTimezone(newEvent, [])
          expect(results).to.eql([newEvent])
        })
      })
      describe('when timezone is provided', () => {
        it('uses the offset for the event timezone', () => {
          const newEvent = generateEvent({ eventDate: '2017-01-01T01:23:45', timezone: 'America/New_York' })
          const expected = Object.assign({}, newEvent, { eventDate: '2017-01-01T01:23:45-05:00' })

          const results = subject.createWithTimezone(newEvent, [])

          expect(results).to.eql([expected])
        })
      })
      describe('when timezone and offset are provided', () => {
        it('uses the offset for the event timezone', () => {
          const newEvent = generateEvent({ eventDate: '2017-01-01T01:23:45-03:00', timezone: 'America/New_York' })
          const expected = Object.assign({}, newEvent, { eventDate: '2017-01-01T01:23:45-05:00' })

          const results = subject.createWithTimezone(newEvent, [])

          expect(results).to.eql([expected])
        })
      })
    })
  })
})
