'use client'
// Profile fields backed by real auth data (name/email/role) are loaded from the
// clausio_user record saved at login. There is no /api/settings/profile endpoint yet,
// so the remaining fields are stored locally under clausio_profile_extra.

import { useState, useEffect } from 'react'

interface ExtraProfile {
  phone: string
  barCouncilNumber: string
  lawFirm: string
  designation: string
  experience: string
  city: string
  country: string
  language: string
  timeZone: string
  website: string
}

const EXTRA_KEY = 'clausio_profile_extra'

const defaultExtra: ExtraProfile = {
  phone: '', barCouncilNumber: '', lawFirm: '', designation: '',
  experience: '', city: '', country: '', language: 'English',
  timeZone: 'Asia/Kolkata', website: '',
}

export default function ProfileSettings() {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [extra,     setExtra]     = useState<ExtraProfile>(defaultExtra)
  const [saved,     setSaved]     = useState(false)

  useEffect(() => {
    const userRaw = localStorage.getItem('clausio_user')
    if (userRaw) {
      const user = JSON.parse(userRaw)
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setEmail(user.email ?? '')
      setExtra(prev => ({ ...prev, designation: user.role ?? '' }))
    }
    const extraRaw = localStorage.getItem(EXTRA_KEY)
    if (extraRaw) setExtra(prev => ({ ...prev, ...JSON.parse(extraRaw) }))
  }, [])

  function updateExtra(field: keyof ExtraProfile, value: string) {
    setExtra(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    const userRaw = localStorage.getItem('clausio_user')
    if (userRaw) {
      const user = JSON.parse(userRaw)
      localStorage.setItem('clausio_user', JSON.stringify({ ...user, firstName, lastName, email }))
    }
    localStorage.setItem(EXTRA_KEY, JSON.stringify(extra))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fullName = `${firstName} ${lastName}`.trim() || 'Your name'
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '—'

  return (
    <div>

      {/* Header */}

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Profile</h2>
        <p style={{ marginTop: 6, color: '#64748b', fontSize: 14 }}>
          Manage your personal information and professional profile.
        </p>
      </div>

      {saved && (
        <div style={{ marginBottom: 20, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, color: '#15803d' }}>
          ✓ Profile saved successfully.
        </div>
      )}

      {/* Profile Card */}

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, border: '1px solid #e2e8f0', borderRadius: 14, background: '#f8fafc', marginBottom: 28 }}>
        <div style={{ width: 82, height: 82, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 26 }}>
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: 22 }}>{fullName}</h3>
          <p style={{ marginTop: 6, color: '#64748b' }}>
            {extra.designation || 'Advocate'}{extra.lawFirm ? ` • ${extra.lawFirm}` : ''}
          </p>
        </div>
      </div>

      {/* Form */}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Input label="First Name" value={firstName} onChange={v => { setFirstName(v); setSaved(false) }} />
        <Input label="Last Name"  value={lastName}  onChange={v => { setLastName(v); setSaved(false) }} />
        <Input label="Email" value={email} onChange={v => { setEmail(v); setSaved(false) }} />
        <Input label="Phone Number" value={extra.phone} onChange={v => updateExtra('phone', v)} />
        <Input label="Bar Council Number" value={extra.barCouncilNumber} onChange={v => updateExtra('barCouncilNumber', v)} />
        <Input label="Law Firm" value={extra.lawFirm} onChange={v => updateExtra('lawFirm', v)} />
        <Input label="Designation" value={extra.designation} onChange={v => updateExtra('designation', v)} />
        <Input label="Experience" value={extra.experience} onChange={v => updateExtra('experience', v)} />
        <Input label="City" value={extra.city} onChange={v => updateExtra('city', v)} />
        <Input label="Country" value={extra.country} onChange={v => updateExtra('country', v)} />
        <Input label="Language" value={extra.language} onChange={v => updateExtra('language', v)} />
        <Input label="Time Zone" value={extra.timeZone} onChange={v => updateExtra('timeZone', v)} />
        <Input label="Website" value={extra.website} onChange={v => updateExtra('website', v)} />
      </div>

      {/* Save */}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <button
          onClick={handleSave}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          <i className="ti ti-device-floppy" style={{ marginRight: 8 }} />
          Save Profile
        </button>
      </div>

    </div>
  )
}

interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function Input({ label, value, onChange }: InputProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
        {label}
      </label>

      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          height: 42,
          border: '1px solid #dbe3ef',
          borderRadius: 10,
          padding: '0 14px',
          fontSize: 14,
          outline: 'none',
          background: '#fff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
