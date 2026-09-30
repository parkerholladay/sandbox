// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FORM_DEFINITION_SEEDS } from '@/services/internal/seed'
import type { FormDefinition, SubmitFormAction, SubmitFormResult } from '@/services/universal/form/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DynamicForm } from './dynamic-form'

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

const absence = FORM_DEFINITION_SEEDS.find((form) => form.type === 'absence-report')!
const contacts = FORM_DEFINITION_SEEDS.find((form) => form.type === 'emergency-contacts')!

const receipt = { id: 'receipt-123', type: 'absence-report', submittedAt: '2026-09-30T12:00:00.000Z' }
const submitAction = vi.fn<SubmitFormAction>()

beforeEach(() => {
  submitAction.mockReset().mockResolvedValue({ status: 'success', receipt })
})

afterEach(cleanup)

describe('#DynamicForm', () => {
  it('shows client validation errors without calling the action', async () => {
    const user = userEvent.setup()
    render(<DynamicForm submitAction={submitAction} selectedForm={absence} onDirtyChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findAllByText('This field is required.')).toHaveLength(2)
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(submitAction).not.toHaveBeenCalled()
  })

  it('shows conditional fields, keeps their answers when hidden, and hides them again', async () => {
    const user = userEvent.setup()
    render(<DynamicForm submitAction={submitAction} selectedForm={absence} onDirtyChange={vi.fn()} />)

    expect(screen.queryByRole('textbox', { name: /Please describe/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Other' }))

    const details = await screen.findByRole('textbox', { name: /Please describe/ })
    await user.type(details, 'Family travel')
    await user.click(screen.getByRole('radio', { name: 'Illness' }))

    expect(screen.queryByRole('textbox', { name: /Please describe/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Other' }))

    expect(await screen.findByRole('textbox', { name: /Please describe/ })).toHaveValue('Family travel')
  })

  it('watches the matching sibling separately inside each repeater entry', async () => {
    const user = userEvent.setup()
    render(<DynamicForm submitAction={submitAction} selectedForm={contacts} onDirtyChange={vi.fn()} />)

    expect(screen.queryByRole('textbox', { name: 'Email address' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Email' }))

    expect(await screen.findAllByRole('textbox', { name: 'Email address' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Add emergency contacts' }))
    await user.click(screen.getAllByRole('radio', { name: 'Email' })[1])

    expect(await screen.findAllByRole('textbox', { name: 'Email address' })).toHaveLength(2)
  })

  it('renders every supported scalar field type', () => {
    const definition: FormDefinition = {
      type: 'absence-report',
      title: 'All controls',
      fields: [
        { name: 'text', label: 'Text', type: 'text' },
        { name: 'textarea', label: 'Text area', type: 'textarea' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'phone' },
        { name: 'number', label: 'Number', type: 'number' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'select', label: 'Select', type: 'select', options: [{ label: 'First', value: 'first' }] },
        { name: 'radio', label: 'Radio', type: 'radio', options: [{ label: 'First', value: 'first' }] },
        { name: 'multiSelect', label: 'Multi-select', type: 'multi-select', options: [{ label: 'First', value: 'first' }] },
        { name: 'checkbox', label: 'Checkbox', type: 'checkbox' },
        { name: 'switch', label: 'Switch', type: 'switch' },
      ],
    }

    render(<DynamicForm submitAction={submitAction} selectedForm={definition} onDirtyChange={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'All controls' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Text' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Text area' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Phone' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Number' })).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Radio' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Multi-select' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Checkbox' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Switch' })).toBeInTheDocument()
  })

  it('initializes a repeater with its minimum entry and respects the minimum when removing', async () => {
    const user = userEvent.setup()
    render(<DynamicForm submitAction={submitAction} selectedForm={contacts} onDirtyChange={vi.fn()} />)

    expect(screen.getAllByRole('textbox', { name: /Contact name/ })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /Remove Emergency contacts/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add emergency contacts' }))
    expect(screen.getAllByRole('textbox', { name: /Contact name/ })).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: /Remove emergency contacts 2/ }))
    expect(screen.getAllByRole('textbox', { name: /Contact name/ })).toHaveLength(1)
  })

  it('shows a receipt, clears dirty state, and starts another form with its original defaults', async () => {
    const user = userEvent.setup()
    const onDirtyChange = vi.fn()
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={onDirtyChange} />)
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Jr.')

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByRole('heading', { name: 'Form submitted' })).toHaveFocus()
    expect(screen.getByText(receipt.id)).toBeInTheDocument()
    expect(screen.getByText(/has been received/)).toHaveAttribute('role', 'status')
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    expect(submitAction).toHaveBeenCalledWith(expect.objectContaining({
      type: 'absence-report', values: expect.objectContaining({ student: { name: 'Jordan Lee Jr.', grade: '4' } }),
    }))
    expect(screen.queryByRole('button', { name: 'Submit form' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit another' }))

    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveValue('Jordan Lee')
    expect(screen.getByRole('heading', { name: 'Student absence report' })).toHaveFocus()
    expect(screen.queryByText(receipt.id)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Again')
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveFocus()
  })

  it('locks controls and ignores repeat submissions while the action is pending', async () => {
    const user = userEvent.setup()
    let resolveSubmission!: (result: SubmitFormResult) => void
    submitAction.mockReturnValue(new Promise((resolve) => { resolveSubmission = resolve }))
    const onSubmittingChange = vi.fn()
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} onSubmittingChange={onSubmittingChange} />)
    const form = screen.getByRole('button', { name: 'Submit form' }).closest('form')!

    await user.click(screen.getByRole('button', { name: 'Submit form' }))
    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: /Student name/ })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: /Grade/ })).toBeDisabled()
    expect(screen.getByLabelText(/First day absent/)).toBeDisabled()
    expect(submitAction).toHaveBeenCalledTimes(1)
    expect(onSubmittingChange).toHaveBeenLastCalledWith(true)

    await act(async () => resolveSubmission({ status: 'success', receipt }))

    expect(screen.getByRole('heading', { name: 'Form submitted' })).toBeInTheDocument()
    expect(onSubmittingChange).toHaveBeenLastCalledWith(false)
  })

  it('maps nested server errors to fields and preserves answers for correction', async () => {
    const user = userEvent.setup()
    submitAction.mockResolvedValueOnce({ status: 'validation_error', message: 'Check your answers.', issues: [
      { path: ['student', 'name'], message: 'Please use the student’s full name.' },
    ] })
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please use the student’s full name.')
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveValue('Jordan Lee')
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveFocus()

    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Jr.')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Submit form' }))
    expect(await screen.findByRole('heading', { name: 'Form submitted' })).toBeInTheDocument()
  })

  it('shows unmatched and hidden server errors at form level', async () => {
    const user = userEvent.setup()
    submitAction.mockResolvedValueOnce({ status: 'validation_error', message: 'Check your answers.', issues: [
      { path: ['reasonDetails'], message: 'Reload the form to update its fields.' },
      { path: [], message: 'The form definition has changed.' },
    ] })
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Reload the form to update its fields. The form definition has changed.')
    expect(screen.getByRole('alert')).toHaveFocus()
    expect(screen.queryByRole('textbox', { name: /Please describe/ })).not.toBeInTheDocument()
  })

  it('renders server errors for both a repeater and its nested fields', async () => {
    const user = userEvent.setup()
    submitAction.mockResolvedValueOnce({ status: 'validation_error', message: 'Check your contacts.', issues: [
      { path: ['contacts'], message: 'Please review your contact list.' },
      { path: ['contacts', 0, 'phone'], message: 'Please use a complete phone number.' },
    ] })
    render(<DynamicForm submitAction={submitAction} selectedForm={contacts} onDirtyChange={vi.fn()} />)
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), 'Jordan Lee')
    await user.click(screen.getByRole('combobox', { name: /Grade/ }))
    await user.click(await screen.findByRole('option', { name: '4th' }))
    await user.type(screen.getByRole('textbox', { name: /Contact name/ }), 'Casey Lee')
    await user.type(screen.getByRole('textbox', { name: /Relationship to student/ }), 'Parent')
    await user.type(screen.getByRole('textbox', { name: /Phone number/ }), '555-0100')
    await user.click(screen.getByRole('radio', { name: 'Phone' }))

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByText('Please review your contact list.')).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Please use a complete phone number.')).toHaveAttribute('role', 'alert')
    expect(screen.getByRole('textbox', { name: /Phone number/ })).toHaveValue('555-0100')
  })

  it('closes a calendar popup when submission begins', async () => {
    const user = userEvent.setup()
    let resolveSubmission!: (result: SubmitFormResult) => void
    submitAction.mockReturnValue(new Promise((resolve) => { resolveSubmission = resolve }))
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} />)
    const form = screen.getByRole('button', { name: 'Submit form' }).closest('form')!
    await user.click(screen.getByLabelText(/First day absent/))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    fireEvent.submit(form)

    expect(await screen.findByRole('button', { name: 'Submitting…' })).toBeDisabled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await act(async () => resolveSubmission({ status: 'success', receipt }))
  })

  it('retains dirty answers after a network failure and allows retry', async () => {
    const user = userEvent.setup()
    const onDirtyChange = vi.fn()
    submitAction.mockRejectedValueOnce(new Error('Network unavailable'))
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={onDirtyChange} />)
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Jr.')

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not confirm your submission.')
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveValue('Jordan Lee Jr.')
    expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('button', { name: 'Submit form' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByRole('heading', { name: 'Form submitted' })).toBeInTheDocument()
    expect(submitAction).toHaveBeenCalledTimes(2)
  })

  it.each(['server_error', 'form_not_found'] as const)('shows a %s result without clearing answers', async (status) => {
    const user = userEvent.setup()
    submitAction.mockResolvedValueOnce({ status, message: 'Please try again later.' })
    render(<DynamicForm submitAction={submitAction} selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Submit form' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again later.')
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveValue('Jordan Lee')
  })
})
