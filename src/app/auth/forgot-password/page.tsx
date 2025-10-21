import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password - Watch-Buddy',
  description: 'Reset your Watch-Buddy password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="mt-2 text-gray-600">
          Enter your email to receive a password reset link
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-6 text-center text-sm">
        <Link
          href="/auth/login"
          className="text-gray-600 hover:text-primary-700 transition"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  )
}

