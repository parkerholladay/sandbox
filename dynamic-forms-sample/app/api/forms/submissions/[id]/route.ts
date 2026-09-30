import { getFormSubmission } from '@/services/server/form'
import { getDatabaseClient } from '@/services/internal/database'

export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'no-store' }

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params

  try {
    const submission = await getFormSubmission({ database: getDatabaseClient(), id })

    if (!submission) {
      return Response.json({ error: 'Submission not found.' }, { status: 404, headers })
    }

    return Response.json(submission, { headers })
  } catch (error) {
    console.error('Submission retrieval failed', {
      id,
      errorType: error instanceof Error ? error.name : 'UnknownError',
    })

    return Response.json({ error: 'We could not retrieve this submission.' }, { status: 500, headers })
  }
}
