'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { BottomBar } from '../../../components/BottomBar'

type TopicRow = {
  id: string
  log: string
  e: string[]
  c: string[]
  r: string[]
  s: string | null
  status: 'raw' | 'ready'
  created_at: string
  ready_at: string | null
}

export default function TopicDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState<TopicRow | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('topics')
        .select('id,log,e,c,r,s,status,created_at,ready_at')
        .eq('id', id)
        .single()

      setLoading(false)

      if (error) {
        alert(error.message)
        return
      }

      setTopic(data as TopicRow)
    }

    load()
  }, [id])

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
    <main style={{ padding: 20, maxWidth: 720, paddingBottom: 180 }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Detail</h1>

      <Card title="log">
        <div>{topic.log}</div>
      </Card>

      <Card title="E">
        <LinesView items={topic.e} />
      </Card>

      <Card title="C">
        <LinesView items={topic.c} />
      </Card>

      <Card title="R">
        <LinesView items={topic.r} />
      </Card>

      <Card title="S">
        <div>{topic.s ? topic.s : '（なし）'}</div>
      </Card>

      {/* アクション */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          onClick={() => router.push('/topics')}
          style={{
            height: 44,
            padding: '0 16px',
            border: '1px solid #ccc',
            borderRadius: 12,
            background: 'transparent',
          }}
        >
          一覧へ
        </button>

        <button
          onClick={() => router.push(`/topics/${topic.id}/refine`)}
          style={{
            height: 44,
            padding: '0 16px',
            border: '1px solid #ccc',
            borderRadius: 12,
            background: '#eee',
            marginLeft: 'auto',
            fontWeight: 700,
          }}
        >
          編集
        </button>
      </div>
      <BottomBar />
    </main>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: 12,
        border: '1px solid #eee',
        borderRadius: 8,
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  )
}

function LinesView({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <div>（なし）</div>
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  )
}