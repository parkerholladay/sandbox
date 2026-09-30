'use client'

import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { FormDefinition, SubmissionReceipt, SubmitFormAction  } from '@/services/universal/form/types'
import type { FormValues } from './dynamic-field'
import { getDefinitionDefaults, getVisibleFieldPaths } from './utils'

type UseFormSubmissionOptions = {
  form: UseFormReturn<FormValues>
  isDisabled: boolean
  selectedForm: FormDefinition
  onSubmit: SubmitFormAction
}

export const useFormSubmission = ({
  form,
  isDisabled,
  selectedForm,
  onSubmit,
}: UseFormSubmissionOptions) => {
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [errorField, setErrorField] = useState<string | null>(null)
  const [hasRestarted, setHasRestarted] = useState(false)
  const isSubmittingRef = useRef(false)
  const { setFocus } = form

  useEffect(() => {
    if (!isPending && errorField) {
      setFocus(errorField)
    }
  }, [errorField, isPending, setFocus])

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDisabled || isSubmittingRef.current || receipt) {
      return
    }

    isSubmittingRef.current = true
    setIsPending(true)
    setErrorField(null)
    form.clearErrors('root.server')

    try {
      await form.handleSubmit(async (values) => {
        const result = await onSubmit({ type: selectedForm.type, values })

        if (result.status === 'success') {
          form.reset(getDefinitionDefaults(selectedForm))
          setHasRestarted(false)
          setReceipt(result.receipt)
          return
        }

        if (result.status === 'validation_error') {
          const visiblePaths = new Set(getVisibleFieldPaths({ fields: selectedForm.fields, values: form.getValues() }))
          const formMessages: string[] = []
          let firstField: string | null = null

          for (const issue of result.issues) {
            const path = issue.path.join('.')

            if (visiblePaths.has(path)) {
              form.setError(path, { type: 'server', message: issue.message })
              firstField ??= path
            } else {
              formMessages.push(issue.message)
            }
          }

          setErrorField(firstField)
          if (formMessages.length || !result.issues.length) {
            form.setError('root.server', { type: 'server', message: formMessages.join(' ') || result.message })
          }

          return
        }

        form.setError('root.server', { type: 'server', message: result.message })
      }, (errors) => {
        const firstPath = getVisibleFieldPaths({ fields: selectedForm.fields, values: form.getValues() })
          .find((path) => form.getFieldState(path, { ...form.formState, errors }).error)
        setErrorField(firstPath ?? null)
      })(event)
    } catch {
      form.setError('root.server', { type: 'server', message: 'We could not confirm your submission. Please try again.' })
    } finally {
      isSubmittingRef.current = false
      setIsPending(false)
    }
  }

  const handleSubmitAnother = () => {
    form.reset(getDefinitionDefaults(selectedForm))
    setErrorField(null)
    setHasRestarted(true)
    setReceipt(null)
  }

  return {
    handleSubmit,
    handleSubmitAnother,
    hasRestarted,
    isPending,
    receipt,
  }
}
