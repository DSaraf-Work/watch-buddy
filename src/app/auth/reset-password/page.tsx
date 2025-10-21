import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password - Watch-Buddy',
  description: 'Set your new password',
}

export default function ResetPasswordPage() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-2 text-gray-600">Enter your new password below</p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}

