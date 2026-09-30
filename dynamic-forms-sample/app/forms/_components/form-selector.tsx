'use client'

import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import type { FormDefinition } from '@/services/forms/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type AvailableForm = {
  type: string
  label: string
}

type FormSelectorProps = {
  availableForms: readonly AvailableForm[]
  isDirty: boolean
  onNavigatingChange: (isNavigating: boolean) => void
  selectedForm: Pick<FormDefinition, 'type'> | null
  selectionMessage?: string
}

export function FormSelector({
  availableForms,
  isDirty,
  onNavigatingChange,
  selectedForm,
  selectionMessage,
}: FormSelectorProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const [pendingType, setPendingType] = useState<string | null>(null)

  function navigateToType(type: string | null) {
    const params = new URLSearchParams(window.location.search)

    if (type) {
      params.set('type', type)
    } else {
      params.delete('type')
    }

    const query = params.toString()
    setIsNavigating(true)
    onNavigatingChange(true)
    router.push(query ? `/forms?${query}` : '/forms')
  }

  function requestTypeChange(type: string | null) {
    if (type === (selectedForm?.type ?? null)) {
      return
    }

    if (isDirty) {
      setPendingType(type)
      setIsDiscardDialogOpen(true)
      return
    }

    navigateToType(type)
  }

  function closeDiscardDialog() {
    setIsDiscardDialogOpen(false)
    setPendingType(null)
  }

  return (
    <>
      <section className="flex flex-col gap-4" aria-label="Choose a form">
        <Field>
          <FieldLabel htmlFor="form-type">Form type</FieldLabel>
          <FieldDescription>Select a form to load its definition.</FieldDescription>
          <Combobox
            value={selectedForm?.type ?? null}
            onValueChange={requestTypeChange}
            itemToStringLabel={(type) => availableForms.find((form) => form.type === type)?.label ?? type}
            itemToStringValue={(type) => type}
          >
            <ComboboxInput
              id="form-type"
              placeholder={availableForms.length ? 'Choose a form' : 'No forms are available'}
              aria-label="Form type"
              disabled={!availableForms.length || isNavigating}
              showClear
            />
            <ComboboxContent>
              <ComboboxList>
                {availableForms.map((form) => (
                  <ComboboxItem key={form.type} value={form.type}>
                    {form.label}
                  </ComboboxItem>
                ))}
                <ComboboxEmpty>No matching forms.</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        {selectionMessage && <p role="alert" className="text-sm text-destructive">{selectionMessage}</p>}
        {!availableForms.length && <p role="status" className="text-sm text-muted-foreground">No forms are available.</p>}
        {isNavigating && <p role="status" aria-live="polite" className="text-sm text-muted-foreground">Loading form…</p>}
      </section>

      <Dialog open={isDiscardDialogOpen} onOpenChange={(open) => !open && closeDiscardDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard your answers?</DialogTitle>
            <DialogDescription>
              You have changed this form. Switching forms will discard those answers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDiscardDialog}>
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setIsDiscardDialogOpen(false)
                navigateToType(pendingType)
                setPendingType(null)
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
