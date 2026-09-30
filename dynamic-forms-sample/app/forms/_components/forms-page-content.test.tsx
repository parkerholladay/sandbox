// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { submitFormAction } from '@/app/forms/actions'
import { FORM_DEFINITION_SEEDS } from '@/services/internal/seed'
import type { FormDefinition } from '@/services/universal/form/types'
import type { SubmitFormResult } from '@/services/universal/form/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormsPageContent } from './forms-page-content'

const getValidAbsenceDefinition = (): FormDefinition => {
  const absence = FORM_DEFINITION_SEEDS.find((form) => form.type === 'absence-report')!

  return {
    ...absence,
    fields: absence.fields.map((field) => {
      if (field.type === 'group') {
        return {
          ...field,
          fields: field.fields.map((child) => {
            if (child.type === 'text') return { ...child, defaultValue: field.name === 'student' ? 'Jordan Lee' : 'Casey Lee' }
            if (child.type === 'select') return { ...child, defaultValue: '4' }
            if (child.type === 'email') return { ...child, defaultValue: 'casey@example.test' }
            return child
          }),
        }
      }

      if (field.type === 'date' && field.name === 'startDate') return { ...field, defaultValue: '2026-09-28' }
      if (field.type === 'date' && field.name === 'endDate') return { ...field, defaultValue: '2026-09-29' }
      if (field.type === 'radio' && field.name === 'reason') return { ...field, defaultValue: 'illness' }
      return field
    }),
  }
}

const router = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@/app/forms/actions', () => ({ submitFormAction: vi.fn() }))

const absence = FORM_DEFINITION_SEEDS.find((form) => form.type === 'absence-report')!
const contacts = FORM_DEFINITION_SEEDS.find((form) => form.type === 'emergency-contacts')!
const availableForms = [absence, contacts].map(({ type, title }) => ({ type, label: title }))

beforeEach(() => {
  router.push.mockClear()
  vi.mocked(submitFormAction).mockReset()
  window.history.replaceState({}, '', '/forms?source=sample&type=absence-report')
})

afterEach(cleanup)

describe('#FormsPageContent', () => {
  it('keeps the current form when a dirty-form switch is cancelled and confirms the switch when accepted', async () => {
    const user = userEvent.setup()
    render(
      <FormsPageContent
        availableForms={availableForms}
        selectedForm={absence}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: /Student name/ }), 'Jordan Lee')
    const picker = screen.getByRole('combobox', { name: 'Form type' })

    await user.click(picker)
    await user.click(await screen.findByRole('option', { name: 'Emergency contacts' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Switching forms will discard those answers.')

    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(router.push).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Student absence report' })).toBeInTheDocument()

    await user.click(picker)
    await user.click(await screen.findByRole('option', { name: 'Emergency contacts' }))
    await user.click(await screen.findByRole('button', { name: 'Discard' }))

    expect(router.push).toHaveBeenCalledWith('/forms?source=sample&type=emergency-contacts')
  })

  it('updates the query when the picker is cleared on a clean form', async () => {
    const user = userEvent.setup()
    render(
      <FormsPageContent
        availableForms={availableForms}
        selectedForm={absence}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Clear/ }))

    expect(router.push).toHaveBeenCalledWith('/forms?source=sample')
  })

  it('locks the picker while submitting and allows switching without a discard prompt after success', async () => {
    const user = userEvent.setup()
    let resolveSubmission!: (result: SubmitFormResult) => void
    vi.mocked(submitFormAction).mockReturnValue(new Promise((resolve) => { resolveSubmission = resolve }))
    render(<FormsPageContent availableForms={availableForms} selectedForm={getValidAbsenceDefinition()} />)
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Jr.')

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(screen.getByRole('combobox', { name: 'Form type' })).toBeDisabled()
    expect(router.push).not.toHaveBeenCalled()

    await act(async () => resolveSubmission({
      status: 'success', receipt: { id: 'saved', type: 'absence-report', submittedAt: '2026-09-30T12:00:00.000Z' },
    }))
    await user.click(screen.getByRole('combobox', { name: 'Form type' }))
    await user.click(await screen.findByRole('option', { name: 'Emergency contacts' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.push).toHaveBeenCalledWith('/forms?source=sample&type=emergency-contacts')
  })

  it('continues to protect dirty answers when switching forms after a failed submission', async () => {
    const user = userEvent.setup()
    vi.mocked(submitFormAction).mockResolvedValue({ status: 'server_error', message: 'Please try again.' })
    render(<FormsPageContent availableForms={availableForms} selectedForm={getValidAbsenceDefinition()} />)
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Jr.')
    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    await user.click(screen.getByRole('combobox', { name: 'Form type' }))
    await user.click(await screen.findByRole('option', { name: 'Emergency contacts' }))

    expect(await screen.findByRole('dialog')).toHaveTextContent('Discard your answers?')
    expect(router.push).not.toHaveBeenCalled()
  })
})
