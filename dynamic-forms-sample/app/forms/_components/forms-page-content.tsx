'use client'

import type { FormDefinition, SubmitFormAction } from '@/services/universal/form/types'
import { useState } from 'react'
import { submitFormAction } from '@/app/forms/actions'
import { DynamicForm } from './dynamic-form'
import { FormSelector, type AvailableForm } from './form-selector'

type FormsPageContentProps = {
  availableForms: readonly AvailableForm[]
  selectedForm: FormDefinition | null
  selectionMessage?: string
}

export function FormsPageContent({
  availableForms,
  selectedForm,
  selectionMessage,
}: FormsPageContentProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: SubmitFormAction = async (input) => {
    setIsSubmitting(true)
    try {
      return await submitFormAction(input)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <FormSelector
        availableForms={availableForms}
        isDirty={isDirty}
        isDisabled={isSubmitting}
        onNavigatingChange={setIsNavigating}
        selectedForm={selectedForm ? { type: selectedForm.type } : null}
        selectionMessage={selectionMessage}
      />
      {selectedForm && (
        <DynamicForm
          isDisabled={isNavigating}
          key={selectedForm.type}
          onDirtyChange={setIsDirty}
          onSubmit={handleSubmit}
          selectedForm={selectedForm}
        />
      )}
    </div>
  )
}
