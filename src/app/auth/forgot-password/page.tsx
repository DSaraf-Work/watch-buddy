import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function ForgotPasswordPage() {
  redirect(ROUTES.AUTH.LOGIN)
}
