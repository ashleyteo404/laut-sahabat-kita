import { NextResponse, type NextRequest } from 'next/server'
import { enSource, type ActionMessageKey } from '@/lib/i18n/dictionaries/en'
import { processActivitySubmission } from '@/lib/submissions/server'

// Responses carry a key plus an English fallback: the caller may be the service worker, which has
// no dictionary but can store the key for the page to translate later.
function errorResponse(status: number, messageKey: ActionMessageKey) {
  return NextResponse.json(
    { status: 'error', messageKey, message: enSource[messageKey] },
    { status },
  )
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 4 * 1024 * 1024) {
    return errorResponse(413, 'action.submission.photoTooLarge')
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return errorResponse(400, 'action.submission.invalid')
  }

  const result = await processActivitySubmission(formData)
  return NextResponse.json(
    {
      status: result.ok ? 'success' : 'error',
      messageKey: result.messageKey,
      message: result.message,
    },
    { status: result.status },
  )
}
