'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import type { FormDefinition } from '@/services/forms/types'
import { getFormSchema } from '@/services/forms/validation'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { DynamicFields, type FormValues } from './dynamic-field'
import { getDefinitionDefaults } from './utils'

type DynamicFormProps = {
  disabled?: boolean
  onDirtyChange: (isDirty: boolean) => void
  selectedForm: FormDefinition
}

export const DynamicForm = ({
  disabled = false,
  onDirtyChange,
  selectedForm,
}: DynamicFormProps) => {
  const [hasValidated, setHasValidated] = useState(false)
  const schema = getFormSchema(selectedForm)
  const form = useForm<FormValues>({
    defaultValues: getDefinitionDefaults(selectedForm),
    mode: 'onSubmit',
    resolver: zodResolver(schema) as Resolver<FormValues>,
    reValidateMode: 'onChange',
    shouldFocusError: true,
    shouldUnregister: false,
  })
  const { subscribe } = form

  useEffect(() => {
    onDirtyChange(form.formState.isDirty)
  }, [form.formState.isDirty, onDirtyChange])

  useEffect(() => {
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: () => setHasValidated(false),
    })

    return unsubscribe
  }, [subscribe])

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-8"
        noValidate
        onSubmit={form.handleSubmit(() => setHasValidated(true))}
      >
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">{selectedForm.title}</h2>
          {selectedForm.description && <p className="text-sm text-muted-foreground">{selectedForm.description}</p>}
        </header>
        <FieldSet className="contents" disabled={disabled}>
          <FieldLegend className="sr-only">{selectedForm.title}</FieldLegend>
          <div className="flex flex-col gap-6">
            <DynamicFields fields={selectedForm.fields} />
          </div>
          <div className="flex items-center gap-4">
            <Button disabled={form.formState.isSubmitting} type="submit">
              Validate form
            </Button>
            {hasValidated && <p role="status">Form is valid. Nothing has been submitted.</p>}
          </div>
        </FieldSet>
      </form>
    </FormProvider>
  )
}
