import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function ResetPasswordPage() {
  redirect(ROUTES.AUTH.LOGIN)
}
