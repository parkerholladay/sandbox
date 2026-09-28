import { describe, expect, it } from 'vitest'

import { FORM_SUBMISSION_SCHEMAS } from './schemas'
import { FORM_DEFINITION_SEEDS } from './seed'
import type { FieldCondition, FormField } from './types'

function expectUniqueNamesAndValidConditions(fields: readonly FormField[]) {
  const names = fields.map((field) => field.name)
  expect(new Set(names).size).toBe(names.length)

  for (const field of fields) {
    if (field.visibleWhen) {
      const condition = field.visibleWhen satisfies FieldCondition
      const controller = fields.find((candidate) => candidate.name === condition.field)
      expect(controller).toBeDefined()
      expect(controller?.visibleWhen).toBeUndefined()
      expect(controller?.type).not.toBe('group')
      expect(controller?.type).not.toBe('repeater')

      if (
        controller &&
        (controller.type === 'select' || controller.type === 'radio' || controller.type === 'multi-select')
      ) {
        expect(controller.options.some((option) => option.value === condition.equals)).toBe(true)
      }

      if (controller && (controller.type === 'checkbox' || controller.type === 'switch')) {
        expect(typeof condition.equals).toBe('boolean')
      }
    }

    if (field.type === 'group' || field.type === 'repeater') {
      expectUniqueNamesAndValidConditions(field.fields)
    }
  }
}

describe('#FORM_DEFINITION_SEEDS', () => {
  it('has unique types, matching schemas, and valid sibling conditions', () => {
    expect(new Set(FORM_DEFINITION_SEEDS.map((form) => form.type)).size).toBe(FORM_DEFINITION_SEEDS.length)

    for (const form of FORM_DEFINITION_SEEDS) {
      expect(Object.hasOwn(FORM_SUBMISSION_SCHEMAS, form.type)).toBe(true)
      expectUniqueNamesAndValidConditions(form.fields)
      expect(JSON.parse(JSON.stringify(form))).toEqual(form)
    }
  })
})
