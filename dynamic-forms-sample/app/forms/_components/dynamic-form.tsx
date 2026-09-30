'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import type { FormDefinition, SubmitFormAction  } from '@/services/universal/form/types'
import { getFormSchema } from '@/services/universal/form/validation'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { DynamicFields, type FormValues } from './dynamic-field'
import { FormDisabledContext } from './form-disabled-context'
import { useFormSubmission } from './use-form-submission'
import { getDefinitionDefaults } from './utils'

type DynamicFormProps = {
  isDisabled?: boolean
  onDirtyChange: (isDirty: boolean) => void
  onSubmit: SubmitFormAction
  selectedForm: FormDefinition
}

export const DynamicForm = ({
  isDisabled = false,
  onDirtyChange,
  onSubmit,
  selectedForm,
}: DynamicFormProps) => {
  const schema = getFormSchema(selectedForm)
  const form = useForm<FormValues>({
    defaultValues: getDefinitionDefaults(selectedForm),
    mode: 'onSubmit',
    resolver: zodResolver(schema) as Resolver<FormValues>,
    reValidateMode: 'onChange',
    shouldFocusError: true,
    shouldUnregister: false,
  })
  const {
    handleSubmit,
    handleSubmitAnother,
    hasRestarted,
    isPending,
    receipt,
  } = useFormSubmission({ form, isDisabled, onSubmit, selectedForm })
  const isSubmitDisabled = isDisabled || isPending
  const serverError = form.formState.errors.root?.server?.message
  const focusElement = useCallback((element: HTMLElement | null) => { element?.focus() }, [])

  useEffect(() => {
    onDirtyChange(form.formState.isDirty)
  }, [form.formState.isDirty, onDirtyChange])

  if (receipt) {
    return (
      <section className="flex flex-col gap-4" aria-labelledby="submission-confirmation">
        <h2
          className="text-2xl font-semibold tracking-tight"
          id="submission-confirmation"
          ref={focusElement}
          tabIndex={-1}
        >
          Form submitted
        </h2>
        <p role="status">
          Your {selectedForm.title.toLowerCase()} has been received.
        </p>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-medium">Receipt ID</dt>
            <dd className="break-all">{receipt.id}</dd>
         </div>
          <div>
            <dt className="font-medium">Submitted</dt>
            <dd>
              <time dateTime={receipt.submittedAt}>
                {new Date(receipt.submittedAt).toLocaleString()}
             </time>
            </dd>
          </div>
        </dl>
        <Button
          className="self-start"
          disabled={isSubmitDisabled}
          onClick={handleSubmitAnother}
          type="button"
        >
          Submit another
        </Button>
      </section>
    )
  }

  return (
    <FormProvider {...form}>
      <FormDisabledContext value={isSubmitDisabled}>
        <form
          aria-busy={isPending}
          className="flex flex-col gap-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <header className="flex flex-col gap-2">
            <h2
              className="text-2xl font-semibold tracking-tight"
              ref={hasRestarted ? focusElement : undefined}
              tabIndex={-1}
            >
              {selectedForm.title}
            </h2>
            {selectedForm.description && (
              <p className="text-sm text-muted-foreground">
                {selectedForm.description}
              </p>
            )}
          </header>
          <FieldSet className="contents" disabled={isSubmitDisabled}>
            <FieldLegend className="sr-only">
              {selectedForm.title}
            </FieldLegend>
            <div className="flex flex-col gap-6">
              <DynamicFields fields={selectedForm.fields} />
            </div>
            <div className="flex items-center gap-4">
              <Button disabled={isSubmitDisabled} type="submit">
                {isPending ? 'Submitting…' : 'Submit form'}
              </Button>
              {isPending && <p role="status">Submitting your form…</p>}
            </div>
          </FieldSet>
          {serverError && (
            <p
              className="text-sm text-destructive"
              ref={focusElement}
              role="alert"
              tabIndex={-1}
            >
              {serverError}
            </p>
          )}
        </form>
      </FormDisabledContext>
    </FormProvider>
  )
}
