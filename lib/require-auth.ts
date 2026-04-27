import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const store = await cookies()
  const session = store.get('parsco_session')
  if (!session?.value) {
    redirect('/login')
  }
}
