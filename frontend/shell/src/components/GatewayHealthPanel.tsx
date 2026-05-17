import { useState } from 'react'

type HealthState = {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message: string
}

const statusBorderClass: Record<HealthState['status'], string> = {
  idle: 'border-slate-200',
  loading: 'border-blue-600',
  ok: 'border-green-600',
  error: 'border-red-600',
}

export function GatewayHealthPanel() {
  const [apiGateway, setApiGateway] = useState<HealthState>({
    status: 'idle',
    message: 'Not checked yet',
  })
  const [mobileGateway, setMobileGateway] = useState<HealthState>({
    status: 'idle',
    message: 'Not checked yet',
  })

  const checkApiGateway = async () => {
    setApiGateway({ status: 'loading', message: 'Checking /api/health...' })
    try {
      const response = await fetch('/api/health')
      const text = await response.text()
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      setApiGateway({ status: 'ok', message: text })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setApiGateway({ status: 'error', message })
    }
  }

  const checkMobileGateway = async () => {
    setMobileGateway({
      status: 'loading',
      message: 'Checking /mobile/mobile/health...',
    })
    try {
      const response = await fetch('/mobile/mobile/health')
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      setMobileGateway({
        status: 'ok',
        message: `${payload.service}: ${payload.status}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setMobileGateway({ status: 'error', message })
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-medium">Gateway health checks</h2>
      <div className="mb-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkApiGateway}
          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
        >
          Check API Gateway
        </button>
        <button
          type="button"
          onClick={checkMobileGateway}
          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
        >
          Check Mobile Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article
          className={`rounded-lg border p-3 ${statusBorderClass[apiGateway.status]}`}
        >
          <h3 className="mb-1 text-lg font-medium">API Gateway</h3>
          <p className="text-sm text-slate-700">{apiGateway.message}</p>
        </article>
        <article
          className={`rounded-lg border p-3 ${statusBorderClass[mobileGateway.status]}`}
        >
          <h3 className="mb-1 text-lg font-medium">Mobile Gateway</h3>
          <p className="text-sm text-slate-700">{mobileGateway.message}</p>
        </article>
      </div>
    </section>
  )
}
