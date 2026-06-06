import React from 'react'
import { useForm } from 'react-hook-form'
import * as authService from '../services/authService'

export default function ForgotPassword(){
  const { register, handleSubmit } = useForm()
  const onSubmit = async (data) => {
    await authService.forgotPassword(data)
    alert('If the email exists, a reset token was generated.')
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-full max-w-md bg-white p-6 rounded shadow" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
        <label>Email</label>
        <input {...register('email', { required: true })} className="w-full p-2 border rounded mb-2" />
        <button className="mt-4 w-full bg-yellow-600 text-white p-2 rounded">Submit</button>
      </form>
    </div>
  )
}
