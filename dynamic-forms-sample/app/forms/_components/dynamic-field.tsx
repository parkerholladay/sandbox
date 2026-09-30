'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { conditionMatches } from '@/services/forms/conditions'
import type {
  FieldCondition,
  FormField,
  RepeaterField as RepeaterFieldDefinition,
  ScalarField,
} from '@/services/forms/types'
import { useEffect } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { ScalarFieldControl } from './scalar-field-control'
import { getDefinitionDefaults } from './utils'

export type FormValues = Record<string, unknown>

type DynamicFieldsProps = {
  fields: readonly FormField[]
  parentPath?: string
}

export const DynamicFields = ({ fields, parentPath = '' }: DynamicFieldsProps) => fields.map((field) => {
  const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name

  return <DynamicField key={fieldPath} field={field} fieldPath={fieldPath} />
})

type DynamicFieldProps = {
  field: FormField
  fieldPath: string
}

const DynamicField = ({ field, fieldPath }: DynamicFieldProps) => {
  if (field.visibleWhen) {
    return <ConditionalField field={field} fieldPath={fieldPath} condition={field.visibleWhen} />
  }

  return <RenderedField field={field} fieldPath={fieldPath} />
}

const getParentPath = (fieldPath: string) => {
  const segments = fieldPath.split('.')
  segments.pop()

  return segments.join('.')
}

type ConditionalFieldProps = DynamicFieldProps & {
  condition: FieldCondition
}

const ConditionalField = ({ field, fieldPath, condition }: ConditionalFieldProps) => {
  const { clearErrors, control } = useFormContext<FormValues>()
  const parentPath = getParentPath(fieldPath)
  const conditionPath = parentPath ? `${parentPath}.${condition.field}` : condition.field
  const conditionValue = useWatch({ control, name: conditionPath, exact: true })
  const isVisible = conditionMatches(condition, conditionValue)

  useEffect(() => {
    if (!isVisible) clearErrors(fieldPath)
  }, [clearErrors, fieldPath, isVisible])

  if (!isVisible) return null

  return <RenderedField field={field} fieldPath={fieldPath} />
}

const RenderedField = ({ field, fieldPath }: DynamicFieldProps) => {
  if (field.type === 'group') {
    return (
      <FieldSet className="rounded border border-border p-4">
        <FieldLegend>{field.label}</FieldLegend>
        {field.description && <FieldDescription>{field.description}</FieldDescription>}
        <DynamicFields fields={field.fields} parentPath={fieldPath} />
      </FieldSet>
    )
  }

  if (field.type === 'repeater') {
    return <RepeaterField field={field} fieldPath={fieldPath} />
  }

  return <ScalarField field={field} fieldPath={fieldPath} />
}

const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return undefined
}

type ScalarFieldProps = {
  field: ScalarField
  fieldPath: string
}

const ScalarField = ({ field, fieldPath }: ScalarFieldProps) => {
  const { control, formState, getFieldState } = useFormContext<FormValues>()
  const id = `field-${fieldPath.replaceAll('.', '-')}`
  const descriptionId = field.description ? `${id}-description` : undefined
  const error = getErrorMessage(getFieldState(fieldPath, formState).error)
  const describedBy = [descriptionId, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined
  const isToggleField = field.type === 'checkbox' || field.type === 'switch'

  return (
    <Field data-invalid={Boolean(error)}>
      {!isToggleField && (
        <FieldLabel htmlFor={id}>
          {field.label}{field.required && <span aria-hidden="true"> *</span>}
        </FieldLabel>
      )}
      {field.description && <FieldDescription id={descriptionId}>{field.description}</FieldDescription>}
      <Controller
        name={fieldPath}
        control={control}
        render={({ field: input }) => (
          <ScalarFieldControl
            field={field}
            id={id}
            value={input.value}
            describedBy={describedBy}
            isInvalid={Boolean(error)}
            onBlur={input.onBlur}
            onChange={input.onChange}
            inputRef={input.ref}
          />
        )}
      />
      {error && <FieldError id={`${id}-error`} role="alert">{error}</FieldError>}
    </Field>
  )
}

type RepeaterFieldProps = {
  field: RepeaterFieldDefinition
  fieldPath: string
}

const RepeaterField = ({ field, fieldPath }: RepeaterFieldProps) => {
  const { control, formState, getFieldState } = useFormContext<FormValues>()
  const { append, fields, remove } = useFieldArray({ control, name: fieldPath as never })
  const minimumItems = field.minItems ?? 0
  const canAddItem = field.maxItems === undefined || fields.length < field.maxItems
  const error = getErrorMessage(getFieldState(fieldPath, formState).error)

  return (
    <FieldSet className="rounded border border-border p-4">
      <FieldLegend>{field.label}</FieldLegend>
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      <div className="flex flex-col gap-5">
        {fields.map((entry, index) => (
          <FieldSet className="rounded bg-muted/40 p-4" key={entry.id}>
            <FieldLegend variant="label">
              {field.label} {index + 1}
            </FieldLegend>
            <DynamicFields fields={field.fields} parentPath={`${fieldPath}.${index}`} />
            {fields.length > minimumItems && (
              <Button type="button" variant="outline" onClick={() => remove(index)}>
                Remove {field.label.toLowerCase()} {index + 1}
              </Button>
            )}
          </FieldSet>
        ))}
      </div>
      {canAddItem && (
        <Button type="button" variant="outline" onClick={() => append(getDefinitionDefaults({ fields: field.fields }))}>
          Add {field.label.toLowerCase()}
        </Button>
      )}
      {error && <FieldError role="alert">{error}</FieldError>}
    </FieldSet>
  )
}
