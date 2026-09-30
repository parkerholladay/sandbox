import type { FormSubmissionByType } from '@/services/universal/form/schemas'
import { describe, expect, it, vi } from 'vitest'
import { getDatabaseClient, initializeDatabaseClient } from './database'
import { FORM_DEFINITION_SEEDS } from './seed'

const getSubmissionData = (): { type: 'absence-report'; values: FormSubmissionByType['absence-report'] } => ({
  type: 'absence-report',
  values: {
    endDate: '2026-09-29',
    guardian: { email: 'casey@example.test', name: 'Casey Lee' },
    reason: 'illness',
    startDate: '2026-09-28',
    student: { grade: '4', name: 'Jordan Lee' },
  },
})

describe('#getDatabaseClient', () => {
  it('exposes seeded definitions in order and returns null for missing records', async () => {
    const database = getDatabaseClient()

    expect(await database.formDefinition.findMany()).toEqual(FORM_DEFINITION_SEEDS)
    expect(await database.formDefinition.findUnique({ where: { type: 'absence-report' } })).toEqual(FORM_DEFINITION_SEEDS[0])
    expect(await database.formDefinition.findUnique({ where: { type: '__proto__' } })).toBeNull()
    expect(await database.formSubmission.findUnique({ where: { id: 'missing' } })).toBeNull()
  })

  it('returns independent copies of nested definitions', async () => {
    const database = getDatabaseClient()
    const listed = (await database.formDefinition.findMany())[0]
    const retrieved = await database.formDefinition.findUnique({ where: { type: listed.type } })
    const originalTitle = listed.title
    listed.title = 'Changed list result'
    retrieved!.fields[0].label = 'Changed lookup result'

    expect((await database.formDefinition.findUnique({ where: { type: listed.type } }))?.title).toBe(originalTitle)
    expect((await database.formDefinition.findMany())[0].fields[0].label).toBe(FORM_DEFINITION_SEEDS[0].fields[0].label)
  })

  it('creates submissions with database-generated metadata and independent copies', async () => {
    const database = getDatabaseClient()
    const data = getSubmissionData()
    const first = await database.formSubmission.create({ data })
    const second = await database.formSubmission.create({ data })
    data.values.student.name = 'Changed input'
    first.values.student.name = 'Changed return value'
    const stored = await database.formSubmission.findUnique({ where: { id: first.id } })

    expect(stored?.values.student.name).toBe('Jordan Lee')
    expect(first.id).toMatch(/^[\da-f-]{36}$/)
    expect(first.id).not.toBe(second.id)
    expect(new Date(first.submittedAt).toISOString()).toBe(first.submittedAt)
  })

})

describe('#initializeDatabaseClient', () => {
  it('preserves one client and its records across calls and module reloads', async () => {
    const database = initializeDatabaseClient()
    const submission = await database.formSubmission.create({ data: getSubmissionData() })

    vi.resetModules()
    const reloaded = await import('./database')
    const reloadedDatabase = reloaded.initializeDatabaseClient()

    expect(getDatabaseClient()).toBe(database)
    expect(reloadedDatabase).toBe(database)
    expect(await reloadedDatabase.formSubmission.findUnique({ where: { id: submission.id } })).toEqual(submission)
    expect(await reloadedDatabase.formDefinition.findMany()).toEqual(FORM_DEFINITION_SEEDS)
  })
})
