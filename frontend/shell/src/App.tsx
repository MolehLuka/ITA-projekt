import { GatewayHealthPanel } from './components/GatewayHealthPanel'
import { QuickLinksPanel } from './components/QuickLinksPanel'
import { RemoteSlot } from './components/RemoteSlot'

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-5">
          <h1 className="mb-2 text-3xl font-semibold">
            Sports Booking Frontend Shell
          </h1>
          <p className="text-slate-600">
            Micro-frontend host: loads Members, Facilities, and Bookings at
            runtime via Module Federation.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Remotes: members-mfe · facilities-mfe · bookings-mfe
          </p>
        </header>

        <GatewayHealthPanel />
        <QuickLinksPanel />

        <RemoteSlot
          label="Members"
          loader={() => import('members/MembersApp')}
        />
        <RemoteSlot
          label="Facilities"
          loader={() => import('facilities/FacilitiesApp')}
        />
        <RemoteSlot
          label="Bookings"
          loader={() => import('bookings/BookingsApp')}
        />
      </div>
    </main>
  )
}

export default App
