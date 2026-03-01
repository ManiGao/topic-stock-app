'use client'

import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const normalizedEmail = useMemo(() => email.trim(), [email])

  // 全角（例：＠、．、スペース等）や全角混在をざっくり弾く
  const hasFullWidth = useMemo(() => /[\uFF01-\uFF60\uFFE0-\uFFE6\u3000]/.test(normalizedEmail), [normalizedEmail])

  // 最低限のメール形式チェック（ドメイン必須）
  const looksLikeEmail = useMemo(() => {
    if (!normalizedEmail) return false
    if (hasFullWidth) return false
    // 例: a@b.c を最低ラインに
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  }, [normalizedEmail, hasFullWidth])

  const showEmailError = useMemo(() => {
    if (!normalizedEmail) return false
    return !looksLikeEmail
  }, [normalizedEmail, looksLikeEmail])

  const canSubmit = looksLikeEmail && !loading

  const handleLogin = async () => {
    if (!canSubmit) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
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
      <div
        className="mx-auto w-full max-w-md box-border pt-6 px-4"
        style={{
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        }}
      >
        <h1 className="text-xl mb-4">Login</h1>
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="your@email.com"
          className="border p-3 text-[16px] leading-5 w-full mb-3 appearance-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {showEmailError && (
          <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>
            *メールアドレスを入力してください
          </p>
        )}
        <button
          onClick={handleLogin}
          disabled={!canSubmit}
          className={
            `text-white h-14 rounded-xl text-base font-medium w-full ` +
            (canSubmit ? 'bg-blue-500' : 'bg-gray-300')
          }
          style={{ cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          {loading ? 'Sending...' : 'Send Login Link'}
        </button>
      </div>
    </main>
  )
}