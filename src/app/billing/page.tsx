'use client'

import { useState } from 'react'

import BillingTabs from '@/components/billing/BillingTabs'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', margin: '16px', padding: 20, borderRadius: 24 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Billing & Finance
          </h1>
          <p style={{ marginTop: 4, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
            Manage invoices, payments, subscriptions and law firm finances.
          </p>
        </div>
      </div>

      {/* ================= TABS ================= */}

      <BillingTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ================= CONTENT — coming soon for every tab ================= */}

      <div
        className="glass-card"
        style={{
          marginTop: 24,
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            marginBottom: 16,
          }}
        >
          <i className="ti ti-receipt-2" />
        </div>

        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.3px' }}>
          {activeTab} — Coming Soon
        </h2>

        <p style={{ maxWidth: 420, margin: '8px auto 0', color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
          Billing & finance features are being built and will be connected to your workspace soon.
        </p>
      </div>
    </div>
  )
}
