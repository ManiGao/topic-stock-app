'use client'

import { useEffect, useMemo, useState } from 'react'

function getKeyboardInset() {
  // iOS Safari / Chrome(iOS) で有効。未対応環境は 0。
  const vv = window.visualViewport
  if (!vv) return 0

  // innerHeight と visualViewport.height の差分が概ねキーボード領域
  const inset = window.innerHeight - vv.height - vv.offsetTop
  return Math.max(0, Math.round(inset))
}

export function KeyboardActionBar({
  visible,
  left,
  right,
}: {
  visible: boolean
  left?: React.ReactNode
  right: React.ReactNode
}) {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const onChange = () => setInset(getKeyboardInset())

    // 初期
    onChange()

    vv.addEventListener('resize', onChange)
    vv.addEventListener('scroll', onChange)
    window.addEventListener('resize', onChange)

    return () => {
      vv.removeEventListener('resize', onChange)
      vv.removeEventListener('scroll', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  const style = useMemo<React.CSSProperties>(() => {
    // inset が 0 のときは画面下。inset>0 のときはキーボードの上へ押し上げる。
    return {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: inset,
      padding: '10px 12px',
      borderTop: '1px solid #e5e5e5',
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(8px)',
      display: visible ? 'flex' : 'none',
      gap: 8,
      alignItems: 'center',
      zIndex: 9999,
      // iPhoneのホームバー安全域
      paddingBottom: `calc(10px + env(safe-area-inset-bottom))`,
    }
  }, [inset, visible])

  return (
    <div style={style}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {left}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        {right}
      </div>
    </div>
  )
}