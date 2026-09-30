import 'server-only'

import { z } from 'zod'
import type { FormsDatabaseClient } from '@/services/internal/database'
import { getFormSubmissionSchema } from '@/services/universal/form/schemas'
import type { FormDefinition } from '@/services/universal/form/types'
import { validateFormSubmission } from '@/services/universal/form/validation'
import type { SubmitFormResult } from '@/services/universal/form/types'

type GetFormDefinitionOptions = {
  database: FormsDatabaseClient
  type: string
}

export async function getFormDefinition({ database, type }: GetFormDefinitionOptions): Promise<FormDefinition | null> {
  const definition = await database.formDefinition.findUnique({ where: { type } })
  if (!definition) return null
  getFormSubmissionSchema(definition.type)
  return definition
}

type ListFormDefinitionsOptions = {
  database: FormsDatabaseClient
}

export async function listFormDefinitions({ database }: ListFormDefinitionsOptions): Promise<readonly FormDefinition[]> {
  const definitions = await database.formDefinition.findMany()
  for (const definition of definitions) getFormSubmissionSchema(definition.type)
  return definitions
}

const submissionInputSchema = z.strictObject({
  type: z.string().min(1),
  values: z.record(z.string(), z.unknown()),
})

type CreateFormSubmissionOptions = {
  database: FormsDatabaseClient
  input: unknown
}

export const createFormSubmission = async ({
  database,
  input,
}: CreateFormSubmissionOptions): Promise<SubmitFormResult> => {
  const request = submissionInputSchema.safeParse(input)
  if (!request.success) {
    return {
      issues: [],
      message: 'The submission request is invalid. Please reload the form and try again.',
      status: 'validation_error',
    }
  }

  const definition = await getFormDefinition({ database, type: request.data.type })
  if (!definition) return { message: 'This form is no longer available. Please choose another form.', status: 'form_not_found' }

  const validation = validateFormSubmission(definition, request.data.values)
  if (!validation.success) {
    return {
      issues: validation.error.issues.map(({ path, message }) => ({
        path: path.map((segment) => typeof segment === 'number' ? segment : String(segment)),
        message,
      })),
      message: 'Please correct the highlighted answers and try again.',
      status: 'validation_error',
    }
  }

  const { id, submittedAt, type } = await database.formSubmission.create({
    data: { type: definition.type, values: validation.data },
  })
  return { receipt: { id, submittedAt, type }, status: 'success' }
}

type GetFormSubmissionOptions = {
  database: FormsDatabaseClient
  id: string
}

export const getFormSubmission = async ({ database, id }: GetFormSubmissionOptions) =>
  database.formSubmission.findUnique({ where: { id } })
