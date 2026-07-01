import { useEffect, useState } from 'react'
import {
  checkSupabaseHealth,
  type SupabaseHealthStatus,
} from '../shared/lib/supabase/health-check'
import { isSupabaseConfigured } from '../shared/lib/supabase/client'
import './App.css'

export function App() {
  const [health, setHealth] = useState<SupabaseHealthStatus | null>(null)

  useEffect(() => {
    void checkSupabaseHealth().then(setHealth)
  }, [])

  const envConfigured = isSupabaseConfigured()

  return (
    <main className="shell">
      <header className="shell__header">
        <p className="shell__eyebrow">Blumenthal Systems</p>
        <h1>CRM — Phase 1</h1>
        <p className="shell__lead">
          Stack and Supabase foundation. No CRM features yet.
        </p>
      </header>

      <section className="panel" aria-labelledby="status-heading">
        <h2 id="status-heading">System status</h2>
        <dl className="status-list">
          <div className="status-list__row">
            <dt>Frontend</dt>
            <dd>
              <span className="badge badge--ok">Vite + React + TypeScript</span>
            </dd>
          </div>
          <div className="status-list__row">
            <dt>Environment</dt>
            <dd>
              <span className={`badge ${envConfigured ? 'badge--ok' : 'badge--warn'}`}>
                {envConfigured ? 'VITE_SUPABASE_* configured' : 'Missing .env.local'}
              </span>
            </dd>
          </div>
          <div className="status-list__row">
            <dt>Supabase</dt>
            <dd>
              {health ? (
                <span
                  className={`badge ${
                    health.state === 'connected'
                      ? 'badge--ok'
                      : health.state === 'missing_env'
                        ? 'badge--warn'
                        : 'badge--error'
                  }`}
                >
                  {health.message}
                </span>
              ) : (
                <span className="badge badge--neutral">Checking…</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel panel--muted">
        <h2>Local setup</h2>
        <ol className="setup-steps">
          <li>
            <code>pnpm install</code>
          </li>
          <li>
            <code>pnpm db:start</code> (requires Docker + Supabase CLI)
          </li>
          <li>Copy keys from CLI output into <code>.env.local</code></li>
          <li>
            <code>pnpm dev</code>
          </li>
        </ol>
      </section>
    </main>
  )
}
