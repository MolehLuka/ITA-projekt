import { BookingsTester } from './components/BookingsTester'
import { FacilitiesTester } from './components/FacilitiesTester'
import { GatewayHealthPanel } from './components/GatewayHealthPanel'
import { MembersTester } from './components/MembersTester'
import { QuickLinksPanel } from './components/QuickLinksPanel'

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-5">
          <h1 className="mb-2 text-3xl font-semibold">
            Sports Booking Frontend Shell
          </h1>
          <p className="text-slate-600">
          Step 1 foundation: a lightweight client to validate gateways and open
          service docs quickly.
          </p>
        </header>

        <GatewayHealthPanel />
        <QuickLinksPanel />
        <MembersTester />
        <FacilitiesTester />
        <BookingsTester />
      </div>
    </main>
  )
}

export default App
