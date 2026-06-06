import React from 'react'
import { useForm } from 'react-hook-form'
import * as authService from '../services/authService'

export default function ResetPassword(){
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')
  const onSubmit = async (data) => {
    await authService.resetPassword(data)
    alert('Password reset completed')
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-full max-w-md bg-white p-6 rounded shadow" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        <label>Token</label>
        <input {...register('token', { required: true })} className="w-full p-2 border rounded mb-2" />

        <label>New Password</label>
        <input type="password" {...register('password', { required: true, minLength: 8 })} className="w-full p-2 border rounded mb-2" />

        <label>Confirm Password</label>
        <input type="password" {...register('confirm', { validate: v => v === password })} className="w-full p-2 border rounded mb-2" />
        {errors.confirm && <div className="text-red-600">Passwords must match</div>}

        <button className="mt-4 w-full bg-yellow-600 text-white p-2 rounded">Reset Password</button>
      </form>
    </div>
  )
}
