import { describe, expect, it } from 'vitest'
import { FORM_SUBMISSION_SCHEMAS, getFormSubmissionSchema } from './schemas'

describe('#getFormSubmissionSchema', () => {
  it('returns the registered schema for each known form type', () => {
    for (const [type, schema] of Object.entries(FORM_SUBMISSION_SCHEMAS)) {
      expect(getFormSubmissionSchema(type)).toBe(schema)
    }
  })

  it('rejects unknown and inherited object property names', () => {
    for (const type of ['unregistered', 'constructor', 'toString', '__proto__']) {
      expect(() => getFormSubmissionSchema(type)).toThrow(
        `No submission schema is registered for form type "${type}".`,
      )
    }
  })
})
