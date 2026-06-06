import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService'

const roles = [
  { id: 1, name: 'procurement_officer' },
  { id: 2, name: 'vendor' },
  { id: 3, name: 'manager' },
]

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role_id: data.role_id,
      })
      navigate('/login')
    } catch (err) {
      alert('Signup failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-full max-w-md bg-white p-6 rounded shadow" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
        <label className="block mb-2">Name</label>
        <input {...register('name', { required: true })} className="w-full p-2 border rounded mb-2" />
        {errors.name && <div className="text-red-600">Name is required</div>}

        <label className="block mb-2">Email</label>
        <input {...register('email', { required: true })} className="w-full p-2 border rounded mb-2" />

        <label className="block mb-2">Phone</label>
        <input {...register('phone')} className="w-full p-2 border rounded mb-2" />

        <label className="block mb-2">Password</label>
        <input type="password" {...register('password', { required: true, minLength: 8 })} className="w-full p-2 border rounded mb-2" />

        <label className="block mb-2">Confirm Password</label>
        <input type="password" {...register('confirm', { validate: v => v === password })} className="w-full p-2 border rounded mb-2" />
        {errors.confirm && <div className="text-red-600">Passwords must match</div>}

        <label className="block mb-2">Role</label>
        <select {...register('role_id', { required: true })} className="w-full p-2 border rounded mb-2">
          <option value="">Select role</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        <button className="mt-4 w-full bg-green-600 text-white p-2 rounded">Sign Up</button>
      </form>
    </div>
  )
}
