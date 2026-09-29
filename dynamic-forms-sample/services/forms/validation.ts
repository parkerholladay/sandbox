import { z } from 'zod'

import { conditionMatches } from './conditions'
import { getFormSubmissionSchema } from './schemas'
import type { FormDefinition, FormField } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pruneInactiveFields(
  fields: readonly FormField[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.visibleWhen && !conditionMatches(field.visibleWhen, values[field.visibleWhen.field])) {
      continue
    }

    if (!Object.hasOwn(values, field.name)) {
      continue
    }

    const value = values[field.name]

    if (field.type === 'group' && isRecord(value)) {
      result[field.name] = pruneInactiveFields(field.fields, value)
    } else if (field.type === 'repeater' && Array.isArray(value)) {
      result[field.name] = value.map((entry) =>
        isRecord(entry) ? pruneInactiveFields(field.fields, entry) : entry,
      )
    } else {
      result[field.name] = value
    }
  }

  return result
}

export function getFormSchema(definition: FormDefinition) {
  const schema = getFormSubmissionSchema(definition.type)

  return z.preprocess(
    (values: Record<string, unknown>) =>
      isRecord(values) ? pruneInactiveFields(definition.fields, values) : values,
    schema,
  )
}

export function validateFormSubmission(definition: FormDefinition, values: unknown) {
  return getFormSchema(definition).safeParse(values)
}
