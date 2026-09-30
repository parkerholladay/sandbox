export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDatabaseClient } = await import('./services/internal/database')
    initializeDatabaseClient()
  }
}
