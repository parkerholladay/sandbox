import type { FormDefinition, FormField } from '@/services/universal/form/types'
import { isFieldVisible } from '@/services/universal/form/validation'

type GetVisibleFieldPathsParams = {
  fields: readonly FormField[]
  parentPath?: string
  values: Record<string, unknown>
}

export const getVisibleFieldPaths = ({
  fields,
  parentPath = '',
  values,
}: GetVisibleFieldPathsParams): string[] => fields.flatMap((field) => {
  if (field.visibleWhen && !isFieldVisible(field.visibleWhen, values[field.visibleWhen.field])) {
    return []
  }

  const path = parentPath ? `${parentPath}.${field.name}` : field.name
  const value = values[field.name]

  if (field.type === 'group') {
    return getVisibleFieldPaths({
      fields: field.fields,
      parentPath: path,
      values: typeof value === 'object' && value !== null
        ? value as Record<string, unknown>
        : {},
    })
  }

  if (field.type === 'repeater') {
    return [
      path,
      ...(Array.isArray(value)
        ? value.flatMap((entry, index) => getVisibleFieldPaths({
            fields: field.fields,
            parentPath: `${path}.${index}`,
            values: typeof entry === 'object' && entry !== null ? entry : {},
          }))
        : []
      )
    ]
  }

  return [path]
})

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
