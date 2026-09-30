import type { FormDefinition, FormField } from '@/services/forms/types'

function getFieldDefault(field: FormField): unknown {
  if (field.type === 'group') {
    return getDefinitionDefaults({ fields: field.fields })
  }

  if (field.type === 'repeater') {
    const count = field.minItems ?? 0
    const entryDefaults = getDefinitionDefaults({ fields: field.fields })

    return Array.from({ length: count }, () => structuredClone(entryDefaults))
  }

  if ('defaultValue' in field && field.defaultValue !== undefined) {
    return structuredClone(field.defaultValue)
  }

  if (field.type === 'checkbox' || field.type === 'switch') {
    return false
  }

  if (field.type === 'multi-select') {
    return []
  }

  return ''
}

export function getDefinitionDefaults(definition: Pick<FormDefinition, 'fields'>) {
  return Object.fromEntries(definition.fields.map((field) => [field.name, getFieldDefault(field)]))
}
