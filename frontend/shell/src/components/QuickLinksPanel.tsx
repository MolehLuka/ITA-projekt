const endpoints = [
  {
    label: 'Members docs',
    href: '/api/members/docs/',
  },
  {
    label: 'Bookings docs',
    href: '/api/bookings/docs',
  },
  {
    label: 'Mobile gateway facilities',
    href: '/mobile/mobile/facilities',
  },
]

export function QuickLinksPanel() {
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-medium">Quick endpoint links</h2>
      <ul className="mt-2 flex flex-wrap gap-3">
        {endpoints.map((endpoint) => (
          <li key={endpoint.href}>
            <a
              href={endpoint.href}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg border border-slate-300 px-3 py-2 text-slate-900 transition hover:bg-slate-100"
            >
              {endpoint.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
