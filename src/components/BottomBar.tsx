'use client'

import { usePathname } from 'next/navigation'

function isActive(pathname: string, href: string) {
  if (href === '/topics') return pathname === '/' || pathname.startsWith('/topics')
  return pathname === href
}

export function BottomBar() {
  const pathname = usePathname()

  const items = [
    { href: '/topics', label: 'Topics' },
    { href: '/capture', label: 'Capture' },
  ] as const

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9000,
        borderTop: '1px solid #e5e5e5',
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(8px)',
        paddingBottom: `calc(10px + env(safe-area-inset-bottom))`,
        paddingTop: 10,
      }}
      aria-label="Bottom navigation"
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 12px',
        }}
      >
        {items.map((it) => {
          const active = isActive(pathname, it.href)
          return (
            <a
              key={it.href}
              href={it.href}
              style={{
                flex: 1,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ccc',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: active ? 700 : 500,
                background: active ? '#eee' : 'transparent',
              }}
            >
              {it.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}