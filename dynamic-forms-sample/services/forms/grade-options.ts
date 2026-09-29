import type { ChoiceOption } from './types'

export const GRADE_LEVELS = [
  { label: 'Kindergarten', value: 'K' },
  ...Array.from({ length: 12 }, (_, index) => {
    const grade = index + 1
    const label = grade === 1
      ? '1st'
      : grade === 2
        ? '2nd'
        : grade === 3
          ? '3rd'
          : `${grade}th`

    return { label, value: `${grade}` }
  }),
] as const satisfies readonly ChoiceOption[]

export const GRADE_VALUES = GRADE_LEVELS.map((grade) => grade.value) as [string, ...string[]]
