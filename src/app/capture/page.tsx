'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { KeyboardActionBar } from '../../components/KeyboardActionBar'
import { BottomBar } from '../../components/BottomBar'

export default function CapturePage() {
  const [inputFocused, setInputFocused] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [log, setLog] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession()
      setEmail(data.session?.user?.email ?? null)
    }
    load()
  }, [])

  const handleSave = async () => {
    const v = log.trim()
    if (!v) return

    setSaving(true)
    const { error } = await supabase.from('topics').insert({ log: v })
    setSaving(false)

    if (error) {
      alert(`保存失敗: ${error.message}`)
      return
    }

    setLog('')
    alert('保存しました')
  }

  if (!email) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Not logged in</h1>
        <p><a href="/login">Go to Login</a></p>
      </main>
    )
  }

  return (
    <main style={{ padding: 20, maxWidth: 720, paddingBottom: 180 }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Capture</h1>
      <p style={{ marginBottom: 16 }}>Logged in as: {email}</p>


      <input
        type="text"
        placeholder="1行ログ（例：ジムに通い始めた）"
        value={log}
        onChange={(e) => setLog(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 12 }}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
          }
        }}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          height: 44,
          padding: '0 16px',
          border: '1px solid #ccc',
          borderRadius: 10,
        }}
      >
        {saving ? 'Saving...' : '保存'}
      </button>

      <KeyboardActionBar
        visible={inputFocused}
        left={
          <a
            href="/topics"
            style={{
              height: 44,
              padding: '0 16px',
              border: '1px solid #ccc',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            Topics
          </a>
        }
        right={
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 44,
              padding: '0 16px',
              border: '1px solid #ccc',
              borderRadius: 10,
            }}
          >
            {saving ? 'Saving...' : '保存'}
          </button>
        }
      />
      <BottomBar />
    </main>
  )
}