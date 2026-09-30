'use client'

import type { FormDefinition } from '@/services/universal/form/types'
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
          selectedForm={selectedForm}
          disabled={isNavigating}
          key={selectedForm.type}
          onDirtyChange={setIsDirty}
          onSubmittingChange={setIsSubmitting}
          submitAction={submitFormAction}
        />
      )}
    </div>
  )
}
