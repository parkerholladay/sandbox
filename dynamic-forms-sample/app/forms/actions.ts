'use server'

import { createFormSubmission } from '@/services/server/form'
import { getDatabaseClient } from '@/services/internal/database'
import type { SubmitFormInput, SubmitFormResult } from '@/services/universal/form/types'

export const submitFormAction = async (input: SubmitFormInput): Promise<SubmitFormResult> => {
  try {
    return await createFormSubmission({
      database: getDatabaseClient(),
      input,
    })
  } catch (error) {
    console.error('Form submission failed', {
      type: typeof input?.type === 'string' ? input.type : undefined,
      errorType: error instanceof Error ? error.name : 'UnknownError',
    })

    return {
      message: 'We could not save your submission. Please try again.',
      status: 'server_error',
    }
  }
}
