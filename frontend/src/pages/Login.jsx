import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import * as authService from '../services/authService'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)

  const onSubmit = async (data) => {
    try {
      const res = await authService.login(data)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      alert('Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-full max-w-md bg-white p-6 rounded shadow" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <label className="block mb-2">Email</label>
        <input {...register('email', { required: true })} className="w-full p-2 border rounded mb-2" />
        {errors.email && <div className="text-red-600">Email is required</div>}

        <label className="block mb-2 mt-4">Password</label>
        <div className="flex gap-2">
          <input type={show? 'text':'password'} {...register('password', { required: true })} className="w-full p-2 border rounded mb-2" />
          <button type="button" onClick={() => setShow(s=>!s)} className="px-2">{show? 'Hide':'Show'}</button>
        </div>
        {errors.password && <div className="text-red-600">Password is required</div>}

        <button className="mt-4 w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  )
}
