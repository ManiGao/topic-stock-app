'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { BottomBar } from '../../components/BottomBar'

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
    const [email, setEmail] = useState<string | null>(null)
    const [items, setItems] = useState<Topic[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

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
            setEmail(data.session?.user?.email ?? null)
        })
    }, [])

    useEffect(() => {
        load(status)
    }, [status])

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

    if (!email) {
        return (
            <main style={{ padding: 20 }}>
                <h1>Not logged in</h1>
                <p><a href="/login">Go to Login</a></p>
            </main>
        )
    }

    return (
        <main style={{ padding: 20, maxWidth: 640, paddingBottom: 260 }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Topics</h1>
            <p style={{ marginBottom: 16 }}>Logged in as: {email}</p>

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