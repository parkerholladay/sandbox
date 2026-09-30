import 'server-only'

import type { FormSubmissionByType, FormType } from '@/services/universal/form/schemas'
import type { FormDefinition } from '@/services/universal/form/types'
import type { SubmissionReceipt } from '@/services/universal/form/types'
import { randomUUID } from 'node:crypto'
import { FORM_DEFINITION_SEEDS } from './seed'

type FormSubmission = SubmissionReceipt & {
  values: FormSubmissionByType[FormType]
}

export type FormDefinitionDelegate = {
  findMany: () => Promise<readonly FormDefinition[]>
  findUnique: (input: { where: { type: string } }) => Promise<FormDefinition | null>
}

export type FormSubmissionDelegate = {
  create: (input: { data: Pick<FormSubmission, 'type' | 'values'> }) => Promise<FormSubmission>
  findUnique: (input: { where: { id: string } }) => Promise<FormSubmission | null>
}

export type FormsDatabaseClient = {
  formDefinition: FormDefinitionDelegate
  formSubmission: FormSubmissionDelegate
}

const createInMemoryDatabaseClient = (): FormsDatabaseClient => {
  const definitions = new Map<string, FormDefinition>(
    FORM_DEFINITION_SEEDS.map((definition) => [definition.type, structuredClone(definition)]),
  )
  const submissions = new Map<string, FormSubmission>()

  return {
    formDefinition: {
      findMany: async () => structuredClone([...definitions.values()]),
      findUnique: async ({ where: { type } }) => {
        const definition = definitions.get(type)

        return definition ? structuredClone(definition) : null
      },
    },
    formSubmission: {
      create: async ({ data }) => {
        const submission: FormSubmission = {
          id: randomUUID(),
          submittedAt: new Date().toISOString(),
          type: data.type,
          values: structuredClone(data.values),
        }
        submissions.set(submission.id, structuredClone(submission))

        return structuredClone(submission)
      },
      findUnique: async ({ where: { id } }) => {
        const submission = submissions.get(id)

        return submission ? structuredClone(submission) : null
      },
    },
  }
}

const databaseGlobal = globalThis as typeof globalThis & {
  __dynamicFormsDatabaseClient?: FormsDatabaseClient
}

export const initializeDatabaseClient = (): FormsDatabaseClient => {
  databaseGlobal.__dynamicFormsDatabaseClient ??= createInMemoryDatabaseClient()

  return databaseGlobal.__dynamicFormsDatabaseClient
}

export const getDatabaseClient = (): FormsDatabaseClient => initializeDatabaseClient()
