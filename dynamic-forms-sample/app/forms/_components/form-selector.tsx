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
import type { FormDefinition } from '@/services/universal/form/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export type AvailableForm = {
  type: string
  label: string
}

type FormSelectorProps = {
  availableForms: readonly AvailableForm[]
  isDirty: boolean
  isDisabled?: boolean
  onNavigatingChange: (isNavigating: boolean) => void
  selectedForm: Pick<FormDefinition, 'type'> | null
  selectionMessage?: string
}

export function FormSelector({
  availableForms,
  isDirty,
  isDisabled = false,
  onNavigatingChange,
  selectedForm,
  selectionMessage,
}: FormSelectorProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const [pendingType, setPendingType] = useState<string | null>(null)

  useEffect(() => {
    if (!isNavigating) {
      return
    }

    const timeout = window.setTimeout(() => setShowLoading(true), 250)

    return () => window.clearTimeout(timeout)
  }, [isNavigating])

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
    if (isDisabled || isNavigating || type === (selectedForm?.type ?? null)) {
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
          <FieldDescription>
            Select a form to load its definition.
          </FieldDescription>
          <Combobox
            disabled={isDisabled || isNavigating || !availableForms.length}
            itemToStringLabel={(type) => availableForms.find((form) => form.type === type)?.label ?? type}
            itemToStringValue={(type) => type}
            onValueChange={requestTypeChange}
            value={selectedForm?.type ?? null}
          >
            <ComboboxInput
              aria-label="Form type"
              disabled={!availableForms.length || isNavigating || isDisabled}
              id="form-type"
              placeholder={availableForms.length ? 'Choose a form' : 'No forms are available'}
              showClear
            />
            <ComboboxContent>
              <ComboboxList>
                {availableForms.map((form) => (
                  <ComboboxItem key={form.type} value={form.type}>
                    {form.label}
                  </ComboboxItem>
                ))}
                {!availableForms.length && (
                  <ComboboxEmpty>No matching forms.</ComboboxEmpty>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        {selectionMessage && (
          <p className="text-sm text-destructive" role="alert">
            {selectionMessage}
          </p>
        )}
        {!availableForms.length && (
          <p className="text-sm text-muted-foreground" role="status">
            No forms are available.
          </p>
        )}
        {showLoading && (
          <p
            aria-live="polite"
            className="text-sm text-muted-foreground"
            role="status"
          >
            Loading form…
          </p>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => !open && closeDiscardDialog()}
        open={isDiscardDialogOpen}
      >
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
