import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - Watch-Buddy',
  description: 'Sign in to your Watch-Buddy account',
}

export default function LoginPage() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="mt-2 text-gray-600">Sign in to continue to Watch-Buddy</p>
      </div>

      <LoginForm />

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold text-primary-600 hover:text-primary-700 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

