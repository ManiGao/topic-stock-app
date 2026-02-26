'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { KeyboardActionBar } from '../../../../components/KeyboardActionBar'

type TopicRow = {
    id: string
    log: string
    e: string[]
    c: string[]
    r: string[]
    s: string | null
    status: 'raw' | 'ready'
}

function clampLines(arr: string[], max: number) {
    return arr.slice(0, max)
}

export default function RefinePage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = params.id

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [topic, setTopic] = useState<TopicRow | null>(null)

    const [e, setE] = useState<string[]>([])
    const [c, setC] = useState<string[]>([])
    const [r, setR] = useState<string[]>([])
    const [s, setS] = useState('')

    const [focused, setFocused] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('topics')
                .select('id,log,e,c,r,s,status')
                .eq('id', id)
                .single()

            setLoading(false)

            if (error) {
                alert(error.message)
                return
            }

            const row = data as TopicRow
            setTopic(row)
            setE(row.e ?? [])
            setC(row.c ?? [])
            setR(row.r ?? [])
            setS(row.s ?? '')
        }

        load()
    }, [id])

    const canAddE = useMemo(() => e.length < 2, [e.length])
    const canAddC = useMemo(() => c.length < 2, [c.length])
    const canAddR = useMemo(() => r.length < 3, [r.length])

    const updateArrayItem = (arr: string[], idx: number, v: string) =>
        arr.map((x, i) => (i === idx ? v : x))

    const removeArrayItem = (arr: string[], idx: number) =>
        arr.filter((_, i) => i !== idx)

    const handleReady = async () => {
        if (!topic) return

        setSaving(true)

        const payload = {
            e: clampLines(e.map((x) => x.trim()).filter(Boolean), 2),
            c: clampLines(c.map((x) => x.trim()).filter(Boolean), 2),
            r: clampLines(r.map((x) => x.trim()).filter(Boolean), 3),
            s: s.trim() ? s.trim() : null,
            status: 'ready' as const,
        }

        const { error } = await supabase.from('topics').update(payload).eq('id', topic.id)

        setSaving(false)

        if (error) {
            alert(`保存失敗: ${error.message}`)
            return
        }

        alert('Readyにしました')
        router.push('/topics') // 一覧へ戻る
    }

    if (loading) {
        return (
            <main style={{ padding: 20 }}>
                <p>Loading...</p>
            </main>
        )
    }

    if (!topic) {
        return (
            <main style={{ padding: 20 }}>
                <p>Not found</p>
                <p><a href="/topics">Back</a></p>
            </main>
        )
    }

    return (
        <main style={{ padding: 20, maxWidth: 720, paddingBottom: 140 }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Refine</h1>

            <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 16, opacity: 0.7, marginBottom: 4 }}>log</div>
                <div>{topic.log}</div>
            </div>

            {/* E */}
            <section style={{ marginBottom: 16 }}>
                <HeaderRow title="E" right={
                    <button
                        disabled={!canAddE}
                        onClick={() => setE((p) => [...p, ''])}
                        style={{
                            width: 44,
                            height: 44,
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: 'transparent',
                            fontWeight: 700,
                        }}
                    >
                        ＋
                    </button>
                } />
                <LinesEditor
                    items={e}
                    onChange={(idx, v) => setE((p) => updateArrayItem(p, idx, v))}
                    onRemove={(idx) => setE((p) => removeArrayItem(p, idx))}
                    onFocusAny={() => setFocused(true)}
                    onBlurAny={() => setFocused(false)}
                />
                <Hint text="最大2行" />
            </section>

            {/* C */}
            <section style={{ marginBottom: 16 }}>
                <HeaderRow title="C" right={
                    <button
                        disabled={!canAddC}
                        onClick={() => setC((p) => [...p, ''])}
                        style={{
                            width: 44,
                            height: 44,
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: 'transparent',
                            fontWeight: 700,
                        }}
                    >
                        ＋
                    </button>
                } />
                <LinesEditor
                    items={c}
                    onChange={(idx, v) => setC((p) => updateArrayItem(p, idx, v))}
                    onRemove={(idx) => setC((p) => removeArrayItem(p, idx))}
                    onFocusAny={() => setFocused(true)}
                    onBlurAny={() => setFocused(false)}
                />
                <Hint text="最大2行" />
            </section>

            {/* R */}
            <section style={{ marginBottom: 16 }}>
                <HeaderRow title="R" right={
                    <button
                        disabled={!canAddR}
                        onClick={() => setR((p) => [...p, ''])}
                        style={{
                            width: 44,
                            height: 44,
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: 'transparent',
                            fontWeight: 700,
                        }}
                    >
                        ＋
                    </button>
                } />
                <LinesEditor
                    items={r}
                    onChange={(idx, v) => setR((p) => updateArrayItem(p, idx, v))}
                    onRemove={(idx) => setR((p) => removeArrayItem(p, idx))}
                    onFocusAny={() => setFocused(true)}
                    onBlurAny={() => setFocused(false)}
                />
                <Hint text="最大3行" />
            </section>

            {/* S */}
            <section style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 16 }}>S</h2>
                </div>
                <input
                    type="text"
                    value={s}
                    onChange={(ev) => setS(ev.target.value)}
                    placeholder="相手に振る一言（任意）"
                    style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </section>

            <KeyboardActionBar
                visible={true}
                left={
                    <button onClick={() => router.back()} style={{
                        height: 44,
                        padding: '0 16px',
                        border: '1px solid #ccc',
                        borderRadius: 12,
                        background: 'transparent',
                    }}>
                        戻る
                    </button>
                }
                right={
                    <button onClick={handleReady} disabled={saving} style={{
                        height: 44,
                        padding: '0 16px',
                        border: '1px solid #ccc',
                        borderRadius: 12,
                        background: '#eee',
                        fontWeight: 700,
                    }}>
                        {saving ? 'Saving...' : 'Readyにする'}
                    </button>
                }
            />
        </main>
    )
}

function HeaderRow({ title, right }: { title: string; right: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h2 style={{ fontSize: 16 }}>{title}</h2>
            {right}
        </div>
    )
}

function LinesEditor({
    items,
    onChange,
    onRemove,
    onFocusAny,
    onBlurAny,
}: {
    items: string[]
    onChange: (idx: number, v: string) => void
    onRemove: (idx: number) => void
    onFocusAny: () => void
    onBlurAny: () => void
}) {
    if (items.length === 0) return <p style={{ opacity: 0.6 }}>（なし）</p>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((v, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={v}
                        onChange={(ev) => onChange(idx, ev.target.value)}
                        style={{ flex: 1, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
                        onFocus={onFocusAny}
                        onBlur={onBlurAny}
                    />
                    <button
                        onClick={() => onRemove(idx)}
                        aria-label="remove"
                        style={{
                            width: 44,
                            height: 44,
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: 'transparent',
                            fontWeight: 700,
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}

function Hint({ text }: { text: string }) {
    return <div style={{ fontSize: 16, opacity: 0.6, marginTop: 6 }}>{text}</div>
}