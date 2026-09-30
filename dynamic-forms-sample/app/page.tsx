import { redirect } from 'next/navigation'

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry))
    } else if (value !== undefined) {
      params.set(key, value)
    }
  }

  const query = params.toString()

  redirect(query ? `/forms?${query}` : '/forms')
}
