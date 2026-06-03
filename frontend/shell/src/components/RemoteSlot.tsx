import { Component, type ComponentType, type ReactNode, lazy, Suspense } from 'react'

type RemoteSlotProps = {
  label: string
  loader: () => Promise<{ default: ComponentType }>
}

type ErrorBoundaryProps = {
  children: ReactNode
  label: string
}

type ErrorBoundaryState = {
  error: string | null
}

class RemoteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }

  render() {
    if (this.state.error) {
      return (
        <section className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Failed to load {this.props.label} micro-frontend</p>
          <p className="mt-1">{this.state.error}</p>
        </section>
      )
    }

    return this.props.children
  }
}

export function RemoteSlot({ label, loader }: RemoteSlotProps) {
  const RemoteApp = lazy(loader)

  return (
    <RemoteErrorBoundary label={label}>
      <Suspense
        fallback={
          <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Loading {label} micro-frontend…
          </section>
        }
      >
        <RemoteApp />
      </Suspense>
    </RemoteErrorBoundary>
  )
}
