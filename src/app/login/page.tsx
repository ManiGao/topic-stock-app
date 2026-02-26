'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('ログインリンクを送信しました。メールを確認してください。')
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto" >
      <h1 className="text-xl mb-4">Login</h1>
      <input
        type="email"
        placeholder="your@email.com"
        className="border p-2 w-full mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 w-full"
      >
        {loading ? 'Sending...' : 'Send Login Link'}
      </button>
    </main>
  )
}