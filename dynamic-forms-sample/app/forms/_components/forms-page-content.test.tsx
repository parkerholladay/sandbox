// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FORM_DEFINITION_SEEDS } from '@/services/forms/seed'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FormsPageContent } from './forms-page-content'

const router = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))

const absence = FORM_DEFINITION_SEEDS.find((form) => form.type === 'absence-report')!
const contacts = FORM_DEFINITION_SEEDS.find((form) => form.type === 'emergency-contacts')!
const availableForms = [absence, contacts].map(({ type, title }) => ({ type, label: title }))

beforeEach(() => {
  router.push.mockClear()
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
})
