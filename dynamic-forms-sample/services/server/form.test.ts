import { getDatabaseClient, type FormsDatabaseClient } from '@/services/internal/database'
import { FORM_DEFINITION_SEEDS } from '@/services/internal/seed'
import type { FormDefinition } from '@/services/universal/form/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFormSubmission, getFormDefinition, getFormSubmission, listFormDefinitions } from './form'

function createDatabase(definitions: readonly FormDefinition[]): FormsDatabaseClient {
  const database = getDatabaseClient()

  return {
    ...database,
    formDefinition: {
      async findMany() {
        return definitions
      },
      async findUnique({ where: { type } }) {
        return definitions.find((definition) => definition.type === type) ?? null
      },
    },
  }
}

describe('#getFormDefinition', () => {
  it('returns a registered definition and returns null when the definition is missing', async () => {
    const database = createDatabase(FORM_DEFINITION_SEEDS)

    await expect(getFormDefinition({ database, type: 'absence-report' })).resolves.toEqual(
      FORM_DEFINITION_SEEDS.find((definition) => definition.type === 'absence-report'),
    )
    await expect(getFormDefinition({ database, type: 'unknown-form' })).resolves.toBeNull()
  })

  it('throws when a found definition has no registered submission schema', async () => {
    const database = createDatabase([
      { fields: [], title: 'Unregistered', type: 'unregistered' },
    ])

    await expect(getFormDefinition({ database, type: 'unregistered' })).rejects.toThrow(
      'No submission schema is registered for form type "unregistered".',
    )
  })

  it('propagates database errors', async () => {
    const database = createDatabase(FORM_DEFINITION_SEEDS)
    database.formDefinition.findUnique = async () => { throw new Error('Database unavailable') }

    await expect(getFormDefinition({ database, type: 'absence-report' })).rejects.toThrow('Database unavailable')
  })
})

describe('#listFormDefinitions', () => {
  it('returns registered definitions in database order', async () => {
    const definitions = [FORM_DEFINITION_SEEDS[2], FORM_DEFINITION_SEEDS[0]]

    await expect(listFormDefinitions({ database: createDatabase(definitions) })).resolves.toEqual(definitions)
  })

  it('returns an empty list when the database has no definitions', async () => {
    await expect(listFormDefinitions({ database: createDatabase([]) })).resolves.toEqual([])
  })

  it('throws if any listed definition has no registered submission schema', async () => {
    const definitions = [
      FORM_DEFINITION_SEEDS[0],
      { fields: [], title: 'Unregistered', type: 'unregistered' },
      FORM_DEFINITION_SEEDS[1],
    ]

    await expect(listFormDefinitions({ database: createDatabase(definitions) })).rejects.toThrow(
      'No submission schema is registered for form type "unregistered".',
    )
  })

  it('propagates database errors', async () => {
    const database = createDatabase(FORM_DEFINITION_SEEDS)
    database.formDefinition.findMany = async () => { throw new Error('Database unavailable') }

    await expect(listFormDefinitions({ database })).rejects.toThrow('Database unavailable')
  })
})

import type { FormSubmissionByType } from '@/services/universal/form/schemas'

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

describe('#createFormSubmission', () => {
  it.each([
    { type: 'absence-report', values: getAbsenceSubmissionValues() },
    { type: 'field-trip-permission', values: getPermissionSubmissionValues() },
    { type: 'emergency-contacts', values: getContactSubmissionValues() },
  ])('stores a valid $type submission and returns only receipt metadata', async (input) => {
    const database = getDatabaseClient()

    const result = await createFormSubmission({ database, input })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error('Expected a receipt')
    expect(result.receipt).not.toHaveProperty('values')
    expect(await getFormSubmission({ database, id: result.receipt.id })).toEqual({ ...result.receipt, ...input })
  })

  it('stores normalized answers and removes hidden and unknown values', async () => {
    const database = getDatabaseClient()
    const input = {
      type: 'absence-report',
      values: {
        ...getAbsenceSubmissionValues(),
        student: { name: ' Jordan Lee ', grade: '4', extra: 'discard' },
        reasonDetails: 'Hidden answer',
        extra: 'discard',
      },
    }

    const result = await createFormSubmission({ database, input })

    if (result.status !== 'success') throw new Error('Expected a receipt')
    expect((await database.formSubmission.findUnique({ where: { id: result.receipt.id } }))?.values).toEqual(getAbsenceSubmissionValues())
    expect(input.values.reasonDetails).toBe('Hidden answer')
  })

  it.each([null, [], 'invalid', {}, { type: 42, values: {} }, { type: '', values: {} }, { type: 'absence-report', values: [] }])(
    'rejects malformed input without writing: %j', async (input) => {
      const database = getDatabaseClient()
      const create = vi.spyOn(database.formSubmission, 'create')

      const result = await createFormSubmission({ database, input })

      expect(result.status).toBe('validation_error')
      expect(create).not.toHaveBeenCalled()
    },
  )

  it.each(['missing', '__proto__', 'constructor'])('rejects the unavailable form %s without writing', async (type) => {
    const database = getDatabaseClient()
    const create = vi.spyOn(database.formSubmission, 'create')

    const result = await createFormSubmission({ database, input: { type, values: {} } })

    expect(result.status).toBe('form_not_found')
    expect(create).not.toHaveBeenCalled()
  })

  it.each([
    { type: 'absence-report', values: { ...getAbsenceSubmissionValues(), endDate: '2026-09-27' }, path: ['endDate'] },
    { type: 'field-trip-permission', values: { ...getPermissionSubmissionValues(), acknowledged: false }, path: ['acknowledged'] },
    { type: 'emergency-contacts', values: { ...getContactSubmissionValues(), contacts: [{ ...getContactSubmissionValues().contacts[0], preferredMethod: 'email' }] }, path: ['contacts', 0, 'email'] },
  ])('returns field paths for invalid $type answers without writing', async ({ path, type, values }) => {
    const database = getDatabaseClient()
    const create = vi.spyOn(database.formSubmission, 'create')

    const result = await createFormSubmission({ database, input: { type, values } })

    expect(result.status).toBe('validation_error')
    if (result.status !== 'validation_error') throw new Error('Expected validation errors')
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path })]))
    expect(create).not.toHaveBeenCalled()
  })

  it('propagates schema registration failures without writing', async () => {
    const database = getDatabaseClient()
    vi.spyOn(database.formDefinition, 'findUnique').mockResolvedValue({ fields: [], title: 'Unregistered', type: 'unregistered' })
    const create = vi.spyOn(database.formSubmission, 'create')

    const result = createFormSubmission({
      database, input: { type: 'unregistered', values: {} },
    })

    await expect(result).rejects.toThrow('No submission schema')
    expect(create).not.toHaveBeenCalled()
  })
})
