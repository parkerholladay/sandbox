import type { FormSubmissionByType } from '@/services/universal/form/schemas'
import { submitFormAction } from '@/app/forms/actions'
import { getDatabaseClient } from '@/services/internal/database'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const getAbsenceSubmissionValues = (): FormSubmissionByType['absence-report'] => ({
  student: { name: 'Jordan Lee', grade: '4' },
  guardian: { name: 'Casey Lee', email: 'casey@example.test' },
  startDate: '2026-09-28',
  endDate: '2026-09-29',
  reason: 'illness',
})

afterEach(() => vi.restoreAllMocks())

describe('#GET', () => {
  it('retrieves the record created by the Server Action without caching it', async () => {
    const values = getAbsenceSubmissionValues()
    const result = await submitFormAction({ type: 'absence-report', values })
    if (result.status !== 'success') throw new Error('Expected a receipt')
    const { id } = result.receipt

    const response = await GET(new Request(`http://localhost/api/forms/submissions/${id}`), { params: Promise.resolve({ id }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ ...result.receipt, values })
  })

  it('returns an uncached JSON 404 for an unknown ID', async () => {
    const request = new Request('http://localhost/api/forms/submissions/missing')

    const response = await GET(request, { params: Promise.resolve({ id: 'missing' }) })

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ error: 'Submission not found.' })
  })

  it('returns a safe JSON 500 when retrieval fails', async () => {
    vi.spyOn(getDatabaseClient().formSubmission, 'findUnique').mockRejectedValue(new Error('Private answer'))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await GET(new Request('http://localhost/api/forms/submissions/example'), { params: Promise.resolve({ id: 'example' }) })

    expect(response.status).toBe(500)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ error: 'We could not retrieve this submission.' })
    expect(log).toHaveBeenCalledWith('Submission retrieval failed', { id: 'example', errorType: 'Error' })
  })
})
