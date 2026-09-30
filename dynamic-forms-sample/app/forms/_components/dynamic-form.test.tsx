// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FORM_DEFINITION_SEEDS } from '@/services/forms/seed'
import type { FormDefinition } from '@/services/forms/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DynamicForm } from './dynamic-form'

const absence = FORM_DEFINITION_SEEDS.find((form) => form.type === 'absence-report')!
const contacts = FORM_DEFINITION_SEEDS.find((form) => form.type === 'emergency-contacts')!

const getValidAbsenceDefinition = (): FormDefinition => ({
  ...absence,
  fields: absence.fields.map((field) => {
    if (field.type === 'group') {
      return {
        ...field,
        fields: field.fields.map((child) => {
          if (child.type === 'text') {
            return { ...child, defaultValue: field.name === 'student' ? 'Jordan Lee' : 'Casey Lee' }
          }
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
})

afterEach(cleanup)

describe('#DynamicForm', () => {
  it('shows schema errors and validates entered answers without submitting them', async () => {
    const user = userEvent.setup()
    render(<DynamicForm selectedForm={absence} onDirtyChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Validate form' }))

    expect(await screen.findAllByText('This field is required.')).toHaveLength(2)
    expect(screen.getByRole('textbox', { name: /Student name/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows conditional fields, keeps their answers when hidden, and hides them again', async () => {
    const user = userEvent.setup()
    render(<DynamicForm selectedForm={absence} onDirtyChange={vi.fn()} />)

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
    render(<DynamicForm selectedForm={contacts} onDirtyChange={vi.fn()} />)

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

    render(<DynamicForm selectedForm={definition} onDirtyChange={vi.fn()} />)

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
    render(<DynamicForm selectedForm={contacts} onDirtyChange={vi.fn()} />)

    expect(screen.getAllByRole('textbox', { name: /Contact name/ })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /Remove Emergency contacts/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add emergency contacts' }))
    expect(screen.getAllByRole('textbox', { name: /Contact name/ })).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: /Remove emergency contacts 2/ }))
    expect(screen.getAllByRole('textbox', { name: /Contact name/ })).toHaveLength(1)
  })

  it('shows validation feedback after success and clears it when an answer changes', async () => {
    const user = userEvent.setup()
    render(<DynamicForm selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Validate form' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Form is valid. Nothing has been submitted.')
    await user.type(screen.getByRole('textbox', { name: /Student name/ }), ' Jr.')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('clears validation feedback after a radio value changes', async () => {
    const user = userEvent.setup()
    render(<DynamicForm selectedForm={getValidAbsenceDefinition()} onDirtyChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Validate form' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Form is valid. Nothing has been submitted.')

    await user.click(screen.getByRole('radio', { name: 'Other' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
