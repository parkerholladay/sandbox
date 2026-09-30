import { FormsPageContent } from '@/app/forms/_components/forms-page-content'
import { getFormDefinition, listFormDefinitions } from '@/services/server/form'
import { getDatabaseClient } from '@/services/internal/database'

type FormsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FormsPage({ searchParams }: FormsPageProps) {
  const params = await searchParams
  const requestedType = params.type
  const database = getDatabaseClient()
  const [definitions, definition] = await Promise.all([
    listFormDefinitions({ database }),
    typeof requestedType === 'string'
      ? getFormDefinition({ database, type: requestedType })
      : Promise.resolve(null),
  ])

  let selectionMessage: string | undefined

  if (Array.isArray(requestedType)) {
    selectionMessage = 'Choose one form type from the URL.'
  } else if (typeof requestedType === 'string' && !definition) {
    selectionMessage = `No form is available for type “${requestedType}”. Choose another form.`
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Family portal
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          School forms
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Choose a form to get started.
        </p>
      </header>
      <FormsPageContent
        availableForms={definitions.map(({ title, type }) => ({ label: title, type }))}
        key={typeof requestedType === 'string' ? requestedType : 'no-form'}
        selectedForm={definition}
        selectionMessage={selectionMessage}
      />
    </main>
  )
}
