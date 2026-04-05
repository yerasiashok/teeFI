import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Film } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  password:  z.string().min(8, 'Minimum 8 characters'),
  phone:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await authApi.register(data)
      setAuth(auth)
      toast.success('Account created!')
      navigate('/')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cinema-red rounded-xl flex items-center justify-center mx-auto mb-4">
            <Film size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">Create account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join the teeFI community</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">First name</label>
              <input {...register('firstName')} className="input" />
              {errors.firstName && <p className="text-red-400 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1.5 block">Last name</label>
              <input {...register('lastName')} className="input" />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
            <input {...register('email')} className="input" placeholder="you@example.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Password</label>
            <input {...register('password')} type="password" className="input" placeholder="Min 8 characters" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1.5 block">Phone (optional)</label>
            <input {...register('phone')} className="input" placeholder="+91 98765 43210" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-cinema-red hover:text-red-400">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
