'use client'
// Login page — visible at /auth/login
import { authApi } from '@/lib/api'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(email, password)

      // ✅ Save to cookie — for middleware auth guard
      document.cookie = `clausio_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left — dark panel */}
      <div style={{ width: '46%', background: '#060d1f', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48 }}>
        <div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>Clausio</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, marginTop: 4 }}>LEGAL INTELLIGENCE PLATFORM</p>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.5, maxWidth: 300 }}>
          From information chaos to{' '}
          <span style={{ color: '#f59e0b' }}>litigation clarity</span>
        </h1>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'AI-powered petition drafting',
            'Full case lifecycle management',
            'Hearing diary with deadline alerts',
            '6 practice areas — Family, Criminal, GST, IT, Civil, Labour',
          ].map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#64748b' }}>
              <i className="ti ti-check" style={{ color: '#f59e0b', flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Right — login form */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Enter your credentials to continue.</p>

          {/* Error message */}
          {error && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 7, fontSize: 12, color: '#dc2626', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 14 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 4 }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="advocate@lawfirm.com"
                required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 4 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', background: loading ? '#64748b' : '#1e3a8a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}