import type { FormSubmissionByType } from '@/services/universal/form/schemas'
import { getDatabaseClient } from '@/services/internal/database'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitFormAction } from './actions'

const getAbsenceSubmissionValues = (): FormSubmissionByType['absence-report'] => ({
  student: { name: 'Jordan Lee', grade: '4' },
  guardian: { name: 'Casey Lee', email: 'casey@example.test' },
  startDate: '2026-09-28',
  endDate: '2026-09-29',
  reason: 'illness',
})

const getPermissionSubmissionValues = (): FormSubmissionByType['field-trip-permission'] => ({
  student: { name: 'Jordan Lee', grade: '4' },
  guardian: { name: 'Casey Lee', phone: '555-0100' },
  tripName: 'Science museum',
  tripDate: '2026-10-12',
  permission: 'yes',
  hasMedicalNeeds: false,
  acknowledged: true,
})

const getContactSubmissionValues = (): FormSubmissionByType['emergency-contacts'] => ({
  student: { name: 'Jordan Lee', grade: '4' },
  contacts: [{ name: 'Casey Lee', relationship: 'Parent', phone: '555-0100', preferredMethod: 'phone' }],
})

afterEach(() => vi.restoreAllMocks())

describe('#submitFormAction', () => {
  it.each([
    { type: 'absence-report', values: getAbsenceSubmissionValues() },
    { type: 'field-trip-permission', values: getPermissionSubmissionValues() },
    { type: 'emergency-contacts', values: getContactSubmissionValues() },
  ])('accepts a valid $type submission', async (input) => {
    const result = await submitFormAction(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error('Expected a receipt')
    expect(await getDatabaseClient().formSubmission.findUnique({ where: { id: result.receipt.id } })).toEqual({ ...input, ...result.receipt })
  })

  it('returns serializable validation and unavailable-form results', async () => {
    const invalid = { type: 'absence-report', values: {} }

    const validation = await submitFormAction(invalid)
    const missing = await submitFormAction({ type: 'missing', values: {} })
    const malformed = await submitFormAction(null as never)

    expect(validation.status).toBe('validation_error')
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)
    expect(missing.status).toBe('form_not_found')
    expect(malformed.status).toBe('validation_error')
  })

  it('returns a safe failure when storage fails and excludes answers from logs', async () => {
    vi.spyOn(getDatabaseClient().formSubmission, 'create').mockRejectedValue(new Error('Private answer'))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await submitFormAction({ type: 'absence-report', values: getAbsenceSubmissionValues() })

    expect(result.status).toBe('server_error')
    expect(log).toHaveBeenCalledWith('Form submission failed', { type: 'absence-report', errorType: 'Error' })
    expect(JSON.stringify(result)).not.toContain('Private answer')
  })
})
