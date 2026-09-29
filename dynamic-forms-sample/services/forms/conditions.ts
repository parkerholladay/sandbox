import type { FieldCondition } from './types'

export function conditionMatches(condition: FieldCondition, value: unknown) {
  return value === condition.equals
}
