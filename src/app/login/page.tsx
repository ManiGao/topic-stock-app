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
    <main
      className="w-full min-h-screen max-w-md mx-auto box-border pt-6 pb-[env(safe-area-inset-bottom)] px-4"
      style={{
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))'
      }}
    >
      <h1 className="text-xl mb-4">Login</h1>
      <input
        type="email"
        placeholder="your@email.com"
        className="border p-3 text-[16px] leading-5 w-full mb-4 appearance-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 text-white h-12 rounded-xl text-base font-medium w-full"
      >
        {loading ? 'Sending...' : 'Send Login Link'}
      </button>
    </main>
  )
}