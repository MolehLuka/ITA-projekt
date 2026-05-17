import { useState } from 'react'

type ApiResult = {
  title: string
  status: number | 'network'
  body: unknown
}

const TOKEN_STORAGE_KEY = 'members_jwt_token'

export function BookingsTester() {
  const [token, setToken] = useState<string>(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) ?? '',
  )
  const [result, setResult] = useState<ApiResult | null>(null)
  const [createForm, setCreateForm] = useState({
    facilityId: '',
    startTime: '',
    endTime: '',
  })
  const [bookingId, setBookingId] = useState('')

  const authHeaders = (): HeadersInit | undefined =>
    token ? { Authorization: `Bearer ${token}` } : undefined

  const requestJson = async (
    title: string,
    url: string,
    init?: RequestInit,
  ): Promise<{ response: Response; payload: unknown }> => {
    try {
      const response = await fetch(url, init)
      const raw = await response.text()
      let payload: unknown = raw
      try {
        payload = raw ? JSON.parse(raw) : null
      } catch {
        payload = raw
      }
      setResult({ title, status: response.status, body: payload })
      return { response, payload }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setResult({ title, status: 'network', body: { message } })
      throw error
    }
  }

  const createBooking = async () => {
    await requestJson('POST /api/bookings', '/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        facilityId: createForm.facilityId,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
      }),
    })
  }

  const listBookings = async () => {
    await requestJson('GET /api/bookings', '/api/bookings', {
      headers: authHeaders(),
    })
  }

  const cancelBooking = async () => {
    await requestJson(
      `DELETE /api/bookings/${bookingId}`,
      `/api/bookings/${bookingId}`,
      {
        method: 'DELETE',
        headers: authHeaders(),
      },
    )
  }

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-medium">Bookings endpoint tester</h2>
      <p className="mb-3 text-sm text-slate-600">
        Uses the JWT from Members (register/login). Same secret as bookings
        service.
      </p>

      <div className="rounded-lg border border-slate-200 p-3">
        <label className="mb-1 block text-sm font-medium">JWT token</label>
        <textarea
          value={token}
          onChange={(event) => {
            setToken(event.target.value)
            if (event.target.value) {
              localStorage.setItem(TOKEN_STORAGE_KEY, event.target.value)
            } else {
              localStorage.removeItem(TOKEN_STORAGE_KEY)
            }
          }}
          className="h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Log in via Members tester first..."
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Create booking</h3>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="facilityId (UUID)"
            value={createForm.facilityId}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                facilityId: event.target.value,
              }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="startTime (ISO, e.g. 2026-05-08T10:00:00Z)"
            value={createForm.startTime}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                startTime: event.target.value,
              }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="endTime (ISO)"
            value={createForm.endTime}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                endTime: event.target.value,
              }))
            }
          />
        </div>
        <button
          type="button"
          onClick={createBooking}
          className="mt-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
        >
          POST /bookings
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">List &amp; cancel</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={listBookings}
            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
          >
            GET /bookings
          </button>
          <input
            className="min-w-72 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="booking UUID"
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
          />
          <button
            type="button"
            onClick={cancelBooking}
            className="rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"
          >
            DELETE /bookings/:id
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Last API response</h3>
        {result ? (
          <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-600">
            No calls made yet in Bookings tester.
          </p>
        )}
      </div>
    </section>
  )
}
