const moment = require('moment-timezone')

const getOffset = (date) => {
  return moment.parseZone(date).format('Z')
}

const getDateAdjustedByOffset = (date, offset) => {
  return moment
    .parseZone(date)
    .utcOffset(offset, true)
    .format()
}

function createWithOffset(newEvent, existingEvents) {
  const { eventDate, offset } = newEvent

  const dateOffset = getOffset(eventDate)
  if (offset && offset !== dateOffset) {
    newEvent.eventDate = getDateAdjustedByOffset(eventDate, offset)
  } else {
    newEvent.offset = dateOffset
  }

  return existingEvents.concat(newEvent)
}

const getDateAdjustedByTimezone = (date, timezone) => {
  return moment
    .tz(date, timezone)
    .format()
}

function createWithTimezone(newEvent, existingEvents) {
  if (newEvent.timezone) {
    newEvent.eventDate = getDateAdjustedByTimezone(newEvent.eventDate, newEvent.timezone)
  }

  return existingEvents.concat(newEvent)
}

module.exports = {
  createWithOffset,
  createWithTimezone
}
