import { auth } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-bg">
      <Navbar user={session.user} />
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  )
}
