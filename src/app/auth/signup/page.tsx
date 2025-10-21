import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/features/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up - Watch-Buddy',
  description: 'Create your Watch-Buddy account',
}

export default function SignupPage() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
        <p className="mt-2 text-gray-600">
          Create your account to start tracking
        </p>
      </div>

      <SignupForm />

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-primary-600 hover:text-primary-700 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

