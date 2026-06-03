import { useState } from 'react'

type ApiResult = {
  title: string
  status: number | 'network'
  body: unknown
}

export function FacilitiesTester() {
  const [result, setResult] = useState<ApiResult | null>(null)
  const [createFacilityForm, setCreateFacilityForm] = useState({
    name: '',
    type: '',
    capacity: '',
    location: '',
  })
  const [facilityId, setFacilityId] = useState('')
  const [slotsDate, setSlotsDate] = useState('')
  const [createSlotForm, setCreateSlotForm] = useState({
    startTime: '',
    endTime: '',
    isAvailable: true,
  })

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

  const listFacilities = async () => {
    await requestJson('GET /mobile/mobile/facilities', '/mobile/mobile/facilities')
  }

  const createFacility = async () => {
    await requestJson('POST /mobile/mobile/facilities', '/mobile/mobile/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...createFacilityForm,
        capacity: Number(createFacilityForm.capacity),
      }),
    })
  }

  const getFacilityById = async () => {
    await requestJson(
      `GET /mobile/mobile/facilities/${facilityId}`,
      `/mobile/mobile/facilities/${facilityId}`,
    )
  }

  const listSlots = async () => {
    await requestJson(
      `GET /mobile/mobile/facilities/${facilityId}/slots?date=${slotsDate}`,
      `/mobile/mobile/facilities/${facilityId}/slots?date=${encodeURIComponent(slotsDate)}`,
    )
  }

  const createSlot = async () => {
    await requestJson(
      `POST /mobile/mobile/facilities/${facilityId}/slots`,
      `/mobile/mobile/facilities/${facilityId}/slots`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createSlotForm),
      },
    )
  }

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-medium">Facilities endpoint tester</h2>

      <div className="rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Facilities</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={listFacilities}
            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
          >
            GET /mobile/facilities
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-4">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="name"
            value={createFacilityForm.name}
            onChange={(event) =>
              setCreateFacilityForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="type"
            value={createFacilityForm.type}
            onChange={(event) =>
              setCreateFacilityForm((prev) => ({ ...prev, type: event.target.value }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="capacity"
            value={createFacilityForm.capacity}
            onChange={(event) =>
              setCreateFacilityForm((prev) => ({ ...prev, capacity: event.target.value }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="location"
            value={createFacilityForm.location}
            onChange={(event) =>
              setCreateFacilityForm((prev) => ({
                ...prev,
                location: event.target.value,
              }))
            }
          />
        </div>
        <button
          type="button"
          onClick={createFacility}
          className="mt-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
        >
          POST /mobile/facilities
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Facility by ID + slots</h3>
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-72 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="facility id"
            value={facilityId}
            onChange={(event) => setFacilityId(event.target.value)}
          />
          <button
            type="button"
            onClick={getFacilityById}
            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
          >
            GET /mobile/facilities/:id
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="min-w-72 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="date (YYYY-MM-DD)"
            value={slotsDate}
            onChange={(event) => setSlotsDate(event.target.value)}
          />
          <button
            type="button"
            onClick={listSlots}
            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
          >
            GET /mobile/facilities/:id/slots
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="startTime (ISO)"
            value={createSlotForm.startTime}
            onChange={(event) =>
              setCreateSlotForm((prev) => ({ ...prev, startTime: event.target.value }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="endTime (ISO)"
            value={createSlotForm.endTime}
            onChange={(event) =>
              setCreateSlotForm((prev) => ({ ...prev, endTime: event.target.value }))
            }
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={createSlotForm.isAvailable}
              onChange={(event) =>
                setCreateSlotForm((prev) => ({
                  ...prev,
                  isAvailable: event.target.checked,
                }))
              }
            />
            isAvailable
          </label>
        </div>
        <button
          type="button"
          onClick={createSlot}
          className="mt-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
        >
          POST /mobile/facilities/:id/slots
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <h3 className="mb-2 text-lg font-medium">Last API response</h3>
        {result ? (
          <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-600">
            No calls made yet in Facilities tester.
          </p>
        )}
      </div>
    </section>
  )
}
