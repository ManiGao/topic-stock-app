'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { BottomBar } from '../../components/BottomBar'
import { savePostLoginRedirect } from '../../lib/postLoginRedirect'

type Topic = {
    id: string
    log: string
    status: 'raw' | 'ready'
    created_at: string
    ready_at: string | null
}

export default function TopicsPage() {
    const [facVisible, setFacVisible] = useState(true)
    const [status, setStatus] = useState<'raw' | 'ready'>(() => {
        if (typeof window !== 'undefined') {
            const s = localStorage.getItem('topics_status')
            if (s === 'raw' || s === 'ready') return s
        }
        return 'raw'
    })
    const [userId, setUserId] = useState<string | null>(null)
    const [displayName, setDisplayName] = useState<string | null>(null)
    const [nameInput, setNameInput] = useState('')
    const [nameLoading, setNameLoading] = useState(false)
    const [nameError, setNameError] = useState<string | null>(null)
    const [items, setItems] = useState<Topic[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const loadProfile = async () => {
        if (!userId) return
        const { data, error } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', userId)
            .maybeSingle()

        if (error) {
            // プロフィールはMVPでは致命ではないので、表示は止めずに握りつぶす
            console.warn('profiles load error:', error.message)
            return
        }

        if (data?.display_name) {
            setDisplayName(data.display_name)
        } else {
            setDisplayName(null)
        }
    }

    const saveDisplayName = async () => {
        if (!userId) return
        setNameError(null)

        const v = nameInput.trim()
        if (!v) {
            setNameError('表示名を入力してください')
            return
        }
        if (v.length > 24) {
            setNameError('表示名は24文字以内にしてください')
            return
        }

        setNameLoading(true)
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, display_name: v })

        setNameLoading(false)

        if (error) {
            setNameError(error.message)
            return
        }

        setDisplayName(v)
        setNameInput('')
    }

    const load = async (s: 'raw' | 'ready') => {
        setLoading(true)
        const orderCol = s === 'ready' ? 'ready_at' : 'created_at'

        const { data, error } = await supabase
            .from('topics')
            .select('id,log,status,created_at,ready_at')
            .eq('status', s)
            .order(orderCol, { ascending: false, nullsFirst: false })
            .limit(200)

        setLoading(false)

        if (error) {
            alert(error.message)
            return
        }
        setItems((data ?? []) as Topic[])
    }

    const deleteTopic = async (id: string) => {
        const ok = confirm('このログを削除しますか？')
        if (!ok) return

        const { error } = await supabase.from('topics').delete().eq('id', id)
        if (error) {
            alert(`削除失敗: ${error.message}`)
            return
        }

        // 画面側も即反映
        setItems((prev) => prev.filter((x) => x.id !== id))
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUserId(data.session?.user?.id ?? null)
        })
    }, [])

    useEffect(() => {
        load(status)
    }, [status])

    useEffect(() => {
        if (!userId) return
        loadProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    useEffect(() => {
        localStorage.setItem('topics_status', status)
    }, [status])

    useEffect(() => {
        let timer: any = null

        const onScroll = () => {
            // スクロール中は隠す
            setFacVisible(false)

            // スクロール停止後に再表示（150msは体感でちょうど良い）
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                setFacVisible(true)
            }, 120)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (timer) clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        const redirectTo = sessionStorage.getItem('postLoginRedirect')
        if (redirectTo) {
            sessionStorage.removeItem('postLoginRedirect')
            router.replace(redirectTo)
        }
    }, [router])

    if (!userId) {
        return (
            <main style={{ padding: 20 }}>
                <h1>Not logged in</h1>
                <button
                    onClick={() => {
                        savePostLoginRedirect('/topics')
                        router.push('/login')
                    }}
                    style={{
                        height: 44,
                        padding: '0 16px',
                        border: '1px solid #ccc',
                        borderRadius: 12,
                        background: 'transparent',
                    }}
                >
                    Go to Login
                </button>
            </main>
        )
    }

    return (
        <main style={{ padding: 20, maxWidth: 640, paddingBottom: 260 }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Topics</h1>

            {displayName ? (
                <p style={{ marginBottom: 16, fontSize: 14 }}>User: {displayName}</p>
            ) : (
                <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 14, marginBottom: 8 }}>表示名が未設定です</p>

                    <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="表示名（1〜24文字）"
                        className="border p-3 text-[16px] leading-5 w-full mb-2 appearance-none"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                    />

                    {nameError && (
                        <p style={{ color: '#b91c1c', fontSize: 13, margin: '0 0 8px 0' }}>
                            {nameError}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={saveDisplayName}
                        disabled={nameLoading}
                        className="rounded-xl text-base font-medium w-full"
                        style={{
                            paddingTop: 12,
                            paddingBottom: 12,
                            backgroundColor: nameLoading ? '#d1d5db' : '#111827',
                            color: '#ffffff',
                            cursor: nameLoading ? 'not-allowed' : 'pointer',
                            border: 'none',
                        }}
                    >
                        {nameLoading ? 'Saving...' : '表示名を保存'}
                    </button>
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : items.length === 0 ? (
                <p>（なし）</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((t) => (
                        <li
                            key={t.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 8px',
                                borderBottom: '1px solid #eee',
                            }}
                        >
                            {/* 行本文はタップ無効（仕様） */}
                            <span style={{ paddingRight: 12 }}>{t.log}</span>

                            {/* 右端「＞」のみ遷移 */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {status === 'raw' && (
                                    <button
                                        onClick={() => deleteTopic(t.id)}
                                        aria-label="delete"
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: 8,
                                            height: 36,
                                            padding: '0 10px',
                                        }}
                                    >
                                        削除
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (status === 'raw') router.push(`/topics/${t.id}/refine`)
                                        else router.push(`/topics/${t.id}`)
                                    }}
                                    aria-label="open"
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: 8,
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    ＞
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* Topics専用：右下 縦FAC（Raw / Ready） */}
            <div
                style={{
                    position: 'fixed',
                    right: 12,
                    bottom: 'calc(64px + env(safe-area-inset-bottom) + 8px)',
                    zIndex: 9000,
                    pointerEvents: 'none',

                    opacity: facVisible ? 1 : 0,
                    transform: facVisible ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 160ms ease, transform 160ms ease',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        pointerEvents: facVisible ? 'auto' : 'none',
                    }}
                >
                    <button
                        onClick={() => setStatus('raw')}
                        style={{
                            minWidth: 72,
                            height: 44,
                            padding: '0 12px',
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: status === 'raw' ? '#eee' : 'rgba(255,255,255,0.9)',
                            fontWeight: status === 'raw' ? 700 : 500,
                            backdropFilter: 'blur(6px)',
                        }}
                    >
                        Raw
                    </button>

                    <button
                        onClick={() => setStatus('ready')}
                        style={{
                            minWidth: 72,
                            height: 44,
                            padding: '0 12px',
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: status === 'ready' ? '#eee' : 'rgba(255,255,255,0.9)',
                            fontWeight: status === 'ready' ? 700 : 500,
                            backdropFilter: 'blur(6px)',
                        }}
                    >
                        Ready
                    </button>
                </div>
            </div>
            <BottomBar />
        </main>
    )
}