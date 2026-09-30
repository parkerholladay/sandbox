import { FORM_DEFINITION_SEEDS } from '@/services/internal/seed'
import type { FormDefinition } from '@/services/universal/form/types'
import { describe, expect, it } from 'vitest'
import { getDefinitionDefaults, getVisibleFieldPaths } from './utils'

describe('#getDefinitionDefaults', () => {
  it('builds nested defaults and initializes the minimum number of repeater entries', () => {
    const definition: FormDefinition = {
      type: 'defaults-test',
      title: 'Defaults test',
      fields: [
        {
          name: 'student',
          label: 'Student',
          type: 'group',
          fields: [
            { name: 'name', label: 'Name', type: 'text', defaultValue: 'Riley' },
            { name: 'grade', label: 'Grade', type: 'select', options: [], required: true },
          ],
        },
        { name: 'count', label: 'Count', type: 'number' },
        { name: 'active', label: 'Active', type: 'switch' },
        { name: 'choices', label: 'Choices', type: 'multi-select', options: [] },
        {
          name: 'contacts',
          label: 'Contacts',
          type: 'repeater',
          minItems: 1,
          fields: [{ name: 'email', label: 'Email', type: 'email' }],
        },
      ],
    }

    expect(getDefinitionDefaults(definition)).toEqual({
      student: { name: 'Riley', grade: '' },
      count: '',
      active: false,
      choices: [],
      contacts: [{ email: '' }],
    })
  })

  it('does not share mutable defaults across repeater entries', () => {
    const definition: FormDefinition = {
      type: 'defaults-test',
      title: 'Defaults test',
      fields: [
        { name: 'contacts', label: 'Contacts', type: 'repeater', minItems: 2, fields: [
          { name: 'name', label: 'Name', type: 'text' },
        ] },
      ],
    }
    const values = getDefinitionDefaults(definition)
    const contacts = values.contacts as Array<Record<string, unknown>>

    expect(contacts[0]).not.toBe(contacts[1])
  })
})

describe('#getVisibleFieldPaths', () => {
  it('includes repeater errors and evaluates visibility within each entry', () => {
    const definition = FORM_DEFINITION_SEEDS.find((form) => form.type === 'emergency-contacts')!
    const values = {
      student: { name: 'Jordan', grade: '4' },
      contacts: [{ preferredMethod: 'phone' }, { preferredMethod: 'email' }],
    }

    const paths = getVisibleFieldPaths({ fields: definition.fields, values })

    expect(paths).toContain('student.name')
    expect(paths).not.toContain('student')
    expect(paths).toContain('contacts')
    expect(paths).toContain('contacts.1.email')
    expect(paths).not.toContain('contacts.0.email')
  })
})
