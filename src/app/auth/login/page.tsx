import { Metadata } from 'next'
import { LoginForm } from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In - Watch-Buddy',
  description: 'Sign in to your Watch-Buddy account with Google',
}

export default function LoginPage() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Watch-Buddy</h1>
        <p className="mt-2 text-gray-600">Sign in with Google to track your watch history</p>
      </div>

      <LoginForm />
    </div>
  )
}

